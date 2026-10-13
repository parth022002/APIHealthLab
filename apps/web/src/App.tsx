import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { SignalCoreHero } from './components/SignalCoreHero';
import { LiveDiagnosticFlow } from './components/LiveDiagnosticFlow';
import { OfflineDiagnoser } from './components/OfflineDiagnoser';
import { ProviderCatalogSection } from './components/ProviderCatalogSection';
import { TrustArchitecture } from './components/TrustArchitecture';
import { Footer } from './components/Footer';
import { CyberBackgroundCanvas } from './components/CyberBackgroundCanvas';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SectionFlowIndicator } from './components/SectionFlowIndicator';

interface ShockwavePoint {
  id: number;
  x: number;
  y: number;
}

export const App: React.FC = () => {
  const [shockwaves, setShockwaves] = useState<ShockwavePoint[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Interactive Click Shockwave Ripple
  const handleGlobalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const newPoint: ShockwavePoint = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
    };

    setShockwaves((prev) => [...prev.slice(-8), newPoint]);

    setTimeout(() => {
      setShockwaves((prev) => prev.filter((p) => p.id !== newPoint.id));
    }, 700);
  };

  // Scroll Reveal Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="app-root" onClick={handleGlobalClick} style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ambient Cybernetic Cryptographic Background Layer */}
      <CyberBackgroundCanvas />

      {/* Global Interactive Command Palette / Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Click Shockwave Elements */}
      {shockwaves.map((point) => (
        <div
          key={point.id}
          className="click-shockwave"
          style={{
            left: `${point.x}px`,
            top: `${point.y}px`,
          }}
        />
      ))}

      {/* Navigation Topbar with Working Search Trigger */}
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

      <main id="top" style={{ position: 'relative', zIndex: 1 }}>
        {/* Stage 01: Hero & Quantum Crucible */}
        <div className="reveal-on-scroll is-revealed">
          <SignalCoreHero />
        </div>

        {/* Section Transition: Stage 02 */}
        <SectionFlowIndicator
          step="02"
          title="Intent-Aware Diagnostic Workspace"
          subtitle="Preflight scopes, policy evaluation & proof"
          targetId="diagnose"
        />
        <div className="reveal-on-scroll">
          <LiveDiagnosticFlow />
        </div>

        {/* Section Transition: Stage 03 */}
        <SectionFlowIndicator
          step="03"
          title="Credential-Free Error Lab"
          subtitle="Instant root cause & remediation suggestions"
          targetId="error-lab"
        />
        <div className="reveal-on-scroll">
          <OfflineDiagnoser />
        </div>

        {/* Section Transition: Stage 04 */}
        <SectionFlowIndicator
          step="04"
          title="Provider Capability Matrix"
          subtitle="7 Core MVP + 16 Beta prober manifests"
          targetId="providers"
        />
        <div className="reveal-on-scroll">
          <ProviderCatalogSection />
        </div>

        {/* Section Transition: Stage 05 */}
        <SectionFlowIndicator
          step="05"
          title="Security & Execution Boundaries"
          subtitle="128-combination policy matrix & zero retention"
          targetId="trust"
        />
        <div className="reveal-on-scroll">
          <TrustArchitecture />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;
