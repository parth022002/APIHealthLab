import React from 'react';

interface SectionFlowIndicatorProps {
  step: string;
  total?: string;
  title: string;
  subtitle: string;
  targetId?: string;
}

export const SectionFlowIndicator: React.FC<SectionFlowIndicatorProps> = ({
  step,
  total = '05',
  title,
  subtitle,
}) => {
  return (
    <div className="section-flow-divider" style={{ position: 'relative', width: '100%', padding: '36px 0 20px 0' }}>
      {/* Animated Glowing Laser Conduits */}
      <div
        style={{
          width: '100%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(77, 225, 210, 0.4) 30%, rgba(169, 155, 255, 0.5) 70%, transparent 100%)',
          position: 'relative',
          marginBottom: '20px',
        }}
      >
        {/* Pulsing energy dot that traverses the line */}
        <div
          style={{
            position: 'absolute',
            top: '-2px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '5px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #4DE1D2, #A99BFF)',
            boxShadow: '0 0 12px #4DE1D2, 0 0 20px #A99BFF',
          }}
        />
      </div>

      <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--teal)',
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'rgba(77, 225, 210, 0.1)',
              border: '1px solid rgba(77, 225, 210, 0.3)',
              letterSpacing: '0.1em',
            }}
          >
            STAGE {step} // {total}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {title}
          </span>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          {subtitle} &darr;
        </div>
      </div>
    </div>
  );
};
