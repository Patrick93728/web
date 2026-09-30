import { useInView } from 'react-intersection-observer';
import { techStack } from '../data/techStack';

export default function TechStack() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 });

  return (
    <section id="tech" className="py-20 md:py-32" aria-labelledby="tech-heading">
      <div className="section-container">
        {/* Header */}
        <div
          ref={ref}
          className={`mb-10 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <p className="text-sm md:text-base font-bold tracking-widest text-slate-400 dark:text-zinc-500 uppercase mb-2">Tech Stack</p>
          <h2 id="tech-heading" className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight mb-3">
            Tools I work with.
          </h2>
          <p className="text-lg md:text-xl text-slate-500 dark:text-zinc-400 font-normal">
            A growing collection of languages, frameworks, and tools I use to deliver quality work.
          </p>
        </div>

        {/* Groups */}
        <div className="tech-groups">
          {techStack.map((group, gi) => (
            <div
              key={group.group}
              className={`tech-group glass-panel transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${gi * 70}ms` }}
            >
              <div>
                <p className="tech-group-title">
                  {group.group}
                </p>
                <ul className="tech-items">
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <span className="tech-pill">
                        <span className="tech-icon">
                          {item.icon.startsWith('/') ? (
                            <img src={item.icon} alt="" />
                          ) : item.icon}
                        </span>
                        {item.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
