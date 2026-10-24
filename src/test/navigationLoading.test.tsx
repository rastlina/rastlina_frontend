import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
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

const menuData = {
  main_categories: [
    { id: 1, name: 'Indoor Plants', slug: 'plants', categories: [{ id: 1, name: 'Air-Purifying Plants', slug: 'air-purifying-plants' }] },
    { id: 3, name: 'Plant Types', slug: 'Categories', categories: [{ id: 6, name: 'Aglaonema Plants', slug: 'aglaonema' }] },
  ],
  hero_slides: [], featured_spaces: [], plants_sizes: [{ id: 1, name: 'Small' }],
};
const LocationProbe = () => { const location = useLocation(); return <output aria-label="Current location">{location.pathname}{location.search}</output>; };

it('keeps View All reachable before the dynamic menu finishes loading', () => {
  mocks.navbar.mockReturnValue(new Promise(() => {}));
  render(<MemoryRouter><Header /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));
  const nav = screen.getByRole('navigation', { name: 'Mobile navigation' });
  fireEvent.click(within(nav).getByRole('button', { name: 'Indoor Plants' }));
  expect(within(nav).getByRole('link', { name: 'View All', exact: true })).toHaveAttribute('href', '/shop?main_category=plants');
  expect(within(nav).queryByRole('link', { name: 'Large Plants' })).not.toBeInTheDocument();
});

it('puts View All first inside Indoor Plants and closes the menu after opening the complete catalogue', async () => {
  mocks.navbar.mockResolvedValue(menuData);
  render(<MemoryRouter><Header /><LocationProbe /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));
  const nav = screen.getByRole('navigation', { name: 'Mobile navigation' });
  fireEvent.click(await within(nav).findByRole('button', { name: 'Indoor Plants' }));
  const viewAll = within(nav).getByRole('link', { name: 'View All', exact: true });
  expect(viewAll).toHaveAttribute('href', '/shop?main_category=plants');
  const submenu = document.getElementById('mobile-plants-links')!;
  expect(within(submenu).getAllByRole('link')[0]).toBe(viewAll);
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.click(viewAll);
  expect(screen.getByLabelText('Current location')).toHaveTextContent('/shop?main_category=plants');
  expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).not.toBeInTheDocument();
  expect(document.body.style.overflow).not.toBe('hidden');
});

it('expands the whole Plant Types heading without navigating and restores scrolling on Escape', async () => {
  mocks.navbar.mockResolvedValue(menuData);
  render(<MemoryRouter><Header /><LocationProbe /></MemoryRouter>);
  const toggle = screen.getByRole('button', { name: 'Toggle menu' });
  fireEvent.click(toggle);
  const nav = screen.getByRole('navigation', { name: 'Mobile navigation' });
  const heading = await within(nav).findByRole('button', { name: 'Plant Types' });
  fireEvent.click(heading);
  expect(heading).toHaveAttribute('aria-expanded', 'true');
  expect(within(nav).getByRole('link', { name: 'Aglaonema Plants' })).toBeInTheDocument();
  expect(screen.getByLabelText('Current location')).toHaveTextContent(/^\/$/);
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(toggle).toHaveFocus();
  expect(document.body.style.overflow).not.toBe('hidden');
});
