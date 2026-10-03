import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

vi.mock('./services/fruitask', () => ({
  fetchProjectsFromFruitask: vi.fn().mockResolvedValue([]),
  fetchCertificatesFromFruitask: vi.fn().mockResolvedValue([]),
}));

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

  it('renders About, Tech Stack, Certificates, then Contact', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Certificates.' })).toBeInTheDocument();
    const about = document.querySelector('#about');
    const tech = document.querySelector('#tech');
    const certificates = document.querySelector('#certificates');
    const contact = document.querySelector('#contact');
    expect(about.compareDocumentPosition(tech) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(tech.compareDocumentPosition(certificates) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(certificates.compareDocumentPosition(contact) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders the TechStack heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Tools I work with/i })).toBeInTheDocument();
  });

  it('renders the Contact heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /HAVE A PROJECT/i })).toBeInTheDocument();
  });

  it('renders Contact Me button linking to Patrick\'s email', () => {
    render(<App />);
    const contactLink = screen.getByRole('link', { name: /Contact Me/i });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink.getAttribute('href')).toBe('mailto:tomolpatrick@gmail.com');
  });

  it('renders the contact form without the old iframe', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Project inquiry' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Subject Select a subject/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
    expect(screen.queryByText(/Budget Range/i)).toBeNull();
    expect(document.querySelector('iframe[src*="fruitask.com"]')).toBeNull();
  });

  it('uses the configured address for both Contact and footer email links', () => {
    render(<App />);
    expect(document.querySelector('#contact .contact-method')).toHaveAttribute('href', 'mailto:tomolpatrick@gmail.com');
    expect(screen.getByRole('link', { name: 'Send an email' })).toHaveAttribute('href', 'mailto:tomolpatrick@gmail.com');
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
