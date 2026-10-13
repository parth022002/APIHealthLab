#!/usr/bin/env node
import * as fs from 'node:fs';
import { Command } from 'commander';
import {
  AuthCredential,
  ControlledFetch,
  DiagnosticStatus,
  RedactionContext,
  SupportedIntentId,
  SupportedProviderId,
  diagnoseRawError,
  evaluateExecutionPolicy,
  generateSnippet,
  scanEnvFile,
  SnippetLanguage,
} from '@api-healthlab/core';
import { executeManifestProbe, ProviderManifest } from '@api-healthlab/provider-kit';
import { ALL_MANIFESTS } from '@api-healthlab/providers';

const PROVIDER_MANIFESTS: Record<string, ProviderManifest> = ALL_MANIFESTS;

const EXIT_CODES = {
  HEALTHY: 0,
  DIAGNOSTIC_FAILURE: 1,
  INCONCLUSIVE: 2,
  SKIPPED_OR_POLICY_BLOCKED: 3,
  INVALID_INPUT: 4,
  USAGE_ERROR: 5,
  ENGINE_ERROR: 6,
};

const program = new Command();

program
  .name('api-healthlab')
  .description('Local-first, intent-aware API credential diagnostics platform')
  .version('0.1.0');

// 1. providers command
program
  .command('providers')
  .description('List supported providers and their available intents')
  .action(() => {
    console.log('\n--- Supported Providers (Phase 0/1) ---\n');
    for (const [id, m] of Object.entries(PROVIDER_MANIFESTS)) {
      console.log(`Provider: ${m.displayName} (${id})`);
      console.log(`  Lifecycle: ${m.lifecycle}`);
      console.log(`  Auth: ${m.auth.methods.join(', ')}`);
      console.log(`  Hosts: ${m.hosts.join(', ')}`);
      console.log(`  Supported Intents: ${Object.keys(m.intents).join(', ')}`);
      console.log('');
    }
  });

