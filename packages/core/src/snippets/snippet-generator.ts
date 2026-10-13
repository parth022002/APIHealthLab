import { SupportedIntentId } from '../schemas/enums.js';

export type SnippetLanguage = 'curl' | 'typescript' | 'python';

export interface SnippetProviderConfig {
  id: string;
  displayName: string;
  hosts: string[];
  auth: {
    defaultHeader: string;
    headerFormat?: string;
  };
  intents: Record<string, {
    method: 'GET' | 'POST';
    path: string;
    bodyTemplate?: string | undefined;
  }>;
}

export interface GenerateSnippetParams {
  manifest: SnippetProviderConfig;
  intentId: SupportedIntentId;
  language: SnippetLanguage;
  envVarName?: string;
}

export function getDefaultEnvVarForProvider(providerId: string): string {
  switch (providerId.toLowerCase()) {
    case 'openai':
      return 'OPENAI_API_KEY';
    case 'gemini':
      return 'GEMINI_API_KEY';
    case 'github':
      return 'GITHUB_TOKEN';
    case 'anthropic':
      return 'ANTHROPIC_API_KEY';
    case 'mistral':
      return 'MISTRAL_API_KEY';
    case 'groq':
      return 'GROQ_API_KEY';
    case 'openrouter':
      return 'OPENROUTER_API_KEY';
    default:
      return `${providerId.toUpperCase()}_API_KEY`;
  }
}

export function generateSnippet(params: GenerateSnippetParams): string {
  const { manifest, intentId, language } = params;
  const intentConfig = manifest.intents[intentId];
  if (!intentConfig) {
    throw new Error(`Intent '${intentId}' is not supported by ${manifest.displayName}.`);
  }

  const envVar = params.envVarName ?? getDefaultEnvVarForProvider(manifest.id);
  const host = manifest.hosts[0]!;
  const url = `https://${host}${intentConfig.path}`;
  const method = intentConfig.method;
  const headerName = manifest.auth.defaultHeader;

  // Placeholder format: e.g. "Bearer ${OPENAI_API_KEY}" or "${GEMINI_API_KEY}"
  const headerFormat = manifest.auth.headerFormat || '{token}';
  const tokenPlaceholder = `\${${envVar}}`;
  const formattedHeaderValue = headerFormat.replace('{token}', tokenPlaceholder).replace('{key}', tokenPlaceholder);

  if (language === 'curl') {
    const lines = [`curl -X ${method} "${url}" \\`];
    lines.push(`  -H "${headerName}: ${formattedHeaderValue}" \\`);
    lines.push('  -H "Accept: application/json"');
    if (method === 'POST' && intentConfig.bodyTemplate) {
      lines[lines.length - 1] += ' \\';
      lines.push(`  -H "Content-Type: application/json" \\`);
      lines.push(`  -d '${intentConfig.bodyTemplate}'`);
    }
    return lines.join('\n');
  }

  if (language === 'typescript') {
    const lines = [
      `// Safe diagnostic reproduction for ${manifest.displayName} (${intentId})`,
      `const apiKey = process.env.${envVar};`,
      'if (!apiKey) throw new Error("Environment variable not set");',
      '',
      `const response = await fetch("${url}", {`,
      `  method: "${method}",`,
      '  headers: {',
      `    "${headerName}": \`${headerFormat.replace('{token}', '${apiKey}').replace('{key}', '${apiKey}')}\`,`,
      '    "Accept": "application/json",',
    ];
    if (method === 'POST' && intentConfig.bodyTemplate) {
      lines.push('    "Content-Type": "application/json",');
      lines.push('  },');
      lines.push(`  body: JSON.stringify(${intentConfig.bodyTemplate}),`);
    } else {
      lines.push('  },');
    }
    lines.push('});');
    lines.push('');
    lines.push('const data = await response.json();');
    lines.push('console.log(data);');
    return lines.join('\n');
  }

  if (language === 'python') {
    const lines = [
      `# Safe diagnostic reproduction for ${manifest.displayName} (${intentId})`,
      'import os',
      'import requests',
      '',
      `api_key = os.environ.get("${envVar}")`,
      `if not api_key:`,
      `    raise ValueError("${envVar} is not set in environment")`,
      '',
      `url = "${url}"`,
      'headers = {',
      `    "${headerName}": f"${headerFormat.replace('{token}', '{api_key}').replace('{key}', '{api_key}')}",`,
      '    "Accept": "application/json",',
    ];
    if (method === 'POST' && intentConfig.bodyTemplate) {
      lines.push('    "Content-Type": "application/json",');
      lines.push('}');
      lines.push(`payload = ${intentConfig.bodyTemplate}`);
      lines.push('response = requests.post(url, headers=headers, json=payload)');
    } else {
      lines.push('}');
      lines.push('response = requests.get(url, headers=headers)');
    }
    lines.push('print(response.status_code, response.json())');
    return lines.join('\n');
  }

  throw new Error(`Unsupported snippet language: ${language}`);
}
