import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { Header } from '@/components/layout/Header';

const mocks = vi.hoisted(() => ({ openCart: vi.fn(), navbar: vi.fn() }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('@/contexts/CartContext', () => ({ useCart: () => ({ openCart: mocks.openCart, totalItems: 0 }) }));
vi.mock('@/services/api', () => ({
  storeService: { getNavbarData: mocks.navbar },
  contentService: { getHomeContent: async () => ({}) },
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

it('loads navigation once and keeps mobile menu/search controls working', async () => {
  mocks.navbar.mockResolvedValue({ main_categories: [], hero_slides: [] });
  render(<MemoryRouter><Header /></MemoryRouter>);
  await waitFor(() => expect(mocks.navbar).toHaveBeenCalledTimes(1));
  const menu = screen.getByRole('button', { name: 'Toggle menu' });
  fireEvent.click(menu);
  expect(menu).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Toggle search' }));
  expect(menu).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByPlaceholderText('Search indoor plants...')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Toggle search' }));
  expect(screen.queryByPlaceholderText('Search indoor plants...')).not.toBeInTheDocument();
});

it('opens the cart from the mobile header without animation dependencies', async () => {
  mocks.navbar.mockResolvedValue({ main_categories: [], hero_slides: [] });
  render(<MemoryRouter><Header /></MemoryRouter>);
  fireEvent.click(screen.getAllByRole('button', { name: 'Open cart' })[0]);
  expect(mocks.openCart).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(mocks.navbar).toHaveBeenCalledTimes(1));
});
