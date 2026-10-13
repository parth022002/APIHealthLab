import React, { useState } from 'react';

interface NavbarProps {
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="topbar" style={{ position: 'sticky', top: 0, zIndex: 1000, backdropFilter: 'blur(20px)', background: 'rgba(9, 10, 18, 0.85)', borderBottom: '1px solid var(--border-subtle)' }}>
      <nav className="wrap nav" aria-label="Main Navigation" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', gap: '16px' }}>
        {/* Brand Logo & Name */}
        <a href="#top" className="brand" aria-label="API HealthLab Home" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img
            src="/brand/api-healthlab-mark.png"
            alt="API HealthLab Neon Flask Mark"
            className="brand-logo-img"
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'contain',
              mixBlendMode: 'screen',
              filter: 'drop-shadow(0 0 10px rgba(77, 225, 210, 0.6))',
            }}
          />
          <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            API HealthLab
          </span>
        </a>

        {/* Global Interactive Search Input Bar */}
        <div style={{ flex: '1', maxWidth: '360px', margin: '0 12px' }} className="nav-search-wrapper">
          <button
            type="button"
            onClick={onOpenSearch}
            className="nav-search-button"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 14px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--accent-teal)' }}>🔍</span>
              <span>Search 23 APIs & tools...</span>
            </span>
            <kbd
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                padding: '1px 6px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
              }}
            >
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="navlinks desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a href="#diagnose" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Live Diagnostic</a>
          <a href="#error-lab" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Error Lab</a>
          <a href="#providers" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Providers</a>
          <a href="#trust" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Security</a>
          <a href="#diagnose" className="button primary nav-cta" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
            Start Diagnostic <span aria-hidden="true">&rarr;</span>
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text)',
            padding: '6px 10px',
            cursor: 'pointer',
            fontSize: '18px',
          }}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-drawer"
          style={{
            padding: '16px 24px 24px 24px',
            background: 'var(--bg-card-surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <a
            href="#diagnose"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '8px 0', fontSize: '1rem', color: 'var(--text)' }}
          >
            ⚡ Live Diagnostic Suite
          </a>
          <a
            href="#error-lab"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '8px 0', fontSize: '1rem', color: 'var(--text)' }}
          >
            🧠 AI Error Lab
          </a>
          <a
            href="#providers"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '8px 0', fontSize: '1rem', color: 'var(--text)' }}
          >
            📚 23 Verified Providers
          </a>
          <a
            href="#trust"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '8px 0', fontSize: '1rem', color: 'var(--text)' }}
          >
            🛡️ Zero-Trust Architecture
          </a>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSearch();
            }}
            className="button secondary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
          >
            🔍 Search Providers & Tools
          </button>
          <a
            href="#diagnose"
            onClick={() => setMobileMenuOpen(false)}
            className="button primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Launch Diagnostics &rarr;
          </a>
        </div>
      )}
    </header>
  );
};
