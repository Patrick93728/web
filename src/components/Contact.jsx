import { useInView } from 'react-intersection-observer';
export default function Contact() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="contact" className="py-20 md:py-32" aria-labelledby="contact-heading">
      <div className="section-container">
        {/* Header */}
        <div
          ref={ref}
          className={`mb-10 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <p className="text-sm md:text-base font-bold tracking-widest text-slate-400 dark:text-zinc-500 uppercase mb-3">Contact</p>
          <h2 id="contact-heading" className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight mb-4">
            Let's work together.
          </h2>
          <p className="text-lg text-slate-500 dark:text-zinc-400 font-normal mb-8 max-w-xl">
            Have a project in mind or just want to say hi? Fill out the form below and I'll get back to you as soon as I can.
          </p>
        </div>

        {/* Fruitask form */}
        <div className={`transition-all duration-700 delay-100 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="glass-panel rounded-2xl overflow-hidden">
            <iframe
              src="https://fruitask.com/form/853c0e671e43e1b1"
              width="100%"
              height="560"
              frameBorder="0"
              title="Contact form"
              style={{ border: 'none', display: 'block' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
