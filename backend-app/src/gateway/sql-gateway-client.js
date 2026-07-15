import http from 'node:http';
import https from 'node:https';
import axios from 'axios';
import { HttpError } from '../shared/http-error.js';

function headersFor(authorization, extra = {}) {
  return authorization ? { ...extra, Authorization: authorization } : { ...extra };
}

function recordsFrom(response) {
  if (Array.isArray(response)) return response;
  if (!response) return [];
  return response.records || response.Records || response.list || response.List || response.data || [];
}

function actionResultFrom(response) {
  if (!response) return null;
  if (response.code !== undefined) return response;
  return recordsFrom(response)[0] || null;
}

function normalizeMessage(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function gatewayBusinessError(data, context) {
  if (!data || data.code === undefined || Number(data.code) === 0) return null;
  const message = normalizeMessage(data.msg || data.message);
  const details = { causeCode: String(data.code), operation: context.operation, list: context.list };
  if (Number(data.code) === 2 || /phien lam viec|dang nhap|xac thuc|auth|token|unauthorized/.test(message)) {
    return new HttpError(401, 'SQL_GATEWAY_AUTH_FAILED', 'SQL API authentication is required.', details);
  }
  if (/khong co quyen|khong duoc phep|forbidden|permission|access denied/.test(message)) {
    return new HttpError(403, 'SQL_GATEWAY_FORBIDDEN', 'SQL API denied access to this operation.', details);
  }
  return null;
}

export function classifyGatewayError(error) {
  const code = error && error.code ? String(error.code) : '';
  const status = error && error.response ? Number(error.response.status) : null;
  if (['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ECONNABORTED', 'EAI_AGAIN', 'ENOTFOUND', 'ERR_NETWORK'].includes(code)) {
    return { retryable: true, category: 'network', code: code || 'SQL_GATEWAY_NETWORK_ERROR', status };
  }
  if ([502, 503, 504].includes(status)) {
    return { retryable: true, category: 'upstream', code: 'SQL_GATEWAY_TEMPORARY_FAILURE', status };
  }
  if ([401, 403].includes(status)) {
    return { retryable: false, category: 'authorization', code: 'SQL_GATEWAY_AUTH_FAILED', status };
  }
  return { retryable: false, category: 'unknown', code: code || 'SQL_GATEWAY_ERROR', status };
}

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

export class SqlGatewayClient {
  constructor(config) {
    if (!config || !config.baseUrl) throw new Error('SQL_API_BASE is not configured.');
    this.baseUrl = String(config.baseUrl).replace(/\/+$/, '');
    this.defaultUser = config.defaultUser || 'admin';
    this.timeoutMs = Number(config.timeoutMs ?? 30000);
    this.retryCount = Number(config.retryCount ?? 2);
    this.retryBaseDelayMs = Number(config.retryBaseDelayMs ?? 300);
    this.maxGetUrlLength = Number(config.maxGetUrlLength ?? 7000);
    this.production = Boolean(config.production);
    this.logger = config.logger || console;
    this.random = config.random || Math.random;
    const keepAlive = config.keepAlive !== false;
    this.httpAgent = new http.Agent({ keepAlive, maxSockets: 50, maxFreeSockets: 10 });
    this.httpsAgent = new https.Agent({ keepAlive, maxSockets: 50, maxFreeSockets: 10 });
    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeoutMs,
      maxRedirects: 5,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      httpAgent: this.httpAgent,
      httpsAgent: this.httpsAgent,
      validateStatus: (status) => status >= 200 && status < 500
    });
  }

  buildViewPayload(listName, params = {}) {
    const payload = {
      List: listName,
      Func: 'View',
      UserName: params.UserName || this.defaultUser,
      Keyword: params.Keyword || '',
      Page: params.Page || 1,
      Limit: params.Limit || 1000,
      JsonData: JSON.stringify(params.JsonData || params)
    };
    Object.keys(params).forEach((key) => { if (payload[key] === undefined) payload[key] = params[key]; });
    return payload;
  }

  async xem(listName, params = {}, authorization, options = {}) {
    const payload = this.buildViewPayload(listName, params);
    const query = encodeURIComponent(JSON.stringify(payload));
    const path = `/api/API_Gateway_Router?q=${query}`;
    if ((this.baseUrl + path).length > this.maxGetUrlLength) {
      throw new HttpError(400, 'SQL_GATEWAY_QUERY_TOO_LARGE', 'SQL Gateway View query exceeds the configured URL limit.', {
        operation: 'View', list: listName
      });
    }
    return this.requestRead({ method: 'get', path, authorization, operation: 'View', list: listName, ...options });
  }

  async thaoTac(listName, func, data, userName, authorization, options = {}) {
    const payload = { List: listName, Func: func, UserName: userName || this.defaultUser, JsonData: JSON.stringify(data || {}) };
    const retries = options.retryOnNetwork ? Math.max(0, Number(options.retryCount ?? 1)) : 0;
    const startedAt = Date.now();
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await this.http.post('/api/API_Gateway_Router', payload, {
          headers: headersFor(authorization), timeout: options.timeoutMs || this.timeoutMs
        });
        if (response.status >= 400) throw Object.assign(new Error(`SQL Gateway returned HTTP ${response.status}.`), { response });
        const businessError = gatewayBusinessError(response.data, { operation: func, list: listName });
        if (businessError) throw businessError;
        return response.data;
      } catch (error) {
        lastError = error;
        const kind = classifyGatewayError(error);
        if (!options.retryOnNetwork || !kind.retryable || attempt >= retries) break;
        const delayMs = this.retryBaseDelayMs * (2 ** attempt);
        this.logger.warn(`[SQL GATEWAY] ${func} ${listName} failed cause=${kind.code} attempt=${attempt + 1}/${retries + 1} retryInMs=${delayMs}`);
        await sleep(delayMs);
      }
    }
    throw this.toHttpError(lastError, { operation: func, list: listName, attemptCount: retries + 1, durationMs: Date.now() - startedAt }, false);
  }

  async getEndpoint(path, authorization, options = {}) {
    return this.requestRead({ method: 'get', path, authorization, operation: 'GET', list: path, ...options });
  }

  async postEndpoint(path, body, authorization, options = {}) {
    if (options.readOnly) {
      return this.requestRead({ method: 'post', path, body, authorization, operation: 'POST', list: path, ...options });
    }
    try {
      const response = await this.http.post(path, body, { headers: headersFor(authorization), timeout: options.timeoutMs || this.timeoutMs });
      if (response.status >= 400) throw Object.assign(new Error(`SQL Gateway returned HTTP ${response.status}.`), { response });
      const businessError = gatewayBusinessError(response.data, { operation: 'POST', list: path });
      if (businessError) throw businessError;
      return response.data;
    } catch (error) {
      throw this.toHttpError(error, { operation: 'POST', list: path, attemptCount: 1 }, false);
    }
  }

  async requestRead({ method, path, body, authorization, operation, list, requestId, retryCount }) {
    const retries = retryCount === undefined ? this.retryCount : retryCount;
    const startedAt = Date.now();
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await this.http.request({ method, url: path, data: body, headers: headersFor(authorization) });
        if (response.status >= 400) throw Object.assign(new Error(`SQL Gateway returned HTTP ${response.status}.`), { response });
        const businessError = gatewayBusinessError(response.data, { operation, list });
        if (businessError) throw businessError;
        return response.data;
      } catch (error) {
        lastError = error;
        const kind = classifyGatewayError(error);
        if (!kind.retryable || attempt >= retries) break;
        const delayMs = this.retryBaseDelayMs * (2 ** attempt) + Math.floor(this.random() * this.retryBaseDelayMs);
        this.logger.warn(`[SQL GATEWAY] ${operation} ${list} failed cause=${kind.code} attempt=${attempt + 1}/${retries + 1} retryInMs=${delayMs} requestId=${requestId || '-'}`);
        await sleep(delayMs);
      }
    }
    throw this.toHttpError(lastError, {
      operation, list, requestId, attemptCount: retries + 1, durationMs: Date.now() - startedAt
    }, true);
  }

  toHttpError(error, context, readOperation) {
    if (error instanceof HttpError) return error;
    const kind = classifyGatewayError(error);
    const authorizationError = kind.status === 401 || kind.status === 403;
    const status = authorizationError ? kind.status : (readOperation && kind.retryable ? 503 : 502);
    const code = kind.status === 401
      ? 'SQL_GATEWAY_AUTH_FAILED'
      : kind.status === 403
        ? 'SQL_GATEWAY_FORBIDDEN'
        : (readOperation && kind.retryable ? 'SQL_GATEWAY_UNAVAILABLE' : 'SQL_GATEWAY_ACTION_FAILED');
    const details = { causeCode: kind.code, operation: context.operation, list: context.list, requestId: context.requestId };
    if (!this.production) {
      details.upstreamOrigin = this.baseUrl;
      details.attemptCount = context.attemptCount;
      details.durationMs = context.durationMs;
    }
    return new HttpError(status, code, code === 'SQL_GATEWAY_UNAVAILABLE'
      ? 'Cannot connect to SQL API. Please try again.'
      : `SQL Gateway ${context.operation} failed.`, details);
  }

  async probe(authorization, options = {}) {
    const startedAt = Date.now();
    const { userName, ...requestOptions } = options;
    await this.xem('HR_HopDongAddfile', {
      Keyword: 'WA_HopDongLaoDongFrm', Limit: 1, UserName: userName || this.defaultUser
    }, authorization, requestOptions);
    return { ok: true, latencyMs: Date.now() - startedAt };
  }

  close() {
    this.httpAgent.destroy();
    this.httpsAgent.destroy();
  }

  layDanhSachBanGhi(response) { return recordsFrom(response); }
  layKetQuaThaoTac(response) { return actionResultFrom(response); }
}
