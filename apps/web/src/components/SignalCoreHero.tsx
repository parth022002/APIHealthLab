import React, { useState } from 'react';

interface NodeConcept {
  title: string;
  sub: string;
  desc: string;
  badge: string;
}

const NODES: Record<string, NodeConcept> = {
  provider: {
    title: 'Provider Manifest',
    sub: 'Static allowlist of verified endpoints',
    desc: 'Each provider adheres to an immutable, version-controlled manifest defining exact hostnames, header schemes, and request contracts.',
    badge: 'STAGE 01',
  },
  intent: {
    title: 'Scoped Intent',
    sub: 'Bounded test action',
    desc: 'Probes test what a credential can actually do (read metadata, list models, probe permissions) without billable mutation or state leakage.',
    badge: 'STAGE 02',
  },
  policy: {
    title: '128-Rule Policy',
    sub: 'Risk × Side-Effect × Cost Bounds',
    desc: 'A Cartesian policy matrix evaluates every combination of risk, side effect, and cost before materializing or transmitting any credential.',
    badge: 'STAGE 03',
  },
  evidence: {
    title: 'Evidence & Proof',
    sub: 'Structured diagnostics',
    desc: 'Observed HTTP transport codes and provider error payloads are classified into normalized DiagnosticStatus and actionable remediation.',
    badge: 'STAGE 04',
  },
};

