import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('CLI Integration Tests (apps/cli)', () => {
  const binPath = path.resolve('apps/cli/dist/bin.js');

  function runCli(args: string): { stdout: string; status: number } {
    try {
      const stdout = execSync(`node "${binPath}" ${args}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      return { stdout, status: 0 };
    } catch (err: unknown) {
      const execErr = err as { stdout?: string; stderr?: string; status?: number };
      return {
        stdout: (execErr.stdout || '') + (execErr.stderr || ''),
        status: execErr.status ?? 1,
      };
    }
  }

  it('runs "providers" command and outputs active providers', () => {
    const { stdout, status } = runCli('providers');
    expect(status).toBe(0);
    expect(stdout).toContain('OpenAI (openai)');
    expect(stdout).toContain('Google Gemini (gemini)');
    expect(stdout).toContain('GitHub (github)');
  });

  it('runs "scan" command on .env.example safely without leaking values', () => {
    const { stdout, status } = runCli('scan .env.example');
    expect(status).toBe(0);
    expect(stdout).toContain('Scanning environment file: .env.example');
    expect(stdout).toContain('PUBLIC_WEB_ORIGIN');
    expect(stdout).not.toContain('password');
  });

  it('runs "diagnose" command on raw error string', () => {
    const { stdout, status } = runCli('diagnose "API key not valid"');
    expect(status).toBe(0);
    expect(stdout).toContain('Status:      INVALID_CREDENTIAL');
    expect(stdout).toContain('Reason:      API_KEY_INVALID');
    expect(stdout).toContain('Provider:    gemini');
  });

  it('runs "snippet" command for OpenAI LIST_MODELS', () => {
    const { stdout, status } = runCli('snippet openai -i LIST_MODELS -l curl');
    expect(status).toBe(0);
    expect(stdout).toContain('curl -X GET "https://api.openai.com/v1/models"');
    expect(stdout).toContain('Authorization: Bearer ${OPENAI_API_KEY}');
  });

  it('returns stable exit code 4 (INVALID_INPUT) when unknown provider is specified', () => {
    const { stdout, status } = runCli('test nonexistent -i LIST_MODELS --key secret');
    expect(status).toBe(4);
    expect(stdout).toContain("Unknown or unsupported provider 'nonexistent'");
  });
});
