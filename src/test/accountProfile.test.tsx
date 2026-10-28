import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import UserProfile from '@/pages/UserProfile';
import ProfileDetails from '@/components/profile/ProfileDetails';

const mocks = vi.hoisted(() => ({ orders: vi.fn(), save: vi.fn(), refresh: vi.fn() }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { first_name: 'Plant', email: 'test@example.com' }, logout: vi.fn(), refreshUser: mocks.refresh }) }));
vi.mock('@/services/api', () => ({ orderService: { getUserOrders: mocks.orders }, authService: { updateProfile: mocks.save } }));
vi.mock('@/components/profile/AdressManager', () => ({ default: () => <p>Address list</p> }));
vi.mock('@/components/profile/OrderHistory', () => ({ default: () => <p>Order list</p> }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
function BackButton() { const navigate = useNavigate(); return <button onClick={() => navigate(-1)}>Browser back</button>; }
it('follows account navigation and browser Back while retaining the correct active link', async () => {
  mocks.orders.mockResolvedValue({ results: [], count: 0 });
  render(<MemoryRouter initialEntries={['/profile?tab=orders']}><UserProfile /><BackButton /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'My profile' }));
  expect(screen.getByRole('button', { name: 'My profile' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('heading', { name: 'The person behind the plants' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Browser back' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'My orders' })).toHaveAttribute('aria-current', 'page'));
  expect(screen.getByText('Order list')).toBeInTheDocument();
});
it('submits the labelled profile form and preserves edits when the server rejects saving', async () => {
  const save = vi.fn().mockRejectedValueOnce(Error('Offline')).mockResolvedValueOnce(undefined);
  render(<ProfileDetails user={{ first_name: 'Plant', email: 'test@example.com' }} onSave={save} />);
  fireEvent.change(screen.getByLabelText('First Name *'), { target: { value: 'Leaf' } });
  fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }).closest('form')!);
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  expect(screen.getByLabelText('First Name *')).toHaveValue('Leaf');
  expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled();
  fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }).closest('form')!);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled());
});
