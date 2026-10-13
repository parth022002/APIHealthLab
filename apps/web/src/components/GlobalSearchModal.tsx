import React, { useState, useEffect, useRef } from 'react';
import { ALL_MANIFESTS } from '@api-healthlab/providers';

export interface SearchItem {
  id: string;
  title: string;
  category: 'Provider' | 'Feature' | 'Error Dump';
  description: string;
  badge?: string;
  action: () => void;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Build searchable items
  const allItems: SearchItem[] = [
    // Core Features
    {
      id: 'feature-diagnose',
      title: 'Live Credential Diagnostic',
      category: 'Feature',
      description: 'Run preflight probes, inspect token scopes, and test endpoints safely.',
      badge: 'Core Tool',
      action: () => {
        window.location.hash = '#diagnose';
        onClose();
      },
    },
    {
      id: 'feature-error-lab',
      title: 'AI Error Lab & Remediation',
      category: 'Feature',
      description: 'Paste raw error dumps to get instant root cause analysis and AI code fixes.',
      badge: 'AI Engine',
      action: () => {
        window.location.hash = '#error-lab';
        onClose();
      },
    },
    {
      id: 'feature-catalog',
      title: 'Provider Capability Catalog',
      category: 'Feature',
      description: 'Explore all 23 verified API providers, host allowlists, and intents.',
      badge: '23 APIs',
      action: () => {
        window.location.hash = '#providers';
        onClose();
      },
    },
    {
      id: 'feature-trust',
      title: 'Zero-Trust Architecture',
      category: 'Feature',
      description: 'Inspect our 128-rule policy engine, memory redaction, and free-tier invariants.',
      badge: 'Security',
      action: () => {
        window.location.hash = '#trust';
        onClose();
      },
    },

    // 23 Providers
    ...Object.values(ALL_MANIFESTS).map((m): SearchItem => ({
      id: `provider-${m.id}`,
      title: `${m.displayName} (${m.id})`,
      category: 'Provider',
      description: `Allowed host: ${m.hosts[0]} • Auth: ${m.auth.methods.join(', ')}`,
      badge: 'API Key / Token',
      action: () => {
        window.location.hash = '#diagnose';
        // Dispatch custom event to select provider in LiveDiagnostic
        window.dispatchEvent(new CustomEvent('select-diagnostic-provider', { detail: m.id }));
        onClose();
      },
    })),

    // Common Error Presets
    {
      id: 'err-openai-401',
      title: 'OpenAI 401 Invalid Key',
      category: 'Error Dump',
      description: 'Incorrect API key provided or revoked credentials.',
      badge: 'HTTP 401',
      action: () => {
        window.location.hash = '#error-lab';
        onClose();
      },
    },
    {
      id: 'err-groq-429',
      title: 'Rate Limit Exceeded (429)',
      category: 'Error Dump',
      description: 'Tokens per minute (TPM) or requests per minute exceeded.',
      badge: 'HTTP 429',
      action: () => {
        window.location.hash = '#error-lab';
        onClose();
      },
    },
    {
      id: 'err-github-auth',
      title: 'GitHub Bad Credentials',
      category: 'Error Dump',
      description: 'Personal Access Token expired or insufficient scope.',
      badge: 'HTTP 401',
      action: () => {
        window.location.hash = '#error-lab';
        onClose();
      },
    },
  ];

  const filteredItems = allItems.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }).slice(0, 10);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="global-search-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(5, 7, 15, 0.75)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: 'clamp(40px, 12vh, 100px)',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}
    >
      <div
        className="global-search-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'var(--bg-card-surface)',
          border: '1px solid var(--accent-teal)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(77, 225, 210, 0.25)',
          overflow: 'hidden',
          animation: 'fade-in 0.2s ease-out',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-default)',
            background: 'rgba(0, 0, 0, 0.35)',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '18px', color: 'var(--accent-teal)' }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search all 23 providers, diagnostic tools, error dumps..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontFamily: 'var(--font-sans)',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Clear
            </button>
          )}
          <kbd
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              color: 'var(--text-muted)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px' }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No matches found for &ldquo;{query}&rdquo;. Try &ldquo;OpenAI&rdquo;, &ldquo;DeepSeek&rdquo;, or &ldquo;Rate Limit&rdquo;.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isSelected
                      ? 'linear-gradient(90deg, rgba(77, 225, 210, 0.12) 0%, rgba(169, 155, 255, 0.08) 100%)'
                      : 'transparent',
                    border: isSelected ? '1px solid rgba(77, 225, 210, 0.35)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: isSelected ? 'var(--accent-teal)' : 'var(--text-primary)',
                        }}
                      >
                        {item.title}
                      </span>
                      <span
                        className="badge"
                        style={{
                          fontSize: '0.68rem',
                          padding: '1px 6px',
                          background: item.category === 'Provider' ? 'rgba(77, 225, 210, 0.15)' : 'rgba(169, 155, 255, 0.15)',
                          color: item.category === 'Provider' ? 'var(--accent-teal)' : 'var(--accent-violet)',
                        }}
                      >
                        {item.category}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {item.description}
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {item.badge} &rarr;
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Guide */}
        <div
          style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(0, 0, 0, 0.25)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Navigate with <kbd>↑</kbd> <kbd>↓</kbd> &bull; Jump with <kbd>Enter</kbd></span>
          <span>Instant Unified Access</span>
        </div>
      </div>
    </div>
  );
};
