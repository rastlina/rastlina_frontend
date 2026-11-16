import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './WinterSaleWelcome.css';

const flakes = Array.from({ length: 90 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  fontSize: `${9 + (index * 7) % 17}px`,
  animationDuration: `${3 + (index % 5) * .6}s`,
  animationDelay: `-${(index * .71) % 5}s`,
}));

export default function WinterSaleWelcome() {
  const [visible, setVisible] = useState(false);
  const [showTitle, setShowTitle] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timer = window.setTimeout(() => setShowTitle(false), 4000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return createPortal(
    <div className="winter-sale-welcome">
      <div className="winter-sale-snow" aria-hidden="true">
        {flakes.map((style, index) => <span key={index} style={style}>❄</span>)}
      </div>
      {showTitle && <div className="winter-sale-title" role="status" aria-label="Winter Sale"><img src="/winter-sale-welcome.webp" alt="" /></div>}
    </div>,
    document.body,
  );
}
