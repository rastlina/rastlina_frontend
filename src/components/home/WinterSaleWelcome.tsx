import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './WinterSaleWelcome.css';

const flakes = Array.from({ length: 220 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  width: `${2 + (index * 7) % 5}px`,
  height: `${2 + (index * 7) % 5}px`,
  opacity: .45 + (index % 5) * .12,
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
        {flakes.map((style, index) => <span key={index} className="snow-dot" style={style} />)}
      </div>
      <div className="winter-sale-title" role="status" aria-label="Winter Sale">
        <img src="/winter-sale-welcome.webp" alt="" />
        <svg className="winter-sale-trails" viewBox="0 0 1000 667" aria-hidden="true">
          <defs><radialGradient id="winter-spark-glow"><stop stopColor="#fff" /><stop offset=".25" stopColor="#ffe29a" stopOpacity=".95" /><stop offset="1" stopColor="#ffdc87" stopOpacity="0" /></radialGradient></defs>
          {["M 865 250 C 950 260 985 180 946 128 C 900 58 760 55 635 98", "M 270 510 C 195 570 110 630 180 626 C 350 632 500 581 630 551 C 720 531 780 530 810 540"].map((path, index) => <g key={path}>
            <path className="winter-sale-trail" d={path} pathLength="100" style={{ animationDelay: `${.4 + index * .15}s` }} />
            <g className="winter-sale-spark" style={{ animationDelay: `${.4 + index * .15}s` }}>
              <animateMotion dur="1.8s" begin={`${.4 + index * .15}s`} fill="freeze" path={path} />
              <circle r="30" fill="url(#winter-spark-glow)" /><path d="M0-19 3-3 19 0 3 3 0 19-3 3-19 0-3-3Z" fill="#fff9db" />
            </g>
            {Array.from({ length: 7 }, (_, mote) => <g key={mote} className="winter-sale-spark" style={{ animationDelay: `${.4 + index * .15 + mote * .04}s` }}>
              <animateMotion dur="1.8s" begin={`${.4 + index * .15 + mote * .04}s`} fill="freeze" path={path} />
              <circle r={5 - mote * .5} fill="#fff0b4" opacity={.85 - mote * .1} />
            </g>)}
          </g>)}
        </svg>
      </div>
    </div>,
    document.body,
  );
}