export const SignalCoreHero: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleCopyCli = () => {
    navigator.clipboard.writeText('npx @api-healthlab/cli --help');
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <section className="section hero-section" style={{ paddingTop: 'clamp(44px, 7vw, 76px)', paddingBottom: 'clamp(56px, 8vw, 92px)', overflow: 'hidden' }}>
      <div className="wrap hero-wrap" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(340px, 0.9fr)', gap: 'clamp(32px, 5vw, 56px)', alignItems: 'center' }}>
        {/* Left Column: Mission, Value Proposition, & Quick Actions */}
        <div className="hero-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span className="pill teal" style={{ boxShadow: '0 0 14px rgba(77, 225, 210, 0.35)', fontSize: '11px', fontWeight: 700 }}>
              DEVELOPER PREVIEW v0.1.0
            </span>
            <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              7 Core Verified MVP &bull; 16 Expanded Beta Providers
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.3rem, 4.3vw, 3.8rem)',
              lineHeight: 1.12,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: '20px',
            }}
          >
            Know What Your API Credential <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #A99BFF 0%, #4DE1D2 55%, #FFFFFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 20px rgba(77, 225, 210, 0.35))',
              }}
            >
              Can Actually Do.
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
              color: 'var(--muted)',
              lineHeight: 1.6,
              maxWidth: '560px',
              marginBottom: '28px',
            }}
          >
            Test a specific API action. Inspect the evidence. Understand the failure.
            Fix the configuration without exposing raw credentials or trusting opaque cloud black boxes.
          </p>

          {/* Primary Action Sequence (Audited P0 / P1 Hierarchy) */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '22px' }}>
            <a 
              href="#diagnose" 
              className="button primary" 
              style={{ 
                padding: '14px 28px', 
                fontSize: '15px', 
                fontWeight: 700, 
                boxShadow: '0 4px 20px rgba(169, 155, 255, 0.35)' 
              }}
            >
              Start a Diagnostic <span aria-hidden="true">&rarr;</span>
            </a>
            <a 
              href="#error-lab" 
              className="button secondary" 
              style={{ 
                padding: '13px 22px', 
                fontSize: '14px',
                border: '1px solid var(--border-default)',
                background: 'rgba(23, 27, 42, 0.6)'
              }}
            >
              Try Sample Error Lab
            </a>
          </div>

          {/* Compact Local CLI Execution Reference */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Prefer zero cloud transit? Run locally:</span>
            <button
              type="button"
              className="button secondary"
              onClick={handleCopyCli}
              style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '11px', 
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(77, 225, 210, 0.25)',
                color: 'var(--accent-teal)'
              }}
              title="Click to copy CLI command"
            >
              {copiedSnippet ? '✓ Copied to Clipboard' : '$ npx @api-healthlab/cli --help'}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '20px',
              fontSize: '12px',
              color: 'var(--muted)',
              borderTop: '1px solid var(--border)',
              paddingTop: '20px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--teal)' }}>✓</span> Intent before credential
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--teal)' }}>✓</span> 128-combination policy test matrix
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--teal)' }}>✓</span> Zero credential persistence
            </span>
          </div>
        </div>

        {/* Right Column: Holographic Glass Quantum Showcase */}
        <div className="hero-crucible-wrapper" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {/* Ambient Multi-Layer Radial Glow behind the vessel */}
          <div
            style={{
              position: 'absolute',
              top: '15%',
              width: '380px',
              height: '380px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(77, 225, 210, 0.3) 0%, rgba(169, 155, 255, 0.22) 50%, transparent 75%)',
              filter: 'blur(50px)',
              pointerEvents: 'none',
              animation: 'pulse-glow 4s ease-in-out infinite alternate',
            }}
          />

          {/* Premium Cyber Holographic Chassis */}
          <div
            className="holographic-showcase-card"
            style={{
              position: 'relative',
              zIndex: 3,
              width: '100%',
              maxWidth: '430px',
              background: 'linear-gradient(180deg, rgba(16, 20, 36, 0.85) 0%, rgba(9, 11, 20, 0.95) 100%)',
              border: '1px solid rgba(77, 225, 210, 0.3)',
              borderRadius: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75), 0 0 30px rgba(77, 225, 210, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              padding: '24px',
              overflow: 'hidden',
              animation: 'float-brand 6s ease-in-out infinite',
            }}
          >
            {/* Top HUD Status Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '16px',
                marginBottom: '16px',
                borderBottom: '1px solid rgba(42, 48, 68, 0.6)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="status-dot active" />
                <span style={{ color: 'var(--teal)', fontWeight: 700, letterSpacing: '0.05em' }}>
                  CORE CRUCIBLE
                </span>
              </div>
              <span style={{ color: 'var(--muted)', fontSize: '10px' }}>
                INTENT_DIAGNOSTICS_ENGINE
              </span>
            </div>

            {/* Central Master Logo Display */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '12px 0 20px 0',
                position: 'relative',
              }}
            >
              <img
                src="/brand/api-healthlab-mark.png"
                alt="API HealthLab Official Brand Mark"
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  height: 'auto',
                  borderRadius: '16px',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 24px rgba(77, 225, 210, 0.25)',
                  userSelect: 'none',
                  transition: 'transform 0.3s ease',
                }}
              />
            </div>

            {/* Bottom Cybernetic Telemetry Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '14px',
                borderTop: '1px solid rgba(42, 48, 68, 0.6)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span>AUTH: ZERO_SECRET</span>
              <span>HOST: ALLOWLISTED</span>
              <span>POLICY: 128_RULES</span>
            </div>
          </div>

          {/* Symmetrical 4 Architecture Pillars Command Grid */}
          <div
            style={{
              width: '100%',
              maxWidth: '430px',
              marginTop: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              position: 'relative',
              zIndex: 3,
            }}
          >
            {Object.entries(NODES).map(([key, node]) => {
              const isSelected = activeNode === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveNode(isSelected ? null : key)}
                  style={{
                    padding: '10px 14px',
                    background: isSelected ? 'var(--surface-active)' : 'rgba(18, 21, 35, 0.85)',
                    border: isSelected ? '1px solid var(--teal)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text)',
                    boxShadow: isSelected ? '0 0 20px rgba(77, 225, 210, 0.35)' : 'none',
                    backdropFilter: 'blur(12px)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: isSelected ? 'var(--teal)' : 'var(--text)' }}>
                      {node.title}
                    </span>
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--teal)' }}>
                      {node.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', lineHeight: 1.3 }}>
                    {node.sub}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Concept Detail Drawer */}
          {activeNode && (
            <div
              style={{
                width: '100%',
                maxWidth: '430px',
                marginTop: '12px',
                padding: '14px 18px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(23, 27, 42, 0.98)',
                border: '1px solid var(--teal)',
                boxShadow: '0 8px 24px rgba(77, 225, 210, 0.2)',
                position: 'relative',
                zIndex: 4,
                animation: 'fade-in 0.2s ease-out',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <span className="kicker" style={{ fontSize: '10px', margin: 0 }}>
                  {NODES[activeNode]!.title} Specification
                </span>
                <button
                  type="button"
                  onClick={() => setActiveNode(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--muted)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    padding: '0 4px',
                  }}
                >
                  ✕
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text)', lineHeight: 1.5 }}>
                {NODES[activeNode]!.desc}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
