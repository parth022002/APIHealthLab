export interface ControlledFetchOptions {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

export interface ControlledFetchResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  bodyText: string;
  json?: unknown;
}

export type FetchPort = (url: string, init: RequestInit) => Promise<Response>;

const FORBIDDEN_HEADERS = new Set([
  'cookie',
  'set-cookie',
  'host',
  'content-length',
  'connection',
  'transfer-encoding',
  'proxy-authorization',
  'proxy-connection',
  'forwarded',
  'upgrade',
]);

const DEFAULT_TIMEOUT_MS = 6000;
const MAX_REQUEST_BODY_BYTES = 32 * 1024; // 32 KiB
const MAX_RESPONSE_BODY_BYTES = 128 * 1024; // 128 KiB

export class ControlledFetch {
  private readonly _allowedHosts: Set<string>;
  private readonly _fetchImpl: FetchPort;

  constructor(allowedHosts: string[], fetchImpl: FetchPort = fetch) {
    this._allowedHosts = new Set(allowedHosts.map((h) => h.toLowerCase()));
    this._fetchImpl = fetchImpl;
  }

  public validateUrl(rawUrl: string): URL {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      throw new Error(`Invalid URL format: ${rawUrl}`);
    }

    if (parsed.protocol !== 'https:') {
      throw new Error(`Insecure protocol: ${parsed.protocol}. Only HTTPS is permitted.`);
    }

    const hostname = parsed.hostname.toLowerCase();

    // Disallow IP literals
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.startsWith('[') || hostname.includes(':')) {
      throw new Error(`IP literals are strictly forbidden: ${hostname}`);
    }

    // Disallow non-default ports
    if (parsed.port && parsed.port !== '443') {
      throw new Error(`Non-standard port forbidden: ${parsed.port}`);
    }

    // Disallow userinfo
    if (parsed.username || parsed.password) {
      throw new Error('Userinfo credentials in URL are strictly forbidden.');
    }

    // Enforce host allowlist
    if (!this._allowedHosts.has(hostname)) {
      throw new Error(`Host '${hostname}' is not in the allowlist.`);
    }

    return parsed;
  }

  public sanitizeHeaders(headers?: Record<string, string>): Record<string, string> {
    const sanitized: Record<string, string> = {
      'user-agent': 'API-HealthLab/0.1.0',
    };

    if (!headers) return sanitized;

    for (const [key, value] of Object.entries(headers)) {
      const lower = key.toLowerCase();
      if (FORBIDDEN_HEADERS.has(lower) || lower.startsWith('x-forwarded-')) {
        continue; // Strip forbidden/dangerous headers
      }
      sanitized[lower] = value;
    }

    return sanitized;
  }

  public async execute(
    url: string,
    options: ControlledFetchOptions = {},
  ): Promise<ControlledFetchResponse> {
    const validatedUrl = this.validateUrl(url);
    const method = options.method ?? 'GET';

    if (method !== 'GET' && method !== 'POST') {
      throw new Error(`HTTP method ${method} is not permitted. Only GET and POST are supported.`);
    }

    if (options.body && Buffer.byteLength(options.body, 'utf8') > MAX_REQUEST_BODY_BYTES) {
      throw new Error(`Request body exceeds maximum allowed size of ${MAX_REQUEST_BODY_BYTES} bytes.`);
    }

    const headers = this.sanitizeHeaders(options.headers);
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    const requestInit: RequestInit = {
      method,
      headers,
      redirect: 'manual',
      signal: controller.signal,
    };
    if (options.body !== undefined) {
      requestInit.body = options.body;
    }

    try {
      const response = await this._fetchImpl(validatedUrl.toString(), requestInit);

      // Response headers extraction
      const respHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        respHeaders[key.toLowerCase()] = val;
      });

      // Stream bounded body reading
      const text = await response.text();
      if (Buffer.byteLength(text, 'utf8') > MAX_RESPONSE_BODY_BYTES) {
        throw new Error(
          `Provider response exceeded maximum allowed payload size of ${MAX_RESPONSE_BODY_BYTES} bytes.`,
        );
      }

      let parsedJson: unknown | undefined;
      if (respHeaders['content-type']?.includes('application/json')) {
        try {
          parsedJson = JSON.parse(text);
        } catch {
          // JSON parsing failed; json remains undefined
        }
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: respHeaders,
        bodyText: text,
        json: parsedJson,
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Network timeout after ${timeoutMs}ms.`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutTimer);
    }
  }
}
