import { useInView } from 'react-intersection-observer';
import { ExternalLink, ImageOff, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchProjectsFromFruitask } from '../services/fruitask';
import { projects as fallbackProjects } from '../data/projects';

// â”€â”€ Lightbox â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next, onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex flex-col items-center max-w-4xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="relative w-full rounded-xl overflow-hidden bg-black">
          <img
            key={current}
            src={images[current]}
            alt={`Image ${current + 1}`}
            className="w-full max-h-[70vh] object-contain animate-fadeIn"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                aria-label="Next"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex items-center gap-2 mt-4">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/60'}`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// â”€â”€ Project Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ProjectCard({ project, onImageClick }) {
  const allImages = project.images && project.images.length > 0
    ? project.images
    : project.image ? [project.image] : [];
  const hasImages = allImages.length > 0;

  return (
    <div className="project-card">
      <article className="glass-panel glass-panel-hover rounded-2xl h-full flex flex-col overflow-hidden group/card">

        {/* Image area â€” hover shows "View Image" overlay */}
        <div
          className={`relative overflow-hidden bg-slate-50 dark:bg-zinc-900/50 ${hasImages ? 'cursor-pointer' : ''}`}
          style={{ aspectRatio: '16/9' }}
          onClick={() => hasImages && onImageClick(allImages)}
          role={hasImages ? 'button' : undefined}
          tabIndex={hasImages ? 0 : undefined}
          aria-label={hasImages ? 'View images' : undefined}
          onKeyDown={(e) => { if (hasImages && (e.key === 'Enter' || e.key === ' ')) onImageClick(allImages); }}
        >
          {hasImages ? (
            <>
              <img
                src={allImages[0]}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-[1.04]"
                loading="lazy"
              />
              {/* "View Image" overlay â€” only on image hover */}
              <div className="absolute inset-0 bg-slate-900/0 group-hover/card:bg-slate-900/30 transition-all duration-300 flex items-center justify-center">
                <span className="flex items-center gap-1.5 opacity-0 group-hover/card:opacity-100 translate-y-2 group-hover/card:translate-y-0 transition-all duration-300 text-white text-sm md:text-base font-semibold bg-black/60 px-4 py-2 rounded-full">
                  <Eye size={13} aria-hidden="true" />
                  {allImages.length > 1 ? `View ${allImages.length} Photos` : 'View Image'}
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-300 dark:text-zinc-600">
              <ImageOff size={28} aria-hidden="true" />
              <span className="text-sm md:text-base font-bold tracking-widest uppercase">No preview</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="project-card-content p-5 flex flex-col gap-3 flex-1">
          {/* Category + Role badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm md:text-base font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
              {project.category || 'Development'}
            </span>
            {project.role && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm md:text-base font-bold uppercase tracking-wide bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                {project.role}
              </span>
            )}
          </div>

          {/* Title + Description */}
          <div className="project-description group/desc">
            <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-xl leading-snug mb-1.5">{project.title}</h3>
            <p className="text-lg md:text-xl text-slate-500 dark:text-zinc-400 leading-relaxed transition-colors duration-200 group-hover/desc:text-slate-700 dark:group-hover/desc:text-zinc-300">
              {project.summary}
            </p>
          </div>

          {/* Tech pills */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="project-tags flex flex-wrap gap-1.5">
              {project.technologies.map((tech) => (
                <span key={tech} className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 text-slate-500 dark:text-zinc-400">
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Links */}
          {project.liveUrl && (
            <div className="project-actions flex gap-4 mt-auto pt-3 border-t border-slate-100 dark:border-zinc-700/50">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm md:text-base font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ExternalLink size={13} aria-hidden="true" /> Live Demo
              </a>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

// â”€â”€ Projects Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function Projects() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadProjects = async () => {
      try {
        const liveProjects = await fetchProjectsFromFruitask(controller.signal);
        if (!controller.signal.aborted) setProjects(liveProjects);
      } catch {
        if (!controller.signal.aborted) {
          setProjects(fallbackProjects);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadProjects();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (loading || projects.length < 2) return;
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track) return;

    const media = typeof window.matchMedia === 'function'
      ? window.matchMedia('(min-width: 901px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)')
      : { matches: false, addEventListener: () => {}, removeEventListener: () => {} };
    let frame = 0;
    let wasDriven = false;
    const update = () => {
      frame = 0;
      const distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
      if (media.matches && distance > 0) {
        const start = window.scrollY + section.getBoundingClientRect().top - 76;
        const travelled = Math.min(distance, Math.max(0, window.scrollY - start));
        track.style.transform = `translate3d(${-travelled}px, 0, 0)`;
        const index = Math.round((travelled / distance) * (projects.length - 1));
        setActiveIndex((current) => current === index ? current : index);
      } else {
        const index = Math.round((viewport.scrollLeft / Math.max(1, distance)) * (projects.length - 1));
        setActiveIndex((current) => current === index ? current : index);
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const layout = () => {
      const distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
      const driven = media.matches && distance > 0;
      if (driven && !wasDriven) viewport.scrollLeft = 0;
      wasDriven = driven;
      section.classList.toggle('is-scroll-driven', driven);
      section.style.height = driven ? `${window.innerHeight + distance}px` : '';
      if (!driven) track.style.transform = '';
      schedule();
    };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(layout);
    observer?.observe(viewport);
    observer?.observe(track);
    window.addEventListener('resize', layout);
    window.addEventListener('scroll', schedule, { passive: true });
    viewport.addEventListener('scroll', schedule, { passive: true });
    media.addEventListener('change', layout);
    layout();
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', layout);
      window.removeEventListener('scroll', schedule);
      viewport.removeEventListener('scroll', schedule);
      media.removeEventListener('change', layout);
      cancelAnimationFrame(frame);
      section.classList.remove('is-scroll-driven');
      section.style.height = '';
      track.style.transform = '';
    };
  }, [loading, projects]);

  const goToProject = (index) => {
    const target = Math.min(projects.length - 1, Math.max(0, index));
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track) return;
    const behavior = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (section.classList.contains('is-scroll-driven')) {
      const distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
      const start = window.scrollY + section.getBoundingClientRect().top - 76;
      window.scrollTo({ top: start + distance * target / (projects.length - 1), behavior });
    } else {
      const card = track.children[target];
      viewport.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior });
    }
  };

  return (
    <>
      <section ref={sectionRef} id="projects" className="py-20 md:py-32">
        <div className="project-stage section-container">
          <div className="project-head">
            <div
              ref={ref}
              className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              <p className="text-sm md:text-base font-bold tracking-widest text-slate-400 dark:text-zinc-500 uppercase mb-2">Work</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight">My Projects.</h2>
            </div>
            {!loading && projects.length > 0 && (
              <div className="project-controls" aria-label="Project navigation">
                <span className="project-count" aria-live="polite">{String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
                <button type="button" onClick={() => goToProject(activeIndex - 1)} disabled={activeIndex === 0} aria-label="Previous project"><ChevronLeft size={19} /></button>
                <button type="button" onClick={() => goToProject(activeIndex + 1)} disabled={activeIndex === projects.length - 1} aria-label="Next project"><ChevronRight size={19} /></button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300 dark:border-zinc-600" />
            </div>
          ) : projects.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-zinc-500 py-8">No projects found.</p>
          ) : (
            <div
              ref={viewportRef}
              className="projects-viewport"
              role="region"
              aria-label="Projects carousel"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                  event.preventDefault();
                  goToProject(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
                }
              }}
            >
              <div ref={trackRef} className="projects-track">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onImageClick={(imgs) => setLightbox(imgs)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {lightbox && (
        <Lightbox
          images={lightbox}
          startIndex={0}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
