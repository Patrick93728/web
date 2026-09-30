import { Mail } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { siteConfig } from '../data/siteConfig';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="pt-6 pb-6" aria-label="Site footer">
      <div className="section-container">
        <div className="glass-panel rounded-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-5">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <img
                src="/profile.jpg"
                alt="Patrick Tomol"
                className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-zinc-700 shadow-sm"
              />
              <div>
                <p className="font-bold text-slate-800 dark:text-zinc-100 text-sm">Patrick Tomol</p>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Software Developer</p>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {siteConfig.github && (
                <a
                  href={siteConfig.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                  className="w-9 h-9 rounded-lg glass-panel flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 transition-colors"
                >
                  <FaGithub size={16} />
                </a>
              )}
              {siteConfig.linkedin && (
                <a
                  href={siteConfig.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="w-9 h-9 rounded-lg glass-panel flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 transition-colors"
                >
                  <FaLinkedin size={16} />
                </a>
              )}
              <a
                href={`mailto:${siteConfig.email}`}
                aria-label="Send an email"
                className="w-9 h-9 rounded-lg glass-panel flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 transition-colors"
              >
                <Mail size={16} />
              </a>
            </div>

            {/* Copyright + back to top */}
            <div className="flex flex-col items-center md:items-end gap-1">
              <p className="text-xs text-slate-400 dark:text-zinc-500">&copy; {year} Patrick Tomol. All rights reserved.</p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-xs font-medium text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 transition-colors"
              >
                &#8593; Back to top
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
