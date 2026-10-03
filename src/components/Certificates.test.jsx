import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Certificates from './Certificates';

vi.mock('../services/fruitask', () => ({ fetchCertificatesFromFruitask: vi.fn().mockResolvedValue([]) }));

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.IntersectionObserver = MockIntersectionObserver;

describe('Certificates viewer', () => {
  it('opens a certificate inside the page and closes with Escape', () => {
    render(<Certificates />);
    const trigger = screen.getByRole('button', { name: 'View Company Proposal and System Showcase certificate full size' });
    const originalLocation = window.location.href;

    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Company Proposal and System Showcase' })).toBeInTheDocument();
    expect(window.location.href).toBe(originalLocation);
    expect(screen.getByRole('button', { name: 'Close certificate viewer' })).toHaveFocus();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
