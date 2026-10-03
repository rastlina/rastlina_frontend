import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { Footer } from '@/components/layout/Footer';

it('keeps company and policy details without the removed developer credit', () => {
  const { container } = render(<MemoryRouter><Footer /></MemoryRouter>);
  expect(screen.getByText(/Rastlina Nature Hub Private Limited/)).toBeInTheDocument();
  expect(screen.getByText(/36AAPCR7860K1ZK/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy-policy');
  expect(container.textContent).not.toMatch(/StaffArc|Made with/i);
  expect(container.querySelector('a[href*="staffarc"], img[src*="footer-credit"]')).toBeNull();
});
