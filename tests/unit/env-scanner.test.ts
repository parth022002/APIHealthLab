import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { parseEnvContent, scanEnvFile } from '../../packages/core/src/scanner/env-scanner.js';

describe('Safe .env Scanner Invariants (FR-025, FR-026)', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'env-scanner-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('parses KEY=value, export KEY=value, and comments safely without shell expansion', () => {
    const rawContent = `
# Comment line
OPENAI_API_KEY=sk-test-secret-12345
export GEMINI_API_KEY=AIzaSyTest67890
CUSTOM_PORT=8080
EMPTY_VAL=
`;
    const parsed = parseEnvContent(rawContent);
    expect(parsed.variables).toHaveLength(4);
    expect(parsed.duplicates).toHaveLength(0);

    const openai = parsed.variables.find((v) => v.key === 'OPENAI_API_KEY');
    expect(openai).toBeDefined();
    expect(openai?.providerHint).toBe('openai');
    expect(openai?.hasValue).toBe(true);

    const gemini = parsed.variables.find((v) => v.key === 'GEMINI_API_KEY');
    expect(gemini).toBeDefined();
    expect(gemini?.providerHint).toBe('gemini');

    const empty = parsed.variables.find((v) => v.key === 'EMPTY_VAL');
    expect(empty?.hasValue).toBe(false);
  });

  it('detects duplicate keys and issues warning without leaking secret values', () => {
    const duplicateContent = `
OPENAI_API_KEY=secret_one
OPENAI_API_KEY=secret_two
`;
    const parsed = parseEnvContent(duplicateContent);
    expect(parsed.duplicates).toContain('OPENAI_API_KEY');
    expect(parsed.warnings.length).toBeGreaterThan(0);
    expect(parsed.warnings[0]).toContain('Duplicate environment variables detected: OPENAI_API_KEY');
    // Ensure warning NEVER includes the raw secret
    expect(parsed.warnings[0]).not.toContain('secret_one');
    expect(parsed.warnings[0]).not.toContain('secret_two');
  });

  it('rejects files exceeding maximum size budget (256 KiB)', () => {
    const oversizedFile = path.join(tmpDir, '.env.huge');
    const largeBuffer = Buffer.alloc(260 * 1024, 'A'); // 260 KiB
    fs.writeFileSync(oversizedFile, largeBuffer);

    expect(() => scanEnvFile(oversizedFile)).toThrow(/exceeds maximum limit of 262144 bytes/);
  });

  it('rejects binary files containing null bytes', () => {
    const binaryFile = path.join(tmpDir, '.env.bin');
    const binaryBuffer = Buffer.from([0x4f, 0x50, 0x45, 0x4e, 0x00, 0x41, 0x49]); // "OPEN\0AI"
    fs.writeFileSync(binaryFile, binaryBuffer);

    expect(() => scanEnvFile(binaryFile)).toThrow(/Binary content detected/);
  });

  it('scans .env.example correctly and detects recognized providers', () => {
    const result = scanEnvFile(path.resolve('.env.example'));
    expect(result.variables.length).toBeGreaterThan(0);
    expect(result.duplicates).toHaveLength(0);
    expect(result.filePath).toBeDefined();
  });
});
