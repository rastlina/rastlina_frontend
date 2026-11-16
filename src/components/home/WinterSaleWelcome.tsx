import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './WinterSaleWelcome.css';

const flakes = Array.from({ length: 140 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  fontSize: `${9 + (index * 7) % 17}px`,
  animationDuration: `${3 + (index % 5) * .6}s`,
  animationDelay: `-${(index * .71) % 5}s`,
}));

export default function WinterSaleWelcome() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return createPortal(
    <div className="winter-sale-welcome">
      <div className="winter-sale-snow" aria-hidden="true">
        {flakes.map((style, index) => <span key={index} className={index % 5 === 0 ? 'snow-flake' : 'snow-dot'} style={style}>{index % 5 === 0 ? '❄' : '●'}</span>)}
      </div>
      <div className="winter-sale-title" role="status" aria-label="Winter Sale">
        <img src="/winter-sale-welcome.webp" alt="" />
        <svg className="winter-sale-trails" viewBox="0 0 1000 667" aria-hidden="true">
          <defs><radialGradient id="winter-spark-glow"><stop stopColor="#fff" /><stop offset=".25" stopColor="#ffe29a" stopOpacity=".95" /><stop offset="1" stopColor="#ffdc87" stopOpacity="0" /></radialGradient></defs>
          {["M 864 243 C 765 265 650 210 550 195 C 450 180 380 215 330 245", "M 300 535 C 420 600 570 570 700 526 C 760 506 790 477 810 450"].map((path, index) => <g key={path}>
            <path className="winter-sale-trail" d={path} pathLength="100" style={{ animationDelay: `${.4 + index * .15}s` }} />
            <g className="winter-sale-spark" style={{ animationDelay: `${.4 + index * .15}s` }}>
              <animateMotion dur="1.8s" begin={`${.4 + index * .15}s`} fill="freeze" path={path} />
              <circle r="30" fill="url(#winter-spark-glow)" /><path d="M0-19 3-3 19 0 3 3 0 19-3 3-19 0-3-3Z" fill="#fff9db" />
            </g>
          </g>)}
        </svg>
      </div>
    </div>,
    document.body,
  );
}
