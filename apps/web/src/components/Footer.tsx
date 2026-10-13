import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ background: 'var(--bg-canvas)', borderTop: '1px solid var(--border-subtle)', padding: '64px 0 36px 0', position: 'relative', zIndex: 2 }}>
      <div className="wrap">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '48px' }}>
          {/* Brand & Developer Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <img
                src="/brand/api-healthlab-mark.png"
                alt="API HealthLab"
                style={{
                  width: '34px',
                  height: '34px',
                  objectFit: 'contain',
                  mixBlendMode: 'screen',
                  filter: 'drop-shadow(0 0 10px rgba(77, 225, 210, 0.7))',
                }}
              />
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                API HealthLab
              </span>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: '360px', marginBottom: '14px' }}>
              Intent-aware, evidence-driven API credential and integration diagnostics.
              Test scopes and debug errors without leaking secrets to external servers.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <div>
                Lead Developer & Architect:{' '}
                <span style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>
                  Parth Ahuja
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
                <span className="badge" style={{ fontSize: '0.72rem', background: 'rgba(77, 225, 210, 0.1)', color: 'var(--accent-teal)' }}>
                  🟢 7 Core MVP + 16 Beta Probers
                </span>
                <span className="badge" style={{ fontSize: '0.72rem', background: 'rgba(169, 155, 255, 0.1)', color: 'var(--accent-violet)' }}>
                  Developer Preview v0.1.0
                </span>
              </div>
            </div>
          </div>

          {/* Local CLI Quickstart */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Local CLI Quickstart
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
              Run local offline audits without transmitting secrets over the wire:
            </p>
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: 'var(--accent-teal)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>npx @api-healthlab/cli --help</span>
            </div>
          </div>

          {/* Deep Navigation */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Navigation & Diagnostic Tools
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
              <li>
                <a href="#diagnose" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  ⚡ Live Diagnostic Workspace
                </a>
              </li>
              <li>
                <a href="#error-lab" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  🧪 Credential-Free Error Lab
                </a>
              </li>
              <li>
                <a href="#providers" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  📚 Provider Capability Matrix (23)
                </a>
              </li>
              <li>
                <a href="#trust" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  🛡️ Security &amp; Execution Boundaries
                </a>
              </li>
            </ul>
          </div>

          {/* Trust, Limits & Governance */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Trust &amp; Governance
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
              <li>
                <a href="#trust" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  🔒 Zero-Persistence Privacy Guarantee
                </a>
              </li>
              <li>
                <a href="#providers" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  ⚠️ Provider Verification Limits
                </a>
              </li>
              <li>
                <a href="#trust" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  🛡️ 128-Rule Policy Bounds
                </a>
              </li>
              <li>
                <a href="mailto:security@apihealthlab.dev" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  📬 Responsible Disclosure Program
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Diagnostic Engine Disclaimer Box */}
        <div
          style={{
            background: 'rgba(77, 225, 210, 0.04)',
            border: '1px solid rgba(77, 225, 210, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px 20px',
            marginBottom: '32px',
            fontSize: '0.82rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
          }}
        >
          <strong style={{ color: 'var(--accent-teal)' }}>🛡️ Diagnostic Engine Disclaimer:</strong>{' '}
          API HealthLab utilizes reviewed provider manifests, strict transport sandboxing, and deterministic rule classification to diagnose error messages and synthesize remediation guidance. Always test generated code snippets and credentials in isolated staging environments prior to production rollout.
        </div>

        {/* Bottom Copyright & Authorship */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} API HealthLab. Designed and Engineered by{' '}
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Parth Ahuja</span>. Open Source under MIT License.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Zero-Credential Persistence</span>
            <span>&bull;</span>
            <span>128-Combination Policy Matrix</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
