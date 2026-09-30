import { useEffect, useState } from 'react';

const NAME = 'Patrick Tomol';
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const BACKGROUND_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BACKGROUND_COUNT = 112;
const STEPS = 18;

function randomBackground() {
  return Array.from({ length: BACKGROUND_COUNT }, () => (
    BACKGROUND_LETTERS[Math.floor(Math.random() * BACKGROUND_LETTERS.length)]
  ));
}

function scramble(locked) {
  return [...NAME].map((letter, index) => {
    if (letter === ' ' || index < locked) return letter;
    return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  }).join('');
}

export default function IntroPreloader() {
  const [frame, setFrame] = useState(() => ({ text: scramble(0), locked: 0 }));
  const [background, setBackground] = useState(randomBackground);
  const [phase, setPhase] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ? 'done'
      : 'loading'
  ));

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let step = 0;
    let highlightTimer;
    let removeTimer;
    const interval = window.setInterval(() => {
      step += 1;
      const locked = Math.min(NAME.length, Math.floor((step / STEPS) * NAME.length));
      setFrame({ text: scramble(locked), locked });
      if (step % 3 === 0) setBackground(randomBackground());

      if (step === STEPS) {
        window.clearInterval(interval);
        setPhase('highlight');
        highlightTimer = window.setTimeout(() => setPhase('exit'), 420);
        removeTimer = window.setTimeout(() => setPhase('done'), 1100);
      }
    }, 48);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(highlightTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div className={`intro-loader${phase === 'highlight' ? ' intro-loader--highlight' : ''}${phase === 'exit' ? ' intro-loader--exit' : ''}`} role="status" aria-label="Loading Patrick Tomol">
      <div className="intro-loader__field" aria-hidden="true">
        {background.map((letter, index) => <span key={index}>{letter}</span>)}
      </div>
      <div className="intro-loader__content" aria-hidden="true">
        <div className="intro-loader__name">
          {[...frame.text].map((letter, index) => (
            <span
              key={index}
              className={`intro-loader__letter${letter === ' ' ? ' intro-loader__letter--space' : ''}${index < frame.locked ? ' intro-loader__letter--locked' : ''}`}
            >
              {letter === ' ' ? '\u00a0' : letter}
            </span>
          ))}
        </div>
        <div className="intro-loader__progress">
          <span style={{ transform: `scaleX(${frame.locked / NAME.length})` }} />
        </div>
      </div>
    </div>
  );
}