// 2. scan command
program
  .command('scan [filePath]')
  .description('Safely scan a .env file for supported API credentials without printing secret values')
  .option('--max-size <bytes>', 'Maximum file size in bytes', '262144')
  .action((filePath = '.env', options) => {
    try {
      console.log(`\nScanning environment file: ${filePath}...`);
      const result = scanEnvFile(filePath, {
        maxSizeBytes: parseInt(options.maxSize, 10),
      });

      console.log(`\n--- Scan Results for ${result.filePath} ---`);
      console.log(`  Total variables parsed: ${result.variables.length}`);
      console.log(`  Recognized provider keys: ${result.recognizedProviders.length}`);

      if (result.recognizedProviders.length > 0) {
        console.log(`  Providers detected: ${result.recognizedProviders.join(', ')}`);
      }

      console.log('\n--- Detected Variables (Values Masked) ---');
      for (const v of result.variables) {
        const hint = v.providerHint ? ` [Provider: ${v.providerHint}]` : '';
        const state = v.hasValue ? '(set)' : '(empty)';
        console.log(`  Line ${v.line}: ${v.key} ${state}${hint}`);
      }

      if (result.duplicates.length > 0) {
        console.log('\n[!] Warnings:');
        for (const warn of result.warnings) {
          console.log(`  • ${warn}`);
        }
      }

      if (result.recognizedProviders.length > 0) {
        console.log('\nSuggested Next Diagnostic Step:');
        for (const p of result.recognizedProviders) {
          const varName = result.variables.find((v) => v.providerHint === p)?.key;
          console.log(`  api-healthlab test ${p} --intent LIST_MODELS --env ${varName}`);
        }
      }
      console.log('');
    } catch (err: unknown) {
      console.error(`\nScan Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(EXIT_CODES.INVALID_INPUT);
    }
  });

// 3. diagnose command
program
  .command('diagnose [errorText]')
  .description('Offline, rule-based diagnostic for API error messages and payloads (zero credentials required)')
  .option('-p, --provider <provider>', 'Optional provider context (e.g. openai, gemini, github)')
  .action((errorText?: string, options?: { provider?: string }) => {
    if (!errorText) {
      console.error('Error: Please provide error text to diagnose. Usage: api-healthlab diagnose "<error text>"');
      process.exit(EXIT_CODES.USAGE_ERROR);
    }

    const diagnosis = diagnoseRawError({
      rawError: errorText,
      providerId: options?.provider as SupportedProviderId,
    });

    console.log('\n--- Offline Diagnostic Analysis ---');
    console.log(`  Status:      ${diagnosis.status}`);
    console.log(`  Reason:      ${diagnosis.reasonCode}`);
    if (diagnosis.detectedProvider) {
      console.log(`  Provider:    ${diagnosis.detectedProvider}`);
    }
    console.log(`  Meaning:     ${diagnosis.description}`);
    console.log('\n--- Suggested Remediation ---');
    for (const step of diagnosis.remediation) {
      console.log(`  • ${step}`);
    }
    console.log('');
  });

// 4. snippet command
program
  .command('snippet <provider>')
  .description('Generate a minimal, safe reproducer code snippet with credential placeholders')
  .requiredOption('-i, --intent <intent>', 'The intended action (e.g. LIST_MODELS, IDENTITY)')
  .option('-l, --lang <language>', 'Language format (curl, typescript, python)', 'curl')
  .option('--env <varName>', 'Custom environment variable placeholder name')
  .action((providerId: string, options) => {
    const manifest = PROVIDER_MANIFESTS[providerId.toLowerCase()];
    if (!manifest) {
      console.error(`Error: Unknown provider '${providerId}'.`);
      process.exit(EXIT_CODES.INVALID_INPUT);
    }

    const intentId = options.intent.toUpperCase() as SupportedIntentId;
    try {
      const snippet = generateSnippet({
        manifest,
        intentId,
        language: options.lang as SnippetLanguage,
        envVarName: options.env,
      });

      console.log(`\n--- Generated ${options.lang.toUpperCase()} Snippet (${manifest.displayName} - ${intentId}) ---\n`);
      console.log(snippet);
      console.log('\n');
    } catch (err: unknown) {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(EXIT_CODES.USAGE_ERROR);
    }
  });

// 5. test command
program
  .command('test <provider>')
  .description('Execute a bounded, intent-aware diagnostic probe against a provider')
  .requiredOption('-i, --intent <intent>', 'The intended action to test (e.g. LIST_MODELS, IDENTITY)')
  .option('--env <varName>', 'Environment variable containing the credential')
  .option('--file <filePath>', 'Path to file containing the credential (first line used)')
  .option('--key <secret>', 'Directly supplied credential string (for test/local use)')
  .option('--stdin', 'Read credential from standard input')
  .option('--mode <mode>', 'Execution mode (LOCAL or HOSTED)', 'LOCAL')
  .option('--snippet [lang]', 'Print a reproducer snippet after test completion')
  .option('--json', 'Output sanitized result as JSON')
  .action(async (providerId: string, options) => {
    const manifest = PROVIDER_MANIFESTS[providerId.toLowerCase()];
    if (!manifest) {
      console.error(`Error: Unknown or unsupported provider '${providerId}'.`);
      process.exit(EXIT_CODES.INVALID_INPUT);
    }

    const intentId = options.intent.toUpperCase() as SupportedIntentId;
    const intentConfig = manifest.intents[intentId];
    if (!intentConfig) {
      console.error(`Error: Intent '${options.intent}' is not supported by provider '${providerId}'.`);
      process.exit(EXIT_CODES.INVALID_INPUT);
    }

    // Resolve credential from approved channels (FR-024)
    let rawSecret = '';
    if (options.env) {
      rawSecret = process.env[options.env] || '';
      if (!rawSecret) {
        console.error(`Error: Environment variable '${options.env}' is not set or empty.`);
        process.exit(EXIT_CODES.INVALID_INPUT);
      }
    } else if (options.file) {
      try {
        const fileContent = fs.readFileSync(options.file, 'utf8');
        rawSecret = fileContent.split(/\r?\n/)[0]?.trim() || '';
      } catch (err: unknown) {
        console.error(`Error reading secret file: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(EXIT_CODES.INVALID_INPUT);
      }
    } else if (options.stdin) {
      rawSecret = fs.readFileSync(0, 'utf8').trim();
    } else if (options.key) {
      rawSecret = options.key;
    } else {
      console.error('Error: Please provide a credential using --env, --file, --stdin, or --key.');
      process.exit(EXIT_CODES.USAGE_ERROR);
    }

    if (!rawSecret) {
      console.error('Error: Provided credential was empty.');
      process.exit(EXIT_CODES.INVALID_INPUT);
    }

    const authMethod = manifest.auth.methods[0] || 'API_KEY';
    const credential: AuthCredential = authMethod === 'BEARER_TOKEN'
      ? { type: 'BEARER_TOKEN', token: rawSecret }
      : { type: 'API_KEY', key: rawSecret };

    // Register with redaction context
    const redactionCtx = new RedactionContext();
    redactionCtx.register(rawSecret, `${providerId.toUpperCase()}_SECRET`);

    // 1. Evaluate Policy Gate
    const policyResult = evaluateExecutionPolicy({
      risk: intentConfig.risk,
      sideEffect: intentConfig.sideEffect,
      cost: intentConfig.cost,
      mode: options.mode === 'HOSTED' ? 'HOSTED' : 'LOCAL',
      authorized: true,
      billableAcknowledged: true,
    });

    if (policyResult.decision === 'DENY') {
      console.error(`Policy Denied [${policyResult.reasonCode}]: ${policyResult.message}`);
      process.exit(EXIT_CODES.SKIPPED_OR_POLICY_BLOCKED);
    }

    if (!options.json) {
      console.log(`\nStarting diagnostic probe for [${manifest.displayName}]...`);
      console.log(`  Intent:    ${intentId} (${intentConfig.category})`);
      console.log(`  Policy:    ${policyResult.decision} (Risk: ${intentConfig.risk}, Cost: ${intentConfig.cost})`);
      console.log(`  Target:    https://${manifest.hosts[0]}${intentConfig.path}`);
      console.log(`  Secret:    ${RedactionContext.maskSecret(rawSecret)}`);
      console.log('  Running probe...');
    }

    // 2. Controlled Network Boundary
    const allAllowedHosts = Object.values(PROVIDER_MANIFESTS).flatMap((m) => m.hosts);
    const controlledFetch = new ControlledFetch(allAllowedHosts);

    const stepResult = await executeManifestProbe({
      manifest,
      intentId,
      credential,
      controlledFetch,
    });

    if (options.json) {
      console.log(JSON.stringify(redactionCtx.redactValue(stepResult), null, 2));
    } else {
      console.log('\n--- Diagnostic Outcome ---');
      console.log(`  State:       ${stepResult.state}`);
      console.log(`  Status:      ${stepResult.status}`);
      console.log(`  Reason:      ${stepResult.reasonCode}`);
      console.log(`  Latency:     ${stepResult.durationMs}ms`);
      console.log('\n--- Evidence ---');
      for (const ev of stepResult.evidence) {
        console.log(`  [${ev.sourceType}] ${ev.sourceLocator}: ${ev.observedValue} (${ev.description ?? ''})`);
      }
      console.log('');
    }

    // Optional snippet output
    if (options.snippet) {
      const lang: SnippetLanguage = typeof options.snippet === 'string' ? (options.snippet as SnippetLanguage) : 'curl';
      const snippet = generateSnippet({
        manifest,
        intentId,
        language: lang,
        envVarName: options.env,
      });
      console.log(`--- Reproducer Snippet (${lang.toUpperCase()}) ---`);
      console.log(snippet);
      console.log('');
    }

    if (stepResult.state === 'PASS') {
      process.exit(EXIT_CODES.HEALTHY);
    } else if (stepResult.state === 'FAIL') {
      process.exit(EXIT_CODES.DIAGNOSTIC_FAILURE);
    } else if (stepResult.state === 'INCONCLUSIVE') {
      process.exit(EXIT_CODES.INCONCLUSIVE);
    } else {
      process.exit(EXIT_CODES.SKIPPED_OR_POLICY_BLOCKED);
    }
  });

program.parse(process.argv);
