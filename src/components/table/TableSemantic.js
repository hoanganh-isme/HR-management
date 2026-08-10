/**
 * Shared metadata-driven presentation for UITable, Tabulator and mobile tables.
 * It never mutates row data: semantic markup is presentation-only.
 */
var TableSemantic = (function () {
  var ROLES = {
    'default': true,
    'primary-identifier': true,
    'secondary-identifier': true,
    'person': true,
    'status': true,
    'category': true,
    'boolean': true,
    'date': true,
    'datetime': true,
    'time': true,
    'period': true,
    'metric': true,
    'currency': true,
    'percentage': true,
    'contact': true,
    'note': true,
    'reason': true,
    'sensitive': true,
    'selection': true,
    'action': true
  };

  // Field-name aliases live here so table renderers never duplicate captions.
  var VOCABULARY = Object.freeze({
    person: [
      'fullname', 'hoten', 'hovaten', 'personname', 'employeename',
      'staffname', 'tennhanvien', 'tennguoidung', 'approvername',
      'creatorname', 'nguoitao', 'nguoiduyet'
    ],
    status: [
      'status', 'state', 'trangthai', 'approvalstatus', 'workflowstatus'
    ],
    identifier: [
      'id', 'code', 'ma', 'manhanvien', 'manv', 'employeecode',
      'employeeid', 'personid', 'personcode', 'documentno', 'contractno',
      'sohopdong', 'machungtu'
    ],
    category: [
      'type', 'category', 'group', 'department', 'departmentname', 'bophan',
      'branch', 'branchname', 'chinhanh', 'team', 'position', 'chucvu',
      'title', 'chucdanh', 'contracttype', 'loaithongtin', 'loaidulieu',
      'loainghi', 'loaitailieu'
    ],
    date: [
      'date', 'ngay', 'birthday', 'ngaysinh', 'createddate', 'modifieddate',
      'ngaynhanviec', 'startdate', 'enddate'
    ],
    datetime: [
      'datetime', 'createdat', 'updatedat', 'modifiedat', 'thoidiem'
    ],
    time: [
      'time', 'gio', 'giovao', 'giora', 'checkin', 'checkout',
      'thoigianvao', 'thoigianra'
    ],
    period: [
      'period', 'periodid', 'periodkeyid', 'ky', 'month', 'thang', 'year', 'nam'
    ],
    contact: [
      'email', 'phone', 'mobile', 'dienthoai', 'sodienthoai'
    ],
    note: [
      'note', 'ghichu', 'description', 'mota', 'remark'
    ],
    reason: [
      'reason', 'lydo', 'reasontext'
    ],
    sensitive: [
      'cccd', 'cmnd', 'idcard', 'identitycard', 'cancuoccongdan'
    ],
    metric: [
      'count', 'total', 'tong', 'soluong', 'songay', 'sogio', 'sophut',
      'amount', 'quantity'
    ],
    currency: [
      'money', 'currency', 'sotien', 'tongtien', 'luong', 'salary'
    ],
    percentage: [
      'percentage', 'percent', 'tyle', 'phantram'
    ]
  });

  var CATEGORY_TONES = Object.freeze([
    'blue', 'indigo', 'violet', 'cyan', 'teal', 'green', 'amber', 'rose', 'slate'
  ]);

  var STATUS_REGISTRY = Object.freeze({
    danger: [
      'rejected', 'cancelled', 'failed', 'expired', 'inactive', 'deleted',
      'tuchoi', 'huy', 'nghiviec', 'quahan', 'khongdat'
    ],
    warning: [
      'pending', 'requested', 'waiting', 'draft', 'choduyet', 'dangxuly',
      'thuviec', 'saphethan', 'tamhoan'
    ],
    info: [
      'processing', 'submitted', 'inprogress', 'dangthuchien', 'dagui'
    ],
    success: [
      'approved', 'active', 'completed', 'valid', 'success', 'daduyet',
      'danghoatdong', 'hoanthanh', 'chinhthuc', 'dugiocong', 'dat'
    ]
  });

  function normalizeText(value) {
    var text = String(value == null ? '' : value)
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[\u0111\u0110]/g, 'd');
    if (typeof text.normalize === 'function') {
      text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  function stableHash(value) {
    var text = normalizeText(value);
    var hash = 0;
    for (var i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }

  function safeMap(value) {
    if (!value) return null;
    if (typeof value === 'object' && !Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        var parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
      } catch (ignore) { }
    }
    return null;
  }

  function mapValue(map, value) {
    if (!map) return undefined;
    var rawKey = String(value == null ? '' : value);
    if (Object.prototype.hasOwnProperty.call(map, rawKey)) return map[rawKey];
    var normalizedKey = normalizeText(rawKey);
    var keys = Object.keys(map);
    for (var i = 0; i < keys.length; i++) {
      if (normalizeText(keys[i]) === normalizedKey) return map[keys[i]];
    }
    return undefined;
  }

  function metadataFlag(value) {
    return value === true || value === 1 || String(value || '').toLowerCase() === 'true' || String(value || '') === '1';
  }

  function matchesVocabulary(value, groupName) {
    var normalized = normalizeText(value);
    if (!normalized) return false;
    var aliases = VOCABULARY[groupName] || [];
    return aliases.some(function (alias) {
      if (normalized === alias) return true;
      return alias.length >= 4 && (normalized.indexOf(alias) === 0 || normalized.lastIndexOf(alias) === normalized.length - alias.length);
    });
  }

  function matchesField(name, label, groupName) {
    return matchesVocabulary(name, groupName) || matchesVocabulary(label, groupName);
  }

  function normalizeRole(value) {
    var role = String(value || '').trim().toLowerCase().replace(/_/g, '-');
    return ROLES[role] ? role : '';
  }

  function defaultVariant(role) {
    if (role === 'person') return 'avatar';
    if (role === 'status' || role === 'boolean') return 'badge';
    if (role === 'category' || role === 'period') return 'chip';
    return 'text';
  }

  function inferRole(metadata, fieldName, label, sampleValues) {
    var explicitRole = normalizeRole(metadata.semanticRole || metadata.SemanticRole);
    if (explicitRole) return explicitRole;

    if (metadataFlag(metadata.isSensitiveOrDenied) || metadataFlag(metadata.IsSensitiveOrDenied)) return 'sensitive';

    var normalizedName = normalizeText(fieldName);
    if (normalizedName === 'rowselect' || normalizedName === 'selection' || normalizedName === 'checkbox') return 'selection';
    if (normalizedName === 'action' || normalizedName === 'actions' || normalizedName === 'actioncolumn') return 'action';
    if (metadataFlag(metadata.isPrimaryKey) || metadataFlag(metadata.IsPrimaryKey)
      || metadataFlag(metadata.isIdentity) || metadataFlag(metadata.IsIdentity)) return 'primary-identifier';

    var rule = normalizeText(metadata.semanticRenderRule || metadata.renderRule || metadata.RenderRule);
    var format = normalizeText(metadata.formatType || metadata.FormatType || metadata.formatId || metadata.FormatID || metadata.formatString || metadata.FormatString);
    var sqlType = normalizeText(metadata.sqlType || metadata.SqlType);

    if (rule === 'sw' || rule === 'boolean' || sqlType === 'bit' || format === 'boolean') return 'boolean';
    if (rule === 'dt' || rule === 'datetime' || sqlType === 'datetime' || sqlType === 'datetime2' || sqlType === 'smalldatetime') return 'datetime';
    if (rule === 'd' || rule === 'date' || sqlType === 'date') return 'date';
    if (rule === 'tm' || rule === 'time' || sqlType === 'time') return 'time';
    if (rule === 'money' || rule === 'currency' || format.indexOf('money') >= 0 || format.indexOf('currency') >= 0) return 'currency';
    if (rule === 'percentage' || rule === 'percent' || format.indexOf('percent') >= 0) return 'percentage';
    if (rule === 'n' || rule === 'number' || rule === 'decimal' || /^(tinyint|smallint|int|bigint|decimal|numeric|float|real|money|smallmoney)$/.test(sqlType)) return 'metric';

    if (metadata.lookupKey || metadata.LookupKey) return 'category';

    if (matchesField(fieldName, label, 'person')) return 'person';
    if (matchesField(fieldName, label, 'status')) return 'status';
    if (matchesField(fieldName, label, 'sensitive')) return 'sensitive';
    if (matchesField(fieldName, label, 'reason')) return 'reason';
    if (matchesField(fieldName, label, 'note')) return 'note';
    if (matchesField(fieldName, label, 'contact')) return 'contact';
    if (matchesField(fieldName, label, 'period')) return 'period';
    if (matchesField(fieldName, label, 'datetime')) return 'datetime';
    if (matchesField(fieldName, label, 'time')) return 'time';
    if (matchesField(fieldName, label, 'date')) return 'date';
    if (matchesField(fieldName, label, 'currency')) return 'currency';
    if (matchesField(fieldName, label, 'percentage')) return 'percentage';
    if (matchesField(fieldName, label, 'metric')) return 'metric';
    if (matchesField(fieldName, label, 'category') || metadata.dataSource || metadata.DataSource) return 'category';
    if (matchesField(fieldName, label, 'identifier')) return 'primary-identifier';

    var samples = (sampleValues || []).filter(function (value) { return value !== null && value !== undefined && value !== ''; });
    if (samples.length && samples.every(function (value) { return typeof value === 'number' && isFinite(value); })) return 'metric';
    if (samples.length && samples.every(function (value) { return Object.prototype.toString.call(value) === '[object Date]'; })) return 'datetime';

    return 'default';
  }

  function resolveColumn(fieldMetadata, header, sampleValues) {
    var source = fieldMetadata || {};
    var metadata = Object.assign({}, source.fieldMetadata || {}, source);
    var headerObject = header && typeof header === 'object' ? header : {};
    var fieldName = metadata.name || metadata.field || headerObject.field || headerObject.name || '';
    var label = metadata.label || headerObject.label || headerObject.title || (typeof header === 'string' ? header : fieldName);
    var role = inferRole(metadata, fieldName, label, sampleValues);
    var variant = String(metadata.displayVariant || metadata.DisplayVariant || defaultVariant(role)).trim().toLowerCase();

    return {
      role: role,
      variant: variant || defaultVariant(role),
      tone: String(metadata.tone || '').trim().toLowerCase(),
      field: fieldName,
      label: label,
      metadata: metadata,
      toneMap: safeMap(metadata.toneMap || metadata.ToneMap),
      statusMap: safeMap(metadata.statusMap || metadata.StatusMap),
      avatarField: metadata.avatarField || metadata.AvatarField || '',
      secondaryField: metadata.secondaryField || metadata.SecondaryField || '',
      classNames: ['table-cell', 'table-cell--' + role]
    };
  }

  function valueFromRow(row, fieldName) {
    if (!row || !fieldName) return undefined;
    if (Object.prototype.hasOwnProperty.call(row, fieldName)) return row[fieldName];
    var normalizedField = normalizeText(fieldName);
    var key = Object.keys(row).find(function (item) { return normalizeText(item) === normalizedField; });
    return key ? row[key] : undefined;
  }

  function relatedDisplayValue(columnSemantic, row) {
    var explicit = valueFromRow(row, columnSemantic.secondaryField);
    if (explicit !== undefined && explicit !== null && explicit !== '') return explicit;
    if (columnSemantic.role !== 'status' && columnSemantic.role !== 'category') return undefined;

    var fieldName = columnSemantic.field || '';
    var candidates = [fieldName + 'Name', fieldName + 'Text', fieldName + 'Label'];
    for (var i = 0; i < candidates.length; i++) {
      var candidate = valueFromRow(row, candidates[i]);
      if (candidate !== undefined && candidate !== null && candidate !== '') return candidate;
    }
    return undefined;
  }

  function statusTone(value, toneMap) {
    var override = mapValue(toneMap, value);
    if (override && typeof override === 'object') override = override.tone;
    var normalizedOverride = String(override || '').toLowerCase();
    if (['success', 'warning', 'danger', 'info', 'primary', 'neutral'].indexOf(normalizedOverride) >= 0) return normalizedOverride;

    var normalized = normalizeText(value);
    var registryOrder = ['danger', 'warning', 'info', 'success'];
    for (var i = 0; i < registryOrder.length; i++) {
      var tone = registryOrder[i];
      if (STATUS_REGISTRY[tone].some(function (item) { return normalized === item || normalized.indexOf(item) >= 0; })) return tone;
    }
    return 'neutral';
  }

  function formattedValue(role, value, metadata) {
    if (value === null || value === undefined) return '';
    if (role === 'date' && typeof FormatUtils !== 'undefined' && FormatUtils.date) return FormatUtils.date(value);
    if (role === 'currency' && typeof FormatUtils !== 'undefined' && FormatUtils.currency && value !== '') return FormatUtils.currency(value);
    if ((role === 'metric' || role === 'percentage') && typeof FormatUtils !== 'undefined' && FormatUtils.number && value !== '' && !isNaN(value)) {
      var numberText = FormatUtils.number(value);
      return role === 'percentage' ? numberText + '%' : numberText;
    }
    return String(value);
  }

  function resolveCell(columnSemantic, value, row) {
    var semantic = columnSemantic || resolveColumn({}, {}, [value]);
    var role = semantic.role || 'default';
    var displayValue = value;
    var mappedStatus = role === 'status' ? mapValue(semantic.statusMap, value) : undefined;
    var mappedTone = '';

    if (mappedStatus && typeof mappedStatus === 'object') {
      mappedTone = mappedStatus.tone || '';
      displayValue = mappedStatus.label !== undefined ? mappedStatus.label : (mappedStatus.text !== undefined ? mappedStatus.text : value);
    } else if (mappedStatus !== undefined) {
      displayValue = mappedStatus;
    } else {
      var related = relatedDisplayValue(semantic, row);
      if (related !== undefined) displayValue = related;
    }

    if (role === 'boolean') {
      var isTrue = value === true || value === 1 || String(value).toLowerCase() === 'true' || String(value) === '1';
      displayValue = isTrue ? 'C\u00f3' : 'Kh\u00f4ng';
    } else {
      displayValue = formattedValue(role, displayValue, semantic.metadata || {});
    }

    var tone = semantic.tone;
    var toneOverride = mapValue(semantic.toneMap, value);
    if (toneOverride && typeof toneOverride === 'object') toneOverride = toneOverride.tone;
    if (role === 'status') tone = mappedTone || toneOverride || semantic.tone || statusTone(displayValue, null);
    if (role === 'boolean') tone = displayValue === 'C\u00f3' ? 'success' : 'neutral';
    if (role === 'category') tone = toneOverride || semantic.tone || CATEGORY_TONES[stableHash(displayValue) % CATEGORY_TONES.length];
    if (role === 'period') tone = 'slate';

    var avatarValue = role === 'person' ? valueFromRow(row, semantic.avatarField) : '';
    if (avatarValue === undefined || avatarValue === null || avatarValue === '') avatarValue = displayValue;

    return Object.assign({}, semantic, {
      displayValue: displayValue,
      rawValue: value,
      tone: tone || 'neutral',
      avatarValue: avatarValue,
      avatarTone: CATEGORY_TONES[stableHash(avatarValue) % CATEGORY_TONES.length],
      secondaryValue: role === 'person' ? valueFromRow(row, semantic.secondaryField) : ''
    });
  }

  function initials(value) {
    var words = String(value || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '--';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }

  function textNode(tagName, className, value) {
    var element = document.createElement(tagName || 'span');
    if (className) element.className = className;
    element.textContent = value == null ? '' : String(value);
    return element;
  }

  function createContent(cellSemantic, value, row) {
    var semantic = cellSemantic || resolveCell(resolveColumn({}, {}, [value]), value, row);
    var displayValue = semantic.displayValue == null ? '' : String(semantic.displayValue);

    if (!displayValue) return textNode('span', 'table-cell__text', '');

    if (semantic.variant === 'avatar' || (semantic.role === 'person' && semantic.variant !== 'text')) {
      var person = document.createElement('div');
      person.className = 'cell-person';
      var avatar = textNode('span', 'cell-person__avatar cell-person__avatar--' + semantic.avatarTone, initials(semantic.avatarValue || displayValue));
      avatar.setAttribute('aria-hidden', 'true');
      var personText = document.createElement('span');
      personText.className = 'cell-person__text';
      personText.appendChild(textNode('span', 'cell-person__name', displayValue));
      if (semantic.secondaryValue !== undefined && semantic.secondaryValue !== null && semantic.secondaryValue !== '') {
        personText.appendChild(textNode('span', 'cell-person__secondary', semantic.secondaryValue));
      }
      person.appendChild(avatar);
      person.appendChild(personText);
      return person;
    }

    if (semantic.variant === 'badge' || ((semantic.role === 'status' || semantic.role === 'boolean') && semantic.variant !== 'text')) {
      var badge = document.createElement('span');
      badge.className = 'semantic-badge semantic-badge--' + semantic.tone;
      var dot = document.createElement('span');
      dot.className = 'semantic-badge__dot';
      dot.setAttribute('aria-hidden', 'true');
      badge.appendChild(dot);
      badge.appendChild(document.createTextNode(displayValue));
      return badge;
    }

    if (semantic.variant === 'chip' || ((semantic.role === 'category' || semantic.role === 'period') && semantic.variant !== 'text')) {
      var chip = textNode('span', 'semantic-chip semantic-chip--' + semantic.tone, displayValue);
      if (displayValue) chip.title = displayValue;
      return chip;
    }

    var text = textNode('span', 'table-cell__text', displayValue);
    if ((semantic.role === 'note' || semantic.role === 'reason') && displayValue) text.title = displayValue;
    return text;
  }

  return Object.freeze({
    VOCABULARY: VOCABULARY,
    normalizeText: normalizeText,
    resolveColumn: resolveColumn,
    resolveCell: resolveCell,
    createContent: createContent
  });
})();
