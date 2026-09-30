import { useInView } from 'react-intersection-observer';
import { Code2, Palette, Plug, Wrench } from 'lucide-react';

const highlights = [
  {
    icon: Code2,
    label: 'Build',
    description: 'Websites, dashboards, and mobile applications from scratch.',
  },
  {
    icon: Palette,
    label: 'Design',
    description: 'Clear, intuitive user interfaces and experiences.',
  },
  {
    icon: Plug,
    label: 'Integrate',
    description: 'APIs, databases, and third-party services.',
  },
  {
    icon: Wrench,
    label: 'Improve',
    description: 'Bug fixes, maintenance, and continuous enhancements.',
  },
];

export default function CapabilityHighlights() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <section ref={ref} className="py-12 relative z-10" aria-label="Core capabilities">
      <div className="section-container">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-6" role="list">
          {highlights.map((item, i) => {
            const Icon = item.icon;
            return (
              <li
                key={item.label}
                role="listitem"
                className={`transition-all duration-700 h-full ${
                  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="glass-panel glass-panel-hover rounded-[24px] h-full">
                  <div className="flex flex-col items-center text-center gap-4 p-8 h-full">
                    <div className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-slate-100 border border-white dark:border-slate-200 flex items-center justify-center shadow-sm dark:shadow-[inset_0_0_20px_rgba(56,189,248,0.1)]">
                      <Icon size={26} className="text-slate-500 dark:text-slate-400" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-zinc-100 text-lg mb-2">{item.label}</p>
                      <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed font-light">{item.description}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
