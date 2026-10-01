import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it('reflects mixed repository values from the API without filling missing links', async () => {
    const fetchRequest = vi.fn(async () => ({
      ok: true,
      json: async () => ({ projects: [
        { id: 'one', title: 'First project', repoUrl: 'https://github.com/example/one' },
        { id: 'two', title: 'Second project', repoUrl: null },
        { id: 'three', title: 'Third project', repoUrl: 'https://github.com/example/three' },
        { id: 'four', title: 'Fourth project', repoUrl: '' },
      ] }),
    }));
    vi.stubGlobal('fetch', fetchRequest);
    render(<Projects />);
    await screen.findByRole('heading', { name: 'Fourth project' });
    const links = screen.getAllByRole('link', { name: /repository/i });
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'https://github.com/example/one',
      'https://github.com/example/three',
    ]);
    expect(fetchRequest).toHaveBeenCalledWith('/api/projects', expect.objectContaining({ cache: 'no-store' }));
  });

  it('shows a retry state instead of bundled repository links after an API failure', async () => {
    const fetchRequest = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ projects: [{ id: 'new', title: 'Updated project', repoUrl: null }] }) });
    vi.stubGlobal('fetch', fetchRequest);
    render(<Projects />);
    await screen.findByRole('alert');
    expect(screen.queryByRole('link', { name: /repository/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByRole('heading', { name: 'Updated project' });
    expect(screen.queryByRole('link', { name: /repository/i })).not.toBeInTheDocument();
    expect(fetchRequest).toHaveBeenCalledTimes(2);
  });

  it('removes a repository link on the next page load after the API removes it', async () => {
    const fetchRequest = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ projects: [{ id: 'one', title: 'Current project', repoUrl: 'https://github.com/example/one' }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ projects: [{ id: 'one', title: 'Current project', repoUrl: null }] }) });
    vi.stubGlobal('fetch', fetchRequest);
    const firstPage = render(<Projects />);
    await screen.findByRole('link', { name: /repository/i });
    firstPage.unmount();

    render(<Projects />);
    await screen.findByRole('heading', { name: 'Current project' });
    await waitFor(() => expect(screen.queryByRole('link', { name: /repository/i })).not.toBeInTheDocument());
    expect(fetchRequest).toHaveBeenCalledTimes(2);
  });
});
