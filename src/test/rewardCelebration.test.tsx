import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { RewardCelebration } from '@/components/cart/RewardCelebration';

afterEach(() => { cleanup(); vi.useRealTimers(); });

it('keeps the confirmation readable and dismisses it even when reduced motion emits no animation event', () => {
  vi.useFakeTimers();
  render(<RewardCelebration text="DIWALI10 applied!" />);
  act(() => vi.advanceTimersByTime(2000));
  expect(screen.getByRole('status')).toHaveTextContent('DIWALI10 applied!');
  act(() => vi.advanceTimersByTime(600));
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
