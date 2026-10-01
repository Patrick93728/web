import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const transitioning = useRef(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = (event) => {
    if (transitioning.current) return;

    const applyTheme = () => {
      const nextDark = !document.documentElement.classList.contains('dark');
      flushSync(() => setIsDark(nextDark));
      document.documentElement.classList.toggle('dark', nextDark);
    };
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reducedMotion) {
      applyTheme();
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    transitioning.current = true;
    document.documentElement.classList.add('theme-reveal');
    const transition = document.startViewTransition(applyTheme);
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 620, easing: 'cubic-bezier(.22, 1, .36, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    }).catch(() => {});
    transition.finished.finally(() => {
      document.documentElement.classList.remove('theme-reveal');
      transitioning.current = false;
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle glass-panel glass-panel-hover transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={22} /> : <Moon size={22} />}
    </button>
  );
}
