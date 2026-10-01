import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Projects from './Projects';

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.IntersectionObserver = MockIntersectionObserver;

afterEach(() => vi.unstubAllGlobals());

describe('project repository links', () => {
  it.each([
    [null],
    [undefined],
    [''],
    ['   '],
  ])('renders a project without a repository link for %s', async (repoUrl) => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ projects: [{ id: 'one', title: 'No repository project', summary: 'Details', repoUrl }] }),
    })));
    render(<Projects />);
    await screen.findByRole('heading', { name: 'No repository project' });
    expect(screen.queryByRole('link', { name: /repository/i })).not.toBeInTheDocument();
  });

  it('keeps a valid repository link clickable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ projects: [{ id: 'one', title: 'Repository project', summary: 'Details', repoUrl: 'https://github.com/example/project' }] }),
    })));
    render(<Projects />);
    const link = await screen.findByRole('link', { name: /repository/i });
    await waitFor(() => expect(link).toHaveAttribute('href', 'https://github.com/example/project'));
  });
});
