import React from 'react';

export const TrustArchitecture: React.FC = () => {
  const gates = [
    {
      num: '01',
      title: 'Preflight & Lifecycle Gate',
      desc: 'Validates target provider lifecycle is ACTIVE. Enforces exact host allowlists. Any unvetted domain or DEPRECATED provider is rejected immediately before credential materialization.',
    },
    {
      num: '02',
      title: 'Intent & 128-Rule Policy Engine',
      desc: 'Calculates the Cartesian risk score across 128 combinations of CredentialRisk, SideEffect, CostClass, and ExecutionMode. Policy defaults to DENY unless explicitly approved.',
    },
    {
      num: '03',
      title: 'Redaction & Zero Retention',
      desc: 'Wraps tokens in non-serializable SecretValue containers. Automatically registers credentials with RedactionContext so snippets, error strings, and telemetry are scrubbed.',
    },
    {
      num: '04',
      title: 'ControlledFetch Sandboxed Egress',
      desc: 'Blocks 3xx redirect following to stop SSRF attacks. Strips forbidden hop headers, enforces 6s provider timeout (8s total hosted budget), caps request bodies to 32 KiB and response bodies to 128 KiB, and logs zero raw payloads.',
    },
    {
      num: '05',
      title: 'Deterministic Diagnostics',
      desc: 'Parses status codes and error payloads against verified provider patterns. Delivers machine-verifiable DiagnosticStatus and reproducible curl/TS/Python code snippets.',
    },
  ];

  return (
    <section id="trust" style={{ padding: '80px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container wrap">
        <div style={{ maxWidth: '800px', margin: '0 auto 48px auto', textAlign: 'center' }}>
          <div className="badge badge-accent" style={{ marginBottom: '12px' }}>
            Audited Security &amp; Trust Boundaries
          </div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '16px' }}>
            Five Security Gates. Zero Credential Persistence.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Designed around transparent boundaries: credentials run in-memory transiently, every egress path is allowlisted, 
            and the policy engine is tested across 128 risk, side-effect, cost and execution-mode combinations, with deny-by-default behavior.
          </p>
        </div>

        {/* 5-Gate Flow */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '56px' }}>
          {gates.map((g) => (
            <div
              key={g.num}
              className="card"
              style={{
                padding: '24px 20px',
                position: 'relative',
                overflow: 'hidden',
                background: 'var(--bg-card)',
              }}
            >
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: 'rgba(169, 155, 255, 0.2)',
                  marginBottom: '12px',
                }}
              >
                {g.num}
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>
                {g.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {g.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Execution Surface Comparison Table */}
        <div className="card" style={{ padding: '32px', background: 'var(--bg-card-surface)', marginBottom: '36px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 6px 0' }}>
              Execution Boundary Comparison
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
              Compare how credentials, network traffic, and evidence are handled across API HealthLab execution modes.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>Security Boundary</th>
                  <th style={{ padding: '12px 16px', color: 'var(--accent-teal)' }}>Local CLI Execution</th>
                  <th style={{ padding: '12px 16px', color: 'var(--accent-violet)' }}>Hosted Edge Runner</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>Network Egress Path</td>
                  <td style={{ padding: '14px 16px', color: 'var(--status-healthy)' }}>Direct from local machine to provider host</td>
                  <td style={{ padding: '14px 16px', color: 'var(--accent-violet)' }}>Browser &rarr; Cloudflare Edge Worker &rarr; Provider host</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>Credential Handling</td>
                  <td style={{ padding: '14px 16px', color: 'var(--status-healthy)' }}>
                    Sent over HTTPS directly to selected provider for the test; never transmitted to API HealthLab hosted infrastructure
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--status-healthy)' }}>
                    No intentional persistent storage; transient credential handling strictly within Edge Worker execution scope; immediate redaction
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>Disk & Database Persistence</td>
                  <td style={{ padding: '14px 16px', color: 'var(--status-healthy)' }}>Zero disk storage</td>
                  <td style={{ padding: '14px 16px', color: 'var(--status-healthy)' }}>
                    Zero database, zero disk logging, zero telemetry collection of credentials or response bodies, no session store
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>SSRF & Redirect Policy</td>
                  <td style={{ padding: '14px 16px', color: 'var(--status-healthy)' }}>Exact host lock; manual redirect handling</td>
                  <td style={{ padding: '14px 16px', color: 'var(--status-healthy)' }}>Exact host allowlist lock; deny-by-default redirection</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>Safety & Policy Gate</td>
                  <td style={{ padding: '14px 16px', color: 'var(--status-healthy)' }}>128-combination Cartesian matrix (Core Engine)</td>
                  <td style={{ padding: '14px 16px', color: 'var(--status-healthy)' }}>128-combination Cartesian matrix (Core Engine)</td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>Redaction in Snippets & Logs</td>
                  <td style={{ padding: '14px 16px', color: 'var(--status-healthy)' }}>RedactionContext enforces placeholder $API_KEY</td>
                  <td style={{ padding: '14px 16px', color: 'var(--status-healthy)' }}>RedactionContext enforces placeholder $API_KEY</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Balanced Trust Model: What We Guarantee vs What We Cannot Guarantee */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          <div
            className="card"
            style={{
              padding: '24px',
              border: '1px solid rgba(77, 225, 210, 0.3)',
              background: 'rgba(77, 225, 210, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>🛡️</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--accent-teal)' }}>
                What We Guarantee
              </h4>
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              <li><strong>Zero Intentional Retention:</strong> Credentials are never written to persistent disk, databases, or analytics trackers.</li>
              <li><strong>SSRF &amp; Host Allowlist Lock:</strong> Only reviewed, allowlisted endpoints from version-controlled manifests can be contacted.</li>
              <li><strong>Deterministic Policy Evaluation:</strong> Every probe request is evaluated against risk, side-effect, and cost rules before dispatch.</li>
              <li><strong>Immediate Redaction:</strong> In-flight secrets are scrubbed and replaced with safe environment variable placeholders in all diagnostics.</li>
            </ul>
          </div>

          <div
            className="card"
            style={{
              padding: '24px',
              border: '1px solid rgba(255, 180, 0, 0.3)',
              background: 'rgba(255, 180, 0, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--accent-amber)' }}>
                What We Cannot Guarantee
              </h4>
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              <li><strong>Provider Availability &amp; Outages:</strong> Upstream server downtime, vendor rate-limiting shifts, or network partitions.</li>
              <li><strong>Unselected Permissions:</strong> Probing one scoped intent (e.g. LIST_MODELS) does not establish access to fine-tuning or chat endpoints.</li>
              <li><strong>Prepaid Account Balances:</strong> Probes prove key validity and host reachability, not the monetary balance of your vendor account.</li>
              <li><strong>Downstream Provider Handling:</strong> Authenticated requests must transmit the secret over TLS directly to the provider host.</li>
              <li><strong>Forensic RAM Erasure:</strong> JavaScript runtime garbage collectors do not guarantee hardware memory zeroing; we guarantee zero intentional retention.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
