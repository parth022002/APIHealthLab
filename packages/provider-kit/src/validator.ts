import { ProviderManifest, ProviderManifestSchema } from './manifest-schema.js';

export interface ManifestLintResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateProviderManifest(manifest: unknown): ManifestLintResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const parseResult = ProviderManifestSchema.safeParse(manifest);
  if (!parseResult.success) {
    for (const issue of parseResult.error.issues) {
      errors.push(`Schema Error: ${issue.path.join('.')} - ${issue.message}`);
    }
    return { valid: false, errors, warnings };
  }

  const data: ProviderManifest = parseResult.data;

  // 1. Host Invariants
  for (const host of data.hosts) {
    if (host.includes('*')) {
      errors.push(`Host security violation: Wildcards are forbidden in host '${host}'.`);
    }
    if (host.startsWith('http:') || host.startsWith('https:')) {
      errors.push(`Host security violation: Host must be domain only, not a URL: '${host}'.`);
    }
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.includes(':')) {
      errors.push(`Host security violation: IP literals or ports are forbidden in host '${host}'.`);
    }
    if (host.toLowerCase() !== host) {
      warnings.push(`Host '${host}' should be lowercase.`);
    }
  }

  // 2. URLs must be HTTPS
  if (!data.docsUrl.startsWith('https://')) {
    errors.push(`docsUrl must be HTTPS: ${data.docsUrl}`);
  }
  if (!data.termsUrl.startsWith('https://')) {
    errors.push(`termsUrl must be HTTPS: ${data.termsUrl}`);
  }

  // 3. Intents validation
  const intentKeys = Object.keys(data.intents);
  if (intentKeys.length === 0) {
    errors.push('Manifest must define at least 1 supported intent.');
  }

  for (const [intentId, config] of Object.entries(data.intents)) {
    if (!config.path.startsWith('/')) {
      errors.push(`Intent '${intentId}' path must start with '/': '${config.path}'.`);
    }

    if (config.method !== 'GET' && config.method !== 'POST') {
      errors.push(`Intent '${intentId}' method must be GET or POST (found '${config.method}').`);
    }

    // Hosted R2/R3 warning
    if ((config.risk === 'R2' || config.risk === 'R3') && data.hosts.length > 0) {
      warnings.push(`Intent '${intentId}' has risk ${config.risk}; will be denied in hosted mode.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
