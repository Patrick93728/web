import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Projects from './Projects';

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.IntersectionObserver = MockIntersectionObserver;
window.ResizeObserver = class {
  observe() {}
  disconnect() {}
};

afterEach(() => vi.unstubAllGlobals());

describe('project cards', () => {
  it('shows only the Live Demo action even if the API includes a repository URL', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ projects: [{
        id: 'one', title: 'Current project', liveUrl: 'https://example.com/demo',
        repoUrl: 'https://github.com/example/project',
      }] }),
    })));
    render(<Projects />);
    expect(await screen.findByRole('heading', { name: 'Current project' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /live demo/i })).toHaveAttribute('href', 'https://example.com/demo');
    expect(screen.queryByRole('link', { name: /repository/i })).not.toBeInTheDocument();
  });

  it('shows the existing projects and Live Demo links when the API returns 503', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503 })));
    render(<Projects />);
    for (const title of ['Attendly', 'Uptura-Tech', 'Fruitask', 'Virtual Office']) {
      expect(await screen.findByRole('heading', { name: title })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('link', { name: /live demo/i })).toHaveLength(4);
    expect(screen.queryByRole('link', { name: /repository/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('uses the current API data when available rather than the fallback list', async () => {
    const fetchRequest = vi.fn(async () => ({
      ok: true,
      json: async () => ({ projects: [{ id: 'new', title: 'Latest project', liveUrl: 'https://example.com/latest' }] }),
    }));
    vi.stubGlobal('fetch', fetchRequest);
    render(<Projects />);
    expect(await screen.findByRole('heading', { name: 'Latest project' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Attendly' })).not.toBeInTheDocument();
    expect(fetchRequest).toHaveBeenCalledWith('/api/projects', expect.objectContaining({ cache: 'no-store' }));
  });
});
