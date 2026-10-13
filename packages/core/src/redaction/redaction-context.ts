import { SecretValue } from './secret-value.js';

export interface RegisteredSecret {
  value: string;
  label: string;
}

export class RedactionContext {
  private readonly _secrets: RegisteredSecret[] = [];

  public register(secret: SecretValue | string, label: string = 'SECRET'): void {
    const raw = typeof secret === 'string' ? secret : secret.reveal();
    if (!raw || raw.length < 3) {
      return; // Do not register trivial substrings (e.g. "a", "12") to avoid over-redaction
    }
    // Prevent duplicate entries
    if (!this._secrets.some((s) => s.value === raw)) {
      this._secrets.push({ value: raw, label });
    }
  }

  public redactString(input: string): string {
    if (!input || typeof input !== 'string') return input;
    let result = input;
    for (const { value, label } of this._secrets) {
      if (result.includes(value)) {
        result = result.split(value).join(`[REDACTED_${label}]`);
      }
    }
    return result;
  }

  public redactValue<T>(value: T): T {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      return this.redactString(value) as unknown as T;
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.redactValue(item)) as unknown as T;
    }
    if (typeof value === 'object') {
      const copy: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        // Automatically redact common sensitive field names
        if (/authorization|token|key|secret|password|bearer/i.test(k)) {
          copy[k] = '[REDACTED_FIELD]';
        } else {
          copy[k] = this.redactValue(v);
        }
      }
      return copy as T;
    }
    return value;
  }

  public static maskSecret(value: string): string {
    if (!value) return '';
    if (value.length <= 8) return '****';
    const prefix = value.slice(0, 4);
    const suffix = value.slice(-4);
    return `${prefix}...${suffix}`;
  }
}
