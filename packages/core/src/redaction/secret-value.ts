/**
 * Secure wrapper around sensitive credential material.
 * Prevents accidental logging, JSON serialization, and string coercion.
 */
export class SecretValue {
  private readonly _value: string;
  private readonly _label: string;

  constructor(value: string, label: string = 'credential') {
    if (!value || typeof value !== 'string') {
      throw new Error('SecretValue requires a non-empty string');
    }
    this._value = value;
    this._label = label;
  }

  /**
   * Only privileged boundaries (ControlledFetch header construction) may call this.
   */
  public reveal(): string {
    return this._value;
  }

  public get label(): string {
    return this._label;
  }

  public get length(): number {
    return this._value.length;
  }

  public toString(): string {
    return `[REDACTED ${this._label}]`;
  }

  public toJSON(): string {
    return `[REDACTED ${this._label}]`;
  }

  public [Symbol.for('nodejs.util.inspect.custom')](): string {
    return `[REDACTED ${this._label}]`;
  }
}
