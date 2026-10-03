import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useInView } from 'react-intersection-observer';
import { Eye, ImageOff, X } from 'lucide-react';
import { fallbackCertificates, withLocalCertificateImages } from '../data/certificates';
import { fetchCertificatesFromFruitask } from '../services/fruitask';

function formatDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(parsed);
}

export default function Certificates() {
  const [certificates, setCertificates] = useState(fallbackCertificates);
  const [selected, setSelected] = useState(null);
  const triggerRef = useRef(null);

  const closeViewer = () => {
    setSelected(null);
    triggerRef.current?.focus();
  };

  const openViewer = (certificate, trigger) => {
    triggerRef.current = trigger;
    setSelected(certificate);
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchCertificatesFromFruitask(controller.signal)
      .then((records) => {
        if (!controller.signal.aborted && records.length > 0) setCertificates(withLocalCertificateImages(records));
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <section id="certificates" aria-labelledby="certificates-heading">
      <div className="section-container">
        <header className="certificates-heading">
          <p>Credentials</p>
          <h2 id="certificates-heading">Certificates<span>.</span></h2>
        </header>
        <div className="certificates-list">
          {certificates.map((certificate, index) => (
            <CertificateRow certificate={certificate} index={index} key={certificate.id} onOpen={openViewer} />
          ))}
        </div>
      </div>
      {selected && createPortal(<CertificateViewer certificate={selected} onClose={closeViewer} />, document.body)}
    </section>
  );
}

function CertificateRow({ certificate, index, onOpen }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.16 });
  return (
    <article ref={ref} className={`certificate-row${inView ? ' certificate-row--visible' : ''}`} style={{ '--wave-order': index }}>
      <span className="certificate-row__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <div className="certificate-row__details">
        <h3>{certificate.name}</h3>
        <div className="certificate-row__meta">
          <span>{certificate.issuer}</span>
          {certificate.dateIssued && <time dateTime={certificate.dateIssued}>{formatDate(certificate.dateIssued)}</time>}
        </div>
      </div>
      <div className="certificate-row__image">
        {certificate.image ? (
          <button type="button" onClick={(event) => onOpen(certificate, event.currentTarget)} aria-label={`View ${certificate.name} certificate full size`}>
            <img src={certificate.image} alt={`${certificate.name} certificate`} loading="lazy" decoding="async" />
            <span className="certificate-row__view" aria-hidden="true"><Eye size={16} /> View</span>
          </button>
        ) : (
          <div className="certificate-row__missing"><ImageOff size={24} aria-hidden="true" /><span>Certificate image unavailable</span></div>
        )}
      </div>
    </article>
  );
}

function CertificateViewer({ certificate, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="certificate-viewer" role="dialog" aria-modal="true" aria-labelledby="certificate-viewer-title" onClick={onClose}>
      <div className="certificate-viewer__panel" onClick={(event) => event.stopPropagation()}>
        <div className="certificate-viewer__header">
          <h2 id="certificate-viewer-title">{certificate.name}</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close certificate viewer"><X size={20} aria-hidden="true" /></button>
        </div>
        <img src={certificate.image} alt={`${certificate.name} certificate`} />
      </div>
    </div>
  );
}
