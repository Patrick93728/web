import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TechStack from './TechStack';

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.IntersectionObserver = MockIntersectionObserver;

describe('TechStack', () => {
  it('renders the section heading', () => {
    render(<TechStack />);
    expect(screen.getByRole('heading', { name: /Tools I work with/i })).toBeInTheDocument();
  });

  it('renders all tech groups', () => {
    render(<TechStack />);
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Mobile')).toBeInTheDocument();
    expect(screen.getByText('Backend & Data')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('Workflow')).toBeInTheDocument();
  });

  it('renders individual tech items correctly', () => {
    render(<TechStack />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('Flutter')).toBeInTheDocument();
    expect(screen.getByText('Figma')).toBeInTheDocument();
    expect(screen.getByText('Git')).toBeInTheDocument();
  });
});
