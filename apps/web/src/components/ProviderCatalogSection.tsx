import React, { useState, useMemo } from 'react';
import { getProviderCatalog, ProviderCatalogEntry, CatalogCategory, ProviderSupportTier } from '@api-healthlab/catalog';

const CATEGORIES: Array<'All' | CatalogCategory> = [
  'All',
  'LLM / frontier',
  'Inference / gateways',
  'Image / video / audio',
  'Developer / collaboration',
  'Data / vector',
  'Payments',
  'Identity / observability',
];

export const ProviderCatalogSection: React.FC = () => {
  const catalog = useMemo(() => getProviderCatalog(), []);
  const [selectedTier, setSelectedTier] = useState<'ALL' | ProviderSupportTier>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<'All' | CatalogCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ProviderCatalogEntry | null>(catalog[0] ?? null);

  const filtered = useMemo(() => {
    return catalog.filter((p) => {
      const matchesTier = selectedTier === 'ALL' || p.tier === selectedTier;
      if (!matchesTier) return false;

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const lower = searchQuery.toLowerCase();
      return (
        p.displayName.toLowerCase().includes(lower) ||
        p.id.toLowerCase().includes(lower) ||
        p.hosts.some((h) => h.toLowerCase().includes(lower)) ||
        p.description.toLowerCase().includes(lower)
      );
    });
  }, [catalog, selectedTier, selectedCategory, searchQuery]);

  const mvpCount = useMemo(() => catalog.filter(p => p.tier === 'VERIFIED_MVP').length, [catalog]);
  const betaCount = useMemo(() => catalog.filter(p => p.tier === 'EXPANDED_BETA').length, [catalog]);

  return (
    <section id="providers" className="section" style={{ borderBottom: '1px solid var(--border-subtle)', position: 'relative' }}>
      <div className="container wrap">
        <div style={{ maxWidth: '840px', margin: '0 auto 36px auto', textAlign: 'center' }}>
          <div className="badge badge-accent" style={{ marginBottom: '12px', fontSize: '0.8rem', padding: '6px 14px' }}>
            Provider Transparency & Capability Matrix
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Reviewed Providers & Capability Manifests
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Every integration runs on reviewed, machine-readable manifests with verified hosts, strict auth headers, and bounded risk parameters. 
            We clearly separate our <strong>Core Verified MVP</strong> from <strong>Expanded Beta</strong> adapters.
          </p>
        </div>

        {/* Tier Filter Bar (Audited P1 Requirement) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedTier('ALL')}
            className={`btn ${selectedTier === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '8px 20px',
              borderRadius: '24px',
              fontSize: '0.88rem',
              fontWeight: 600,
              background: selectedTier === 'ALL' ? 'var(--accent-violet)' : 'rgba(23, 27, 42, 0.7)',
              color: selectedTier === 'ALL' ? '#FFFFFF' : 'var(--text-secondary)',
              border: selectedTier === 'ALL' ? '1px solid var(--accent-violet)' : '1px solid var(--border-default)',
              cursor: 'pointer',
            }}
          >
            All Integrations (7 Core &bull; 16 Beta)
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier('VERIFIED_MVP')}
            className={`btn ${selectedTier === 'VERIFIED_MVP' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '8px 20px',
              borderRadius: '24px',
              fontSize: '0.88rem',
              fontWeight: 600,
              background: selectedTier === 'VERIFIED_MVP' ? 'rgba(77, 225, 210, 0.2)' : 'rgba(23, 27, 42, 0.7)',
              color: selectedTier === 'VERIFIED_MVP' ? 'var(--accent-teal)' : 'var(--text-secondary)',
              border: selectedTier === 'VERIFIED_MVP' ? '1px solid var(--accent-teal)' : '1px solid var(--border-default)',
              cursor: 'pointer',
            }}
          >
            ✓ Core Verified MVP ({mvpCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier('EXPANDED_BETA')}
            className={`btn ${selectedTier === 'EXPANDED_BETA' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '8px 20px',
              borderRadius: '24px',
              fontSize: '0.88rem',
              fontWeight: 600,
              background: selectedTier === 'EXPANDED_BETA' ? 'rgba(169, 155, 255, 0.2)' : 'rgba(23, 27, 42, 0.7)',
              color: selectedTier === 'EXPANDED_BETA' ? 'var(--accent-violet)' : 'var(--text-secondary)',
              border: selectedTier === 'EXPANDED_BETA' ? '1px solid var(--accent-violet)' : '1px solid var(--border-default)',
              cursor: 'pointer',
            }}
          >
            ⚡ Expanded Beta ({betaCount})
          </button>
        </div>

        {/* Category Filter Tabs Bar */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '24px',
            scrollbarWidth: 'thin',
          }}
        >
          {CATEGORIES.map((cat) => {
            const isCatActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`btn ${isCatActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  fontSize: '0.8rem',
                  padding: '6px 14px',
                  borderRadius: '16px',
                  whiteSpace: 'nowrap',
                  background: isCatActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  color: isCatActive ? '#FFFFFF' : 'var(--text-muted)',
                  border: isCatActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search & Counter Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Showing <strong style={{ color: 'var(--accent-teal)' }}>{filtered.length}</strong> providers in{' '}
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedCategory}</span>
            {selectedTier !== 'ALL' && (
              <span style={{ marginLeft: '6px', color: 'var(--accent-violet)' }}>
                ({selectedTier === 'VERIFIED_MVP' ? 'Core MVP only' : 'Beta only'})
              </span>
            )}
          </div>

          <div style={{ position: 'relative', width: '320px' }}>
            <input
              type="text"
              placeholder="Filter by name, host, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-text"
              style={{
                paddingLeft: '36px',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-sm)',
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            >
              🔍
            </span>
          </div>
        </div>

        {/* Provider Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '18px',
            marginBottom: '36px',
          }}
        >
          {filtered.map((provider) => {
            const isSelected = selectedProvider?.id === provider.id;
            const isCoreMVP = provider.tier === 'VERIFIED_MVP';

            return (
              <div
                key={provider.id}
                className="card"
                onClick={() => setSelectedProvider(provider)}
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--accent-teal)' : 'var(--border-subtle)',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(77, 225, 210, 0.08) 0%, rgba(169, 155, 255, 0.05) 100%)'
                    : 'var(--bg-card)',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                  boxShadow: isSelected ? '0 8px 24px rgba(77, 225, 210, 0.15)' : 'none',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      {provider.displayName}
                    </h3>
                    <code style={{ fontSize: '0.75rem', color: 'var(--accent-teal)' }}>{provider.hosts[0]}</code>
                  </div>

                  <span
                    className="badge"
                    style={{
                      background: isCoreMVP ? 'rgba(77, 225, 210, 0.15)' : 'rgba(169, 155, 255, 0.15)',
                      color: isCoreMVP ? 'var(--accent-teal)' : 'var(--accent-violet)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      border: isCoreMVP ? '1px solid rgba(77, 225, 210, 0.3)' : '1px solid rgba(169, 155, 255, 0.3)',
                    }}
                  >
                    {isCoreMVP ? 'CORE MVP' : 'BETA ADAPTER'}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px', minHeight: '38px' }}>
                  {provider.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Auth:</span>{' '}
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {provider.authMethods.join(', ')}
                    </span>
                  </div>
                  <span style={{ color: 'var(--accent-violet)', fontWeight: 600 }}>Inspect &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Provider Deep Specification Drawer */}
        {selectedProvider && (
          <div
            className="card"
            style={{
              padding: '30px',
              background: 'var(--bg-card-surface)',
              border: '1px solid var(--accent-violet)',
              boxShadow: '0 12px 36px rgba(169, 155, 255, 0.12)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span
                    className="badge"
                    style={{
                      background: selectedProvider.tier === 'VERIFIED_MVP' ? 'rgba(77, 225, 210, 0.2)' : 'rgba(169, 155, 255, 0.2)',
                      color: selectedProvider.tier === 'VERIFIED_MVP' ? 'var(--accent-teal)' : 'var(--accent-violet)',
                      fontWeight: 700,
                    }}
                  >
                    {selectedProvider.tier === 'VERIFIED_MVP' ? 'CORE MVP VERIFIED' : 'EXPANDED BETA'}
                  </span>
                  <span
                    className="badge"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {selectedProvider.category}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    ID: {selectedProvider.id}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
                  {selectedProvider.displayName}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('select-provider', { detail: selectedProvider.id }));
                    document.getElementById('diagnose')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="button primary"
                  style={{ fontSize: '0.85rem', padding: '8px 16px', cursor: 'pointer' }}
                >
                  {selectedProvider.tier === 'VERIFIED_MVP' ? '⚡ Test Core MVP Diagnostic →' : '⚡ Test Beta Probe →'}
                </button>
                <a
                  href={selectedProvider.websiteUrl || (selectedProvider.hosts[0] ? `https://${selectedProvider.hosts[0].replace(/^api\./, '')}` : '#')}
                  target="_blank"
                  rel="noreferrer"
                  className="button secondary"
                  style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                >
                  Official Documentation &rarr;
                </a>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
              {selectedProvider.description}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '28px',
                padding: '18px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Allowed Hostnames</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-teal)', marginTop: '4px' }}>
                  {selectedProvider.hosts.join(', ')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Supported Auth Header</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {selectedProvider.authMethods.join(', ')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verified Against Spec</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {selectedProvider.verifiedOn}
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px' }}>
              Probe & Diagnostic Capabilities
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 14px' }}>Intent ID</th>
                    <th style={{ padding: '10px 14px' }}>Category</th>
                    <th style={{ padding: '10px 14px' }}>Method & Path</th>
                    <th style={{ padding: '10px 14px' }}>Risk Level</th>
                    <th style={{ padding: '10px 14px' }}>Side Effect</th>
                    <th style={{ padding: '10px 14px' }}>Cost Model</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProvider.supportedIntents.map((intent) => (
                    <tr key={intent.intentId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: 'var(--accent-teal)', fontWeight: 600 }}>
                        {intent.intentId}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{intent.category}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                        <span style={{ color: intent.method === 'GET' ? 'var(--accent-teal)' : 'var(--accent-violet)', fontWeight: 700 }}>
                          {intent.method}
                        </span>{' '}
                        {intent.path}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ color: intent.risk === 'R0' || intent.risk === 'R1' ? 'var(--status-healthy)' : 'var(--accent-amber)' }}>
                          {intent.risk}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{intent.sideEffect}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ color: intent.cost === 'FREE' ? 'var(--status-healthy)' : 'var(--status-failed)', fontWeight: 600 }}>
                          {intent.cost}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Scope & Verification Boundaries (Audited Requirement) */}
            <div
              style={{
                marginTop: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '14px',
              }}
            >
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(77, 225, 210, 0.05)',
                  border: '1px solid rgba(77, 225, 210, 0.2)',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-teal)', marginBottom: '4px' }}>
                  ✓ Semantic Proof (What This Probe Verifies)
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Syntactic format validation, TLS 1.3 reachability to allowlisted host, acceptance of auth headers by the upstream API gateway, and permission authorization strictly for the requested intent.
                </div>
              </div>

              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 180, 0, 0.05)',
                  border: '1px solid rgba(255, 180, 0, 0.2)',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '4px' }}>
                  ⚠ Semantic Boundary (What This Probe Does NOT Prove)
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Probing a metadata intent (such as LIST_MODELS) proves credentials and gateway acceptance, but does not prove unselected chat completion permissions, fine-tuning privileges, or account prepaid balance.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
