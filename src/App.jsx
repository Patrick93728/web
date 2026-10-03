import { useEffect } from 'react';
import ThemeToggle from './components/ThemeToggle';
import Hero from './components/Hero';
import Services from './components/Services';
import Projects from './components/Projects';
import About from './components/About';
import Certificates from './components/Certificates';
import TechStack from './components/TechStack';
import Contact from './components/Contact';
import Footer from './components/Footer';
import IntroPreloader from './components/IntroPreloader';
import { siteConfig } from './data/siteConfig';

const navigation = [
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#projects' },
  { label: 'About', href: '#about' },
  { label: 'Tech Stack', href: '#tech' },
  { label: 'Contact', href: '#contact' },
];

function App() {
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    if (!pointer.matches) return;

    let active = null;
    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      const target = document.elementFromPoint(x, y)?.closest('main section, footer');
      if (active !== target) active?.classList.remove('is-pointer-active');
      active = target;
      if (!active) return;
      const bounds = active.getBoundingClientRect();
      active.style.setProperty('--pointer-x', `${x - bounds.left}px`);
      active.style.setProperty('--pointer-y', `${y - bounds.top}px`);
      active.classList.add('is-pointer-active');
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const move = (event) => { x = event.clientX; y = event.clientY; schedule(); };
    const leave = () => { active?.classList.remove('is-pointer-active'); active = null; };
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', schedule, { passive: true });
    return () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', schedule);
      cancelAnimationFrame(frame);
      leave();
    };
  }, []);

  return (
    <div className="portfolio min-h-screen selection:bg-neutral-300 selection:text-neutral-950">
      <IntroPreloader />
      <a className="skip-link" href="#home">Skip to main content</a>
      <header className="site-header">
        <div className="section-container header-inner">
          <a className="site-brand" href="#home" aria-label={`${siteConfig.name}, back to top`}>
            <img className="brand-avatar" src="/profile.jpg" alt="" width="39" height="39" />
            <span className="brand-name">{siteConfig.name}</span>
          </a>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {navigation.map(({ label, href }) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <div className="header-actions">
            <ThemeToggle />
            <details className="mobile-nav">
              <summary aria-label="Toggle navigation menu"><span /><span /></summary>
              <nav aria-label="Mobile navigation">
                {navigation.map(({ label, href }) => (
                  <a key={href} href={href} onClick={(event) => event.currentTarget.closest('details').open = false}>{label}</a>
                ))}
              </nav>
            </details>
          </div>
        </div>
      </header>
      <main id="main-content">
        <Hero />
        <Services />
        <Projects />
        <About />
        <TechStack />
        <Certificates />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
