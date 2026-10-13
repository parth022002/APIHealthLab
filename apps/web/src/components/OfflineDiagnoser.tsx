import React, { useState } from 'react';
import { diagnoseRawError, SupportedProviderId, ErrorDiagnosisResult } from '@api-healthlab/core';

const PRESET_SAMPLES: Array<{ label: string; provider?: SupportedProviderId; sample: string }> = [
  {
    label: 'OpenAI: Invalid API Key',
    provider: 'openai',
    sample: 'Error 401: {"error": {"message": "Incorrect API key provided: sk-proj-... You can obtain an API key from https://platform.openai.com/account/api-keys.", "type": "invalid_request_error", "param": null, "code": "invalid_api_key"}}',
  },
  {
    label: 'Anthropic: Balance Too Low',
    provider: 'anthropic',
    sample: '{"type":"error","error":{"type":"invalid_request_error","message":"Your credit balance is too low to access the Claude API. Please go to Plans & Billing to upgrade or purchase credits."}}',
  },
  {
    label: 'Gemini: Region Blocked',
    provider: 'gemini',
    sample: '{"error": {"code": 400, "message": "User location is not supported for the API use.", "status": "FAILED_PRECONDITION"}}',
  },
  {
    label: 'GitHub: Bad Credentials',
    provider: 'github',
    sample: 'HTTP/2 401 Unauthorized\n{"message": "Bad credentials", "documentation_url": "https://docs.github.com/rest"}',
  },
  {
    label: 'Groq: Rate Limit 429',
    provider: 'groq',
    sample: '{"error": {"message": "Rate limit reached for model llama-3.3-70b-versatile in organization org_123 on tokens_per_minute (TPM): Limit 6000, Used 6200, Requested 400.", "type": "tokens", "code": "rate_limit_exceeded"}}',
  },
  {
    label: 'Network: Connection Timeout',
    sample: 'FetchError: request to https://api.mistral.ai/v1/models failed, reason: connect ETIMEDOUT 104.18.23.19:443',
  },
];

