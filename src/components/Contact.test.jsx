import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from './Contact';

vi.mock('react-intersection-observer', () => ({ useInView: () => ({ ref: () => {}, inView: true }) }));
afterEach(() => vi.unstubAllGlobals());

async function completeForm(user) {
  await user.type(screen.getByLabelText('Name'), 'Pat Example');
  await user.type(screen.getByLabelText('Email'), 'pat@example.com');
  await user.click(screen.getByRole('button', { name: /Select a subject/i }));
  await user.click(screen.getByRole('option', { name: 'Website Development' }));
  await user.type(screen.getByLabelText('Message'), 'A small booking website.');
}

describe('Contact form', () => {
  it('blocks duplicate submissions, shows progress, and clears fields after success', async () => {
    let finishRequest;
    const fetchMock = vi.fn(() => new Promise((resolve) => { finishRequest = resolve; }));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<Contact />);
    await completeForm(user);

    const submit = screen.getByRole('button', { name: /Send project inquiry/i });
    await user.click(submit);
    expect(submit).toBeDisabled();
    expect(screen.getByRole('button', { name: /Sending/i })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/contact');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      name: 'Pat Example', email: 'pat@example.com', subject: 'Website Development', message: 'A small booking website.',
    });

    finishRequest({ ok: true });
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Your project inquiry was sent.'));
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByRole('button', { name: /Select a subject/i })).toBeInTheDocument();
    expect(submit).not.toBeDisabled();
  });

  it('keeps entered values and displays a useful server error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'The contact service is unavailable.' }) }));
    const user = userEvent.setup();
    render(<Contact />);
    await completeForm(user);
    await user.click(screen.getByRole('button', { name: /Send project inquiry/i }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('The contact service is unavailable.'));
    expect(screen.getByLabelText('Name')).toHaveValue('Pat Example');
  });

  it('shows the configured WhatsApp link and supports keyboard subject selection', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    expect(screen.getByRole('link', { name: /WhatsApp.*09665485454/i })).toHaveAttribute('href', 'https://wa.me/639665485454');
    const trigger = screen.getByRole('button', { name: /Select a subject/i });
    trigger.focus();
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(screen.getByRole('button', { name: /Mobile App Development/i })).toHaveAttribute('aria-expanded', 'false');
    await user.click(screen.getByRole('button', { name: /Mobile App Development/i }));
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: /Mobile App Development/i })).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the subject options when clicking outside', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    await user.click(screen.getByRole('button', { name: /Select a subject/i }));
    expect(screen.getByRole('button', { name: /Select a subject/i })).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('heading', { name: /Have a project/i }));
    expect(screen.getByRole('button', { name: /Select a subject/i })).toHaveAttribute('aria-expanded', 'false');
  });

  it('requires a subject choice before sending', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<Contact />);
    await user.type(screen.getByLabelText('Name'), 'Pat Example');
    await user.type(screen.getByLabelText('Email'), 'pat@example.com');
    await user.type(screen.getByLabelText('Message'), 'A small booking website.');
    await user.click(screen.getByRole('button', { name: /Send project inquiry/i }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Choose a subject');
  });
});
