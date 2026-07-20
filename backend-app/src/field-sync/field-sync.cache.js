export class FieldSyncCache {
    constructor(ttlMs = 120_000, clock = () => Date.now(), maxEntries = 500) {
        this.ttlMs = ttlMs;
        this.clock = clock;
        this.maxEntries = Number.isInteger(maxEntries) && maxEntries > 0 ? maxEntries : 500;
        this.entries = new Map();
    }

    pruneExpired() {
        const now = this.clock();
        for (const [key, item] of this.entries) {
            if (item.expiresAt <= now) this.entries.delete(key);
        }
    }

    get(key) {
        const item = this.entries.get(key);
        if (!item) return undefined;
        if (item.expiresAt <= this.clock()) {
            this.entries.delete(key);
            return undefined;
        }
        this.entries.delete(key);
        this.entries.set(key, item);
        return item.value;
    }

    set(key, value) {
        this.pruneExpired();
        this.entries.delete(key);
        while (this.entries.size >= this.maxEntries) {
            this.entries.delete(this.entries.keys().next().value);
        }
        this.entries.set(key, { value, expiresAt: this.clock() + this.ttlMs });
        return value;
    }

    clear() {
        this.entries.clear();
    }
}
