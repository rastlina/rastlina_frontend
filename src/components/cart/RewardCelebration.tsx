import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/** A brief cart celebration using the applied code or unlocked reward name. */
export function RewardCelebration({ text, duration = 2600, priority = false }: { text: string; duration?: number; priority?: boolean }) {
  const [visible, setVisible] = useState(true);
  const anchor = useRef<HTMLSpanElement>(null);
  const [host, setHost] = useState<Element | null>(null);
  useLayoutEffect(() => {
    setHost(anchor.current?.closest('.shopping-cart-drawer') || document.body);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), duration);
    return () => window.clearTimeout(timer);
  }, [duration]);
  if (!visible) return null;
  return <><span ref={anchor} hidden />{host && createPortal(<span className="reward-milestone-popup" role="status" aria-live="polite" style={{ animationDuration: `${duration}ms`, zIndex: priority ? 10000 : undefined }}
    onAnimationEnd={event => { if (event.target === event.currentTarget) setVisible(false); }}>
    <span className="text-[#CDA85C] animate-[reward-confetti_900ms_ease-out_1]">✦</span>
    <span className="text-[#155B46] animate-[reward-pop_650ms_cubic-bezier(.2,.8,.2,1)_1]">🎉</span>
    <span className="text-[#91A96D] animate-[reward-confetti_900ms_ease-out_1]" style={{ animationDelay: '140ms' }}>✧</span>
    <span>{text}</span>
  </span>, host)}</>;
}
