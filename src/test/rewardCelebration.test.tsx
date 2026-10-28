import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { RewardCelebration } from '@/components/cart/RewardCelebration';

afterEach(() => { cleanup(); vi.useRealTimers(); });

it('keeps the confirmation readable and dismisses it even if no animation-end event arrives', () => {
  vi.useFakeTimers();
  render(<RewardCelebration text="DIWALI10 applied!" />);
  act(() => vi.advanceTimersByTime(2000));
  expect(screen.getByRole('status')).toHaveTextContent('DIWALI10 applied!');
  act(() => vi.advanceTimersByTime(600));
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('shows the popup directly in the cart above the scrolling promo form', () => {
  const view = render(<div className="shopping-cart-drawer"><div data-testid="scroll"><RewardCelebration text="DIWALI10 applied!" /></div></div>);
  expect(screen.getByRole('status').parentElement).toBe(view.container.firstElementChild);
  expect(screen.getByTestId('scroll')).not.toContainElement(screen.getByRole('status'));
});