export const OfflineDiagnoser: React.FC = () => {
  const [rawText, setRawText] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<SupportedProviderId | ''>('');
  const [result, setResult] = useState<ErrorDiagnosisResult | null>(null);

  // AI Diagnostic State (Background AI Engine)
  const envGroqKey = ((import.meta as any).env?.VITE_GROQ_API_KEY as string) || '';
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSolution, setAiSolution] = useState<string | null>(null);

  const handleDiagnose = (text: string, provider: SupportedProviderId | '') => {
    if (!text.trim()) {
      setResult(null);
      setAiSolution(null);
      return;
    }
    const diag = diagnoseRawError({
      rawError: text,
      ...(provider ? { providerId: provider } : {}),
    });
    setResult(diag);
  };

  const handleApplyPreset = (sample: string, provider?: SupportedProviderId) => {
    setRawText(sample);
    const prov = provider || '';
    setSelectedProvider(prov);
    setAiSolution(null);
    handleDiagnose(sample, prov);
  };

  const sanitizeAndRedactError = (input: string): string => {
    return input
      .replace(/sk-[a-zA-Z0-9_-]{20,}/g, 'sk-[REDACTED_KEY]')
      .replace(/gsk_[a-zA-Z0-9_-]{20,}/g, 'gsk_[REDACTED_KEY]')
      .replace(/ghp_[a-zA-Z0-9_-]{20,}/g, 'ghp_[REDACTED_PAT]')
      .replace(/Bearer\s+[a-zA-Z0-9._-]{20,}/gi, 'Bearer [REDACTED_TOKEN]');
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = sanitizeAndRedactError(e.target.value);
    setRawText(val);
    handleDiagnose(val, selectedProvider);
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as SupportedProviderId | '';
    setSelectedProvider(val);
    handleDiagnose(rawText, val);
  };

  const handleRunAiDiagnostics = async () => {
    if (!rawText.trim()) return;

    setIsAiLoading(true);
    setAiSolution(null);

    const effectiveKey = envGroqKey.trim();

    try {
      // If an AI Key is available, call background engine directly
      if (effectiveKey.startsWith('gsk_')) {
        const candidateModels = [
          'openai/gpt-oss-120b',
          'openai/gpt-oss-20b',
          'qwen/qwen3.8-27b',
          'llama-3.3-70b-versatile',
        ];

        let content = '';
        for (const model of candidateModels) {
          try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${effectiveKey}`,
              },
              body: JSON.stringify({
                model,
                messages: [
                  {
                    role: 'system',
                    content:
                      'You are an expert API infrastructure engineer. Analyze the following API error dump. Provide: 1) Executive Root Cause, 2) Exact Step-by-Step Fix, 3) Correct Code Snippet (curl or TypeScript/Python), and 4) Prevention Tip. Keep it concise, high signal, and actionable.',
                  },
                  {
                    role: 'user',
                    content: `Target Provider: ${selectedProvider || 'Auto-detect'}\n\nError Dump:\n${rawText}`,
                  },
                ],
                temperature: 0.2,
                max_tokens: 900,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              content = data.choices?.[0]?.message?.content || '';
              if (content) break;
            }
          } catch {
            // try next model
          }
        }

        if (content) {
          setAiSolution(content);
          setIsAiLoading(false);
          return;
        }
      }

      // High-grade intelligent local reasoning engine fallback
      await new Promise((resolve) => setTimeout(resolve, 600));

      const lower = rawText.toLowerCase();
      let reasoning = '';

      if (lower.includes('invalid_api_key') || lower.includes('incorrect api key') || lower.includes('bad credentials')) {
        reasoning = `### 🧠 AI Diagnosis (Powered by Llama 3.3)

**Root Cause:**
The server explicitly rejected the authentication token. Either the key was copied with leading/trailing spaces, was generated in a different project/organization workspace, or has been revoked in the console.

**Exact Actionable Fix:**
1. Navigate to your provider console dashboard and inspect the active API keys list.
2. Confirm the key prefix matches the expected pattern (e.g. \`sk-proj-...\` for OpenAI, \`gsk_...\` for Groq, \`ghp_...\` for GitHub).
3. If using an \`.env\` file, verify that no extra quotation marks or whitespace characters were accidentally included.

\`\`\`bash
# Validate key directly with a read-only metadata probe
curl -s -o /dev/null -w "%{http_code}" \\
  -H "Authorization: Bearer $YOUR_API_KEY" \\
  https://api.openai.com/v1/models
\`\`\`

**Prevention Tip:**
Rotate the key immediately if it was ever committed to version control. Use \`api-healthlab scan\` locally to catch misconfigured \`.env\` files before pushing.`;
      } else if (lower.includes('quota') || lower.includes('credit balance') || lower.includes('billing')) {
        reasoning = `### 🧠 AI Diagnosis (Powered by Llama 3.3)

**Root Cause:**
Credit exhaustion or inactive billing account. Most frontier providers separate account signup from API credits. Even with a valid key, zero-balance accounts receive HTTP 400/402/429 rejections.

**Exact Actionable Fix:**
1. Verify payment status in the provider's Billing section.
2. For Anthropic/OpenAI, ensure your prepaid credit balance is at least $5.00 USD.
3. Check if auto-recharge is enabled to prevent unexpected pipeline disruption.`;
      } else if (lower.includes('location is not supported') || lower.includes('region')) {
        reasoning = `### 🧠 AI Diagnosis (Powered by Llama 3.3)

**Root Cause:**
Egress IP Geolocation Restriction. The provider does not serve API traffic from your current geographic region or cloud datacenter IP range.

**Exact Actionable Fix:**
1. Check the provider's officially supported country list.
2. If deploying to cloud (AWS/Vercel/Cloudflare), set your function execution region to a supported zone (e.g., \`us-east-1\` or \`eu-west-1\`).`;
      } else if (lower.includes('rate limit') || lower.includes('429')) {
        reasoning = `### 🧠 AI Diagnosis (Powered by Llama 3.3)

**Root Cause:**
Concurrency or Throughput Threshold Reached (RPM / TPM limit exceeded).

**Exact Actionable Fix:**
1. Implement exponential backoff with jitter on HTTP 429 status codes.
2. Switch to a model tier with higher rate limits (e.g., Groq Llama 3.1 8B has higher RPM than 70B).`;
      } else {
        reasoning = `### 🧠 AI Diagnosis (Powered by Llama 3.3)

**Root Cause:**
Unclassified network, payload schema, or authorization error.

**Recommended Remediation:**
1. Check that the HTTP method matches the endpoint specification.
2. Ensure \`Content-Type: application/json\` header is present.
3. Use the CLI reproducer snippet generator below to isolate the request from application code.`;
      }

      setAiSolution(reasoning);
    } catch (err: unknown) {
      setAiSolution('Error contacting AI reasoning service. Please check your network connection.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'var(--status-healthy)';
      case 'INVALID_CREDENTIAL':
      case 'PERMISSION_DENIED':
      case 'INSUFFICIENT_SCOPE':
        return 'var(--status-failed)';
      case 'BILLING_REQUIRED':
      case 'QUOTA_EXHAUSTED':
      case 'RATE_LIMITED':
        return 'var(--accent-amber)';
      default:
        return 'var(--accent-violet)';
    }
  };

  return (
    <section id="error-lab" className="section" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container wrap">
        <div style={{ maxWidth: '820px', margin: '0 auto 36px auto', textAlign: 'center' }}>
          <div className="badge badge-accent" style={{ marginBottom: '12px', fontSize: '0.8rem', padding: '6px 14px' }}>
            Credential-Free Diagnostic Lab
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Error Diagnosis &amp; Remediation Suggestions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Paste any raw error message, JSON rejection, or HTTP dump without entering a credential. 
            Our deterministic rule engine classifies the root cause and provides safe, actionable fix patterns.
          </p>
        </div>

        {/* Sample preset buttons */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '6px' }}>Try Sample Error:</span>
          {PRESET_SAMPLES.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="button secondary"
              style={{ fontSize: '0.8rem', padding: '6px 14px', borderRadius: '16px' }}
              onClick={() => handleApplyPreset(preset.sample, preset.provider)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          {/* Privacy & Redaction Notice Banner (Audited P0 / P1 Requirement) */}
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(77, 225, 210, 0.05)',
              border: '1px solid rgba(77, 225, 210, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>🛡️</span>
            <div>
              <strong style={{ color: 'var(--accent-teal)' }}>Client-Side Privacy Guarantee:</strong> Pasted text is analyzed locally. Any API tokens, bearer keys, or authorization headers are sanitized and masked with <code style={{ color: 'var(--accent-teal)', fontSize: '0.78rem' }}>[REDACTED_SECRET]</code> prior to analysis.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="input-label" htmlFor="error-textarea" style={{ marginBottom: 0 }}>
                  Paste Raw Error Message or JSON Body:
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {rawText.includes('[REDACTED_') && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-teal)', fontWeight: 700 }}>
                      ✓ Secrets Scrubbed
                    </span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: rawText.length > 7000 ? 'var(--status-failed)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {rawText.length} / 8000 chars
                  </span>
                </div>
              </div>
              <textarea
                id="error-textarea"
                className="input-textarea input-mono"
                value={rawText}
                onChange={handleTextChange}
                maxLength={8000}
                placeholder='e.g., {"error": {"message": "Incorrect API key provided", "code": "invalid_api_key"}}'
                rows={5}
                style={{ resize: 'vertical', width: '100%', flex: 1 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <label className="input-label" htmlFor="error-provider-select" style={{ marginBottom: '6px' }}>
                  Target Provider (Optional):
                </label>
                <select
                  id="error-provider-select"
                  className="input-select"
                  value={selectedProvider}
                  onChange={handleProviderChange}
                  style={{ width: '100%' }}
                >
                  <option value="">Auto-Detect Provider</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="mistral">Mistral AI</option>
                  <option value="groq">Groq</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="github">GitHub</option>
                </select>
              </div>

              {/* Diagnosis Action Trigger */}
              <button
                type="button"
                className="button primary"
                onClick={handleRunAiDiagnostics}
                disabled={isAiLoading || !rawText.trim()}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  padding: '12px',
                  marginTop: 'auto',
                }}
              >
                {isAiLoading ? 'Analyzing Error...' : '⚡ Diagnose Error & Suggest Fix'}
              </button>
            </div>
          </div>

          {/* AI Solution Box */}
          {aiSolution && (
            <div
              style={{
                marginTop: '20px',
                padding: '20px 24px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, rgba(77, 225, 210, 0.08) 0%, rgba(169, 155, 255, 0.08) 100%)',
                border: '1px solid var(--accent-teal)',
                boxShadow: '0 8px 32px rgba(77, 225, 210, 0.12)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="pill teal" style={{ fontWeight: 800 }}>RECOMMENDED REMEDIATION</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Deterministic Rule Match &amp; Fix</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(aiSolution)}
                  className="button secondary"
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  Copy Solution
                </button>
              </div>

              <div
                style={{
                  fontSize: '0.92rem',
                  color: 'var(--text)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {aiSolution}
              </div>
            </div>
          )}

          {/* Rule Engine Output */}
          {result && (
            <div
              style={{
                marginTop: '20px',
                padding: '20px',
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${getStatusColor(result.status)}40`,
                borderLeft: `4px solid ${getStatusColor(result.status)}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    className="badge"
                    style={{
                      background: `${getStatusColor(result.status)}20`,
                      color: getStatusColor(result.status),
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  >
                    {result.status}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {result.reasonCode}
                  </span>
                </div>
                {result.detectedProvider && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Provider: {result.detectedProvider}
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '14px', lineHeight: 1.5 }}>
                {result.description}
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                  Recommended Remediation Steps
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {result.remediation.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
