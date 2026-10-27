import { useEffect, useState } from 'react';

export default function DiwaliWelcome() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 7000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="diwali-welcome" role="status" aria-label="Happy Diwali from Rastlina">
      <style>{`
        .diwali-welcome{position:fixed;z-index:10000;top:max(18px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);width:min(90vw,390px);box-sizing:border-box;pointer-events:none;padding:23px 45px 24px;text-align:center;color:#f9eac0;background:linear-gradient(145deg,#123b2b,#071e17);border:1px solid #d8b56b;border-radius:18px;box-shadow:0 15px 55px #0007,0 0 24px #d8b56b33;animation:diwali-enter .6s ease-out both,diwali-exit 1.6s ease-in 5.4s forwards}
        .diwali-welcome h2{font-family:Georgia,serif;font-size:clamp(26px,6vw,36px);line-height:1.15;margin:6px 0;color:#f8dc97}
        .diwali-welcome p{font-size:13px;line-height:1.5;margin:4px 0 0;color:#f7edd8}
        .diwali-welcome .diwali-icon{font-size:26px;line-height:1;display:block}
        .diwali-sparkle{position:absolute;color:#f5d47d;pointer-events:none;animation:diwali-twinkle 1.5s ease-in-out infinite alternate}
        .diwali-sparkle.one{left:22px;top:36px}.diwali-sparkle.two{right:25px;bottom:31px;animation-delay:.5s}.diwali-sparkle.three{left:35px;bottom:25px;animation-delay:.9s}
        @keyframes diwali-enter{from{opacity:0;transform:translate(-50%,-15px) scale(.95)}to{opacity:1;transform:translate(-50%,0) scale(1)}}
        @keyframes diwali-exit{from{opacity:1}to{opacity:0}}
        @keyframes diwali-twinkle{from{opacity:.3;transform:scale(.6) rotate(-20deg)}to{opacity:1;transform:scale(1.25) rotate(20deg)}}
        @media (prefers-reduced-motion:reduce){.diwali-welcome,.diwali-sparkle{animation:none}}
      `}</style>
      <span className="diwali-sparkle one" aria-hidden="true">✦</span>
      <span className="diwali-sparkle two" aria-hidden="true">✧</span>
      <span className="diwali-sparkle three" aria-hidden="true">✦</span>
      <span className="diwali-icon" aria-hidden="true">🪔</span>
      <h2>Happy Diwali</h2>
      <p>May your home bloom with light, joy and greenery.</p>
      <p>With love, Team Rastlina</p>
    </div>
  );
}
