import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.IntersectionObserver = MockIntersectionObserver;

describe('App', () => {
  it('renders skip link', () => {
    render(<App />);
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  it('renders the Hero heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the Services heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /What I can help you build/i })).toBeInTheDocument();
  });

  it('renders the Projects heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /My Projects/i })).toBeInTheDocument();
  });

  it('renders the About heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Hi, I'm Patrick/i })).toBeInTheDocument();
  });

  it('renders the TechStack heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Tools I work with/i })).toBeInTheDocument();
  });

  it('renders the Contact heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Let's work together\./i })).toBeInTheDocument();
  });

  it('renders Contact Me button linking to Patrick\'s email', () => {
    render(<App />);
    const contactLink = screen.getByRole('link', { name: /Contact Me/i });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink.getAttribute('href')).toBe('mailto:tomolpatrick@gmail.com');
  });

  it('renders the fruitask contact form iframe', () => {
    render(<App />);
    const iframe = document.querySelector('iframe[src*="fruitask.com"]');
    expect(iframe).toBeTruthy();
  });

  it('renders Patrick Tomol name in footer', () => {
    render(<App />);
    const names = screen.getAllByText(/Patrick Tomol/i);
    expect(names.length).toBeGreaterThan(0);
  });

  it('renders GitHub link pointing to correct profile', () => {
    render(<App />);
    const githubLink = screen.getByRole('link', { name: /GitHub profile/i });
    expect(githubLink.getAttribute('href')).toBe('https://github.com/Patrick93728');
  });

  it('renders LinkedIn link pointing to correct profile', () => {
    render(<App />);
    const linkedinLink = screen.getByRole('link', { name: /LinkedIn profile/i });
    expect(linkedinLink.getAttribute('href')).toBe('https://www.linkedin.com/in/patrick-tomol/');
  });
});
