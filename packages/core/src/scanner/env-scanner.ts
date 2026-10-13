import * as fs from 'node:fs';
import * as path from 'node:path';

export interface ScanEnvOptions {
  maxSizeBytes?: number;
  followSymlinks?: boolean;
}

export interface DetectedEnvVar {
  key: string;
  line: number;
  providerHint?: string | undefined;
  hasValue: boolean;
}

export interface ScanEnvResult {
  filePath: string;
  variables: DetectedEnvVar[];
  duplicates: string[];
  warnings: string[];
  recognizedProviders: string[];
}

const DEFAULT_MAX_SIZE_BYTES = 256 * 1024; // 256 KiB per FR-025

const KNOWN_PROVIDER_PATTERNS: Record<string, string> = {
  OPENAI_API_KEY: 'openai',
  OPENAI_KEY: 'openai',
  GEMINI_API_KEY: 'gemini',
  GOOGLE_API_KEY: 'gemini',
  GITHUB_TOKEN: 'github',
  GH_TOKEN: 'github',
  ANTHROPIC_API_KEY: 'anthropic',
  MISTRAL_API_KEY: 'mistral',
  GROQ_API_KEY: 'groq',
  OPENROUTER_API_KEY: 'openrouter',
};

export function parseEnvContent(content: string): {
  variables: DetectedEnvVar[];
  duplicates: string[];
  warnings: string[];
} {
  const variables: DetectedEnvVar[] = [];
  const seenKeys = new Map<string, number>();
  const duplicates = new Set<string>();
  const warnings: string[] = [];

  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]!;
    const lineNum = i + 1;
    const trimmed = rawLine.trim();

    // Ignore empty lines and comment lines
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // Match KEY=value or export KEY=value (without shell evaluation)
    const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) {
      continue;
    }

    const key = match[1]!;
    const rawVal = match[2]!;

    if (seenKeys.has(key)) {
      duplicates.add(key);
    } else {
      seenKeys.set(key, lineNum);
    }

    const providerHint = KNOWN_PROVIDER_PATTERNS[key.toUpperCase()];
    const hasValue = rawVal.trim().length > 0;

    variables.push({
      key,
      line: lineNum,
      providerHint,
      hasValue,
    });
  }

  if (duplicates.size > 0) {
    warnings.push(
      `Duplicate environment variables detected: ${Array.from(duplicates).join(', ')}. Later declarations may overwrite earlier ones.`,
    );
  }

  return {
    variables,
    duplicates: Array.from(duplicates),
    warnings,
  };
}

export function scanEnvFile(filePath: string, options: ScanEnvOptions = {}): ScanEnvResult {
  const maxBytes = options.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;
  const followSymlinks = options.followSymlinks ?? false;

  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }

  const lstat = fs.lstatSync(resolvedPath);

  // Reject symlinks by default
  if (lstat.isSymbolicLink() && !followSymlinks) {
    throw new Error(
      `Security rejection: Symlinks are forbidden by default for .env scanning: ${filePath}`,
    );
  }

  // Ensure it is a regular file
  if (!lstat.isFile() && !lstat.isSymbolicLink()) {
    throw new Error(`Security rejection: '${filePath}' is not a regular file.`);
  }

  // Enforce 256 KiB file size limit
  if (lstat.size > maxBytes) {
    throw new Error(
      `Security rejection: File size (${lstat.size} bytes) exceeds maximum limit of ${maxBytes} bytes (256 KiB).`,
    );
  }

  // Read buffer and check for binary content (null bytes)
  const buffer = fs.readFileSync(resolvedPath);
  const checkLength = Math.min(buffer.length, 8000);
  for (let i = 0; i < checkLength; i++) {
    if (buffer[i] === 0) {
      throw new Error(`Security rejection: Binary content detected in '${filePath}'.`);
    }
  }

  const content = buffer.toString('utf8');
  const { variables, duplicates, warnings } = parseEnvContent(content);

  const recognizedProviders = Array.from(
    new Set(variables.map((v) => v.providerHint).filter((p): p is string => Boolean(p))),
  );

  return {
    filePath: resolvedPath,
    variables,
    duplicates,
    warnings,
    recognizedProviders,
  };
}
