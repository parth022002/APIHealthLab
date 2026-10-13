import React from 'react';

interface FloatingToken {
  text: string;
  top: string;
  left: string;
  delay: string;
  duration: string;
  color: string;
  size: string;
}

const CYBER_TOKENS: FloatingToken[] = [
  { text: '{API_VERIFIED}', top: '14%', left: '3%', delay: '0s', duration: '20s', color: 'var(--teal)', size: '10px' },
  { text: '0x7F_CREDENTIAL', top: '24%', left: '92%', delay: '2s', duration: '24s', color: 'var(--violet)', size: '10px' },
  { text: 'TLS 1.3 // PROBE', top: '48%', left: '2%', delay: '4s', duration: '22s', color: 'var(--teal)', size: '10px' },
  { text: 'policy::ALLOW(R0)', top: '65%', left: '91%', delay: '1s', duration: '25s', color: 'var(--amber)', size: '10px' },
  { text: '🛡️ ZERO_PERSISTENCE', top: '82%', left: '3%', delay: '5s', duration: '21s', color: 'var(--violet)', size: '10px' },
  { text: 'AES-GCM-256', top: '90%', left: '92%', delay: '3s', duration: '26s', color: 'var(--teal)', size: '10px' },
];

export const CyberBackgroundCanvas: React.FC = () => {
  return (
    <div
      className="cyber-bg-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '980px',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        maskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
      }}
    >
      {/* Ambient Radial Energy Spots */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '20%',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(169, 155, 255, 0.08) 0%, transparent 65%)',
          filter: 'blur(70px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '40%',
          right: '-10%',
          width: '750px',
          height: '750px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(77, 225, 210, 0.06) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(246, 190, 99, 0.05) 0%, transparent 65%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Cyber Grid with Perspective Scanline Sweep */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 85%)',
          opacity: 0.7,
        }}
      />

      {/* Floating Cryptographic Tokens & API Runes */}
      {CYBER_TOKENS.map((token, idx) => (
        <div
          key={idx}
          className="cyber-float-token"
          style={{
            position: 'absolute',
            top: token.top,
            left: token.left,
            fontFamily: 'var(--font-mono)',
            fontSize: token.size,
            color: token.color,
            opacity: 0.22,
            letterSpacing: '0.08em',
            border: `1px solid ${token.color}20`,
            background: 'rgba(10, 12, 22, 0.45)',
            padding: '3px 8px',
            borderRadius: '4px',
            boxShadow: `0 0 10px ${token.color}15`,
            animation: `cyber-drift ${token.duration} ease-in-out ${token.delay} infinite alternate`,
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {token.text}
        </div>
      ))}
    </div>
  );
};
