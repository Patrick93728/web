import { useInView } from 'react-intersection-observer';
import { FileDown } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

const skills = [
  'Crafting user-centric web and mobile interfaces',
  'Connecting frontend apps to backend APIs',
  'Improving performance, SEO, and usability',
  'Debugging, maintaining, and scaling software',
];

export default function About() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 });

  return (
    <section id="about" className="py-20 md:py-32" aria-labelledby="about-heading">
      <div className="section-container">
        <div className="glass-panel rounded-2xl overflow-hidden max-w-5xl mx-auto">
          <div
            ref={ref}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-6 md:p-8 lg:p-10"
          >
            {/* Text */}
            <div className={`flex flex-col gap-4 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div>
                <p className="text-sm md:text-base font-bold tracking-widest text-slate-400 dark:text-zinc-500 uppercase mb-3">About Me</p>
                <h2 id="about-heading" className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight mb-3">
                  Hi, I&apos;m Patrick
                </h2>
                <p className="text-lg md:text-xl text-slate-500 dark:text-zinc-400 leading-relaxed font-normal">
                  A software developer helping businesses and individuals turn ideas into functional digital products &mdash;
                  from fresh applications to improvements on existing systems.
                </p>
              </div>

              {/* Skills card */}
              <div className="glass-panel rounded-xl p-4">
                <p className="font-bold text-slate-700 dark:text-zinc-300 text-sm md:text-base mb-3 uppercase tracking-widest">How I Add Value</p>
                <ul className="flex flex-col gap-2.5">
                  {skills.map((s) => (
                    <li key={s} className="flex items-center gap-3 text-sm md:text-base text-slate-500 dark:text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-500 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resume button */}
              {siteConfig.resumeUrl && (
                <a
                  href={siteConfig.resumeUrl}
                  download="PATRICK_TOMOL_RESUME.pdf"
                  className="mt-2 self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 font-semibold text-sm hover:bg-slate-700 dark:hover:bg-white transition-colors shadow-sm"
                >
                  <FileDown size={15} /> Download Resume
                </a>
              )}
            </div>

            {/* Photo */}
            <div className="flex justify-center h-full w-full">
              <div className={`w-full transition-all duration-700 delay-200 ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} flex items-center justify-center`}>
                <div className="overflow-hidden">
                  <img src="/profile.jpg" alt="Patrick Tomol" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

