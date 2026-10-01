import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, ChevronDown, Mail } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';
import { siteConfig } from '../data/siteConfig';
import { contactSubjects } from '../../shared/contactOptions';

export default function Contact() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const submitting = useRef(false);
  const subjectRoot = useRef(null);
  const subjectButton = useRef(null);
  const subjectOptions = useRef([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subject, setSubject] = useState('');
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [activeSubjectIndex, setActiveSubjectIndex] = useState(0);
  const [subjectInvalid, setSubjectInvalid] = useState(false);

  useEffect(() => {
    if (!subjectOpen) return undefined;
    subjectOptions.current[activeSubjectIndex]?.focus();
    const closeOnOutsideClick = (event) => {
      if (!subjectRoot.current?.contains(event.target)) setSubjectOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [subjectOpen, activeSubjectIndex]);

  function openSubject() {
    setActiveSubjectIndex(Math.max(0, contactSubjects.indexOf(subject)));
    setSubjectOpen(true);
  }

  function selectSubject(value) {
    setSubject(value);
    setSubjectInvalid(false);
    setSubjectOpen(false);
    subjectButton.current?.focus();
  }

  function handleSubjectKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      setSubjectOpen(false);
      subjectButton.current?.focus();
    } else if (event.key === 'Tab') {
      setSubjectOpen(false);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSubjectIndex((index) => (index + (event.key === 'ArrowDown' ? 1 : -1) + contactSubjects.length) % contactSubjects.length);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActiveSubjectIndex(event.key === 'Home' ? 0 : contactSubjects.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectSubject(contactSubjects[activeSubjectIndex]);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting.current) return;

    const form = event.currentTarget;
    if (!subject) {
      setSubjectInvalid(true);
      setStatus({ type: 'error', message: 'Choose a subject before sending your inquiry.' });
      subjectButton.current?.focus();
      return;
    }
    const values = new FormData(form);
    const body = Object.fromEntries(['name', 'email', 'message'].map((key) => [
      key, String(values.get(key) ?? '').trim(),
    ]));
    body.subject = subject;

    submitting.current = true;
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Your message could not be sent. Please try again.');
      }
      form.reset();
      setSubject('');
      setSubjectInvalid(false);
      setStatus({ type: 'success', message: 'Your project inquiry was sent. I’ll get back to you soon.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Your message could not be sent. Please try again.' });
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <section id="contact" className="py-20 md:py-32" aria-labelledby="contact-heading">
      <div className="section-container contact-layout">
        <div ref={ref} className={`contact-intro transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="contact-eyebrow">Contact</p>
          <h2 id="contact-heading">HAVE A PROJECT<br />IN MIND?</h2>
          <p className="contact-description">Have a project in mind or just want to say hi? Fill out the form and I'll get back to you as soon as I can.</p>
          <div className="contact-methods">
            <a className="contact-method" href={`mailto:${siteConfig.email}`}>
              <span className="contact-method-icon"><Mail aria-hidden="true" size={21} /></span>
              <span className="contact-method-copy"><strong>Email</strong><span>{siteConfig.email}</span></span>
              <ArrowUpRight className="contact-method-arrow" aria-hidden="true" size={17} />
            </a>
            <a className="contact-method" href="https://wa.me/639665485454" target="_blank" rel="noopener noreferrer">
              <span className="contact-method-icon"><FaWhatsapp aria-hidden="true" size={21} /></span>
              <span className="contact-method-copy"><strong>WhatsApp</strong><span>09665485454</span></span>
              <ArrowUpRight className="contact-method-arrow" aria-hidden="true" size={17} />
            </a>
          </div>
        </div>

        <div className={`contact-form-panel glass-panel transition-all duration-700 delay-100 ${inView ? 'contact-form-panel--visible opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h3>Project inquiry</h3>
          <form onSubmit={handleSubmit}>
            <label htmlFor="contact-name">Name</label>
            <input id="contact-name" name="name" type="text" placeholder="Full name" autoComplete="name" maxLength="120" required />

            <label htmlFor="contact-email">Email</label>
            <input id="contact-email" name="email" type="email" placeholder="Email address" autoComplete="email" maxLength="254" required />

            <label id="contact-subject-label" htmlFor="contact-subject">Subject</label>
            <div className="contact-subject" ref={subjectRoot}>
              <button
                id="contact-subject"
                ref={subjectButton}
                className="contact-subject-trigger"
                type="button"
                aria-haspopup="listbox"
                aria-labelledby="contact-subject-label contact-subject-value"
                aria-expanded={subjectOpen}
                aria-controls="contact-subject-options"
                aria-invalid={subjectInvalid || undefined}
                onClick={() => subjectOpen ? setSubjectOpen(false) : openSubject()}
                onKeyDown={(event) => {
                  if (!subjectOpen && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
                    event.preventDefault();
                    openSubject();
                  }
                }}
              >
                <span id="contact-subject-value" className={subject ? '' : 'contact-subject-placeholder'}>{subject || 'Select a subject'}</span>
                <ChevronDown aria-hidden="true" size={17} />
              </button>
              <div id="contact-subject-options" className={`contact-subject-menu ${subjectOpen ? 'is-open' : ''}`} role="listbox" aria-label="Subject options" aria-hidden={!subjectOpen} inert={!subjectOpen} onKeyDown={handleSubjectKeyDown}>
                {contactSubjects.map((choice, index) => (
                  <div
                    key={choice}
                    ref={(node) => { subjectOptions.current[index] = node; }}
                    className="contact-subject-option"
                    role="option"
                    aria-selected={subject === choice}
                    tabIndex={subjectOpen ? -1 : undefined}
                    onClick={() => selectSubject(choice)}
                    onMouseEnter={() => setActiveSubjectIndex(index)}
                  >
                    <span>{choice}</span>
                    {subject === choice && <Check aria-hidden="true" size={16} />}
                  </div>
                ))}
              </div>
            </div>

            <label htmlFor="contact-message">Message</label>
            <textarea id="contact-message" name="message" placeholder="What would you like to build? Share the main features, goals, and any important details." rows="5" maxLength="5000" required />

            <button className="contact-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending…' : 'Send project inquiry'}<ArrowUpRight aria-hidden="true" size={18} /></button>
            {status.message && <p className={`contact-status contact-status--${status.type}`} role="status" aria-live="polite">{status.message}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
