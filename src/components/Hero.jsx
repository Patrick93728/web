import { ArrowRight, ChevronDown } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

const badges = [
  'Responsive Web Experiences',
  'Mobile App Development',
  'User-Centered UI/UX',
  'API & Database Integration',
];

export default function Hero() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });

  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-center" aria-labelledby="hero-heading">
      <div className="section-container py-16 md:py-20">
        <div className="max-w-3xl">
          {/* Label */}
          <p className="text-sm md:text-base font-bold tracking-[0.18em] text-slate-400 dark:text-zinc-500 uppercase mb-5">
            DIGITAL SOLUTIONS &middot; DEVELOPMENT &middot; DESIGN
          </p>

          {/* H1 - two-tone */}
          <h1
            id="hero-heading"
            className="text-5xl sm:text-6xl md:text-[72px] font-extrabold leading-[1.08] tracking-tight mb-6"
          >
            <span className="text-slate-800 dark:text-white">You know your business.</span>{' '}
            <span className="text-slate-500 dark:text-zinc-400">
              I know the code. Let&apos;s build something real.
            </span>
          </h1>

          {/* Body paragraph */}
          <p className="text-lg md:text-xl text-slate-500 dark:text-zinc-400 leading-relaxed mb-8 font-normal max-w-2xl">
            {siteConfig.description}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mb-10">
            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 font-semibold text-sm hover:bg-slate-700 dark:hover:bg-white transition-colors shadow-lg shadow-slate-200 dark:shadow-none"
            >
              Contact Me <ArrowRight size={16} />
            </a>
            <button
              onClick={() => scrollTo('projects')}
              className="glass-panel glass-panel-hover inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-600 dark:text-zinc-300"
            >
              View My Work
            </button>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-3">
            {badges.map((b) => (
              <span key={b} className="pill">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600 shrink-0" />
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-400 dark:text-zinc-600">
        <span className="text-sm md:text-base font-bold tracking-[0.2em] uppercase">Scroll</span>
        <ChevronDown size={14} className="animate-bounce" />
      </div>
    </section>
  );
}
