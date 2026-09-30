import { useInView } from 'react-intersection-observer';
import { services } from '../data/services';

function ServiceCard({ service, delay }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const Icon = service.icon;

  return (
    <div
      ref={ref}
      className={`h-full transition-all duration-600 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <article className="service-card glass-panel h-full">
        {/* Icon */}
        <div className="service-icon" aria-hidden="true">
          <Icon size={21} />
        </div>
        {/* Title */}
        <h3>{service.title}</h3>
        {/* Description */}
        {service.description && (
          <p>{service.description}</p>
        )}
        <ul className="service-deliverables">
          {service.deliverables.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </article>
    </div>
  );
}

export default function Services() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });

  return (
    <section id="services" className="py-20 md:py-32" aria-labelledby="services-heading">
      <div className="section-container">
        {/* Header */}
        <div
          ref={ref}
          className={`mb-10 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <p className="text-sm md:text-base font-bold tracking-widest text-slate-400 dark:text-zinc-500 uppercase mb-2">Services</p>
          <h2 id="services-heading" className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight mb-3">
            What I can help you build.
          </h2>
          <p className="text-lg md:text-xl text-slate-500 dark:text-zinc-400 max-w-xl font-normal">
            From initial ideas to working products &mdash; practical development and design services tailored to your project.
          </p>
        </div>

        {/* Grid */}
        <div className="services-grid grid">
          {services.map((s, i) => (
            <ServiceCard key={s.id} service={s} delay={i * 60} />
          ))}
        </div>
      </div>
    </section>
  );
}
