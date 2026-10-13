import React, { useState } from 'react';

interface Stage {
  name: string;
  sub: string;
  status: string;
  evidenceText?: string;
}

const STAGES: Stage[] = [
  {
    name: '01 · Intent validated',
    sub: 'Action target schema and parameters checked before touching credentials',
    status: 'PASS',
    evidenceText: 'Intent: LIST_MODELS (Category: METADATA, Risk: R1)',
  },
  {
    name: '02 · Policy evaluated',
    sub: 'Total 128-case risk × cost × side-effect × mode evaluated',
    status: 'ALLOW',
    evidenceText: 'Policy: ALLOW (Mode: LOCAL, Cost: FREE, Mutation: NONE)',
  },
  {
    name: '03 · Probe response observed',
    sub: 'Outbound fetch dispatched strictly via ControlledFetch security boundary',
    status: 'HTTP 200',
    evidenceText: 'Transport: HTTPS status 200 OK (Latency: 142ms)',
  },
  {
    name: '04 · Evidence classified',
    sub: 'Allowlisted facts aggregated into normalized DiagnosticStatus',
    status: 'HEALTHY',
    evidenceText: 'Status: HEALTHY (Reason: REQUEST_SUCCESS)',
  },
  {
    name: '05 · Next action explained',
    sub: 'Truthful verification boundaries and reproducible snippet generated',
    status: 'READY',
    evidenceText: 'Remediation: Key is verified for model listing. Ready for integration.',
  },
];

export const ProofPathDemo: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(4);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const runSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveStep(0);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current >= STAGES.length) {
        clearInterval(interval);
        setIsRunning(false);
      } else {
        setActiveStep(current);
      }
    }, 700);
  };

  return (
    <section className="section" id="demo">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="kicker">The Signature Workflow</div>
            <h2>The Proof Path: Every Result Has A Reason.</h2>
          </div>
          <p>
            API HealthLab connects every test to observable evidence and a clear next action.
            Watch the diagnostic pipeline evaluate states sequentially below.
          </p>
        </div>

        <div className="panel" style={{ border: '1px solid rgba(169, 155, 255, 0.25)' }}>
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className={`status-dot ${isRunning ? 'active' : 'pass'}`} />
              <span className="panel-title">Proof Path Interactive Walkthrough</span>
            </div>
            <span className="pill warning">SIMULATION ONLY · NO CREDENTIAL SENT</span>
          </div>

          <div className="panel-body" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)', gap: '30px' }}>
            {/* Steps Timeline */}
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {STAGES.map((stage, idx) => {
                  const isCurrent = activeStep === idx;
                  const isPassed = activeStep > idx;

                  return (
                    <div
                      key={stage.name}
                      style={{
                        padding: '14px 18px',
                        borderRadius: 'var(--radius-md)',
                        border: isCurrent
                          ? '1px solid var(--teal)'
                          : isPassed
                            ? '1px solid rgba(55, 201, 150, 0.4)'
                            : '1px solid var(--border)',
                        background: isCurrent
                          ? 'rgba(77, 225, 210, 0.08)'
                          : isPassed
                            ? 'rgba(55, 201, 150, 0.04)'
                            : 'rgba(9, 10, 18, 0.5)',
                        transition: 'all var(--standard) ease',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: isCurrent ? 'var(--teal)' : 'var(--text)' }}>
                          {stage.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                          {stage.sub}
                        </div>
                      </div>
                      <span
                        className={`pill ${isPassed ? 'success' : isCurrent ? 'teal' : 'violet'}`}
                        style={{ fontSize: '10px' }}
                      >
                        {isPassed ? 'DONE ✓' : isCurrent ? 'RUNNING' : 'WAITING'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  className="button primary"
                  onClick={runSimulation}
                  disabled={isRunning}
                >
                  {isRunning ? 'Advancing Proof Path…' : 'Replay Walkthrough Sequence ↻'}
                </button>
              </div>
            </div>

            {/* Evidence & Terminal Inspector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: 'rgba(9, 10, 18, 0.85)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                }}
              >
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--teal)', marginBottom: '8px' }}>
                  $ ACTIVE PROBE STAGE TELEMETRY
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
                  {STAGES[activeStep]?.evidenceText}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--subtle)', lineHeight: 1.5 }}>
                  This illustrative sequence demonstrates how real diagnostic events stream via NDJSON
                  from the shared engine to your browser or terminal.
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(9, 10, 18, 0.95)',
                  border: '1px solid rgba(42, 48, 68, 0.8)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--muted)',
                  lineHeight: 1.7,
                }}
              >
                <div style={{ color: 'var(--violet)', marginBottom: '6px' }}># Equivalent local command:</div>
                <div>api-healthlab test openai \</div>
                <div style={{ paddingLeft: '14px' }}>--intent LIST_MODELS \</div>
                <div style={{ paddingLeft: '14px' }}>--env OPENAI_API_KEY</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
