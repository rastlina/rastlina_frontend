import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const sparkles = [[12, 17], [35, 10], [69, 26], [94, 45], [84, 83], [43, 91], [11, 57], [58, 80]];
// Trace the existing gold artwork in its original pixel coordinates.
const magicTrails = [
  { name: 'Diwali: first i to l', path: 'M740 704 C895 782 1116 800 1335 725 C1515 657 1624 540 1625 417 C1625 315 1445 288 1255 351', delay: .65 },
  { name: 'Happy: H base to flourish tip', path: 'M555 282 C535 216 375 159 375 107 C375 43 585 148 765 245 C925 325 1115 350 1235 290 C1280 257 1240 232 1190 250', delay: .85 },
];

export default function DiwaliWelcome() {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!ready) return;
    // Remove every layer together exactly three seconds after the artwork loads.
    const timer = window.setTimeout(() => setFinished(true), 3000);
    return () => window.clearTimeout(timer);
  }, [ready]);
  useEffect(() => {
    if (!ready || finished) return;
    let resume = 0;
    const onScroll = () => {
      if (!root.current?.classList.contains('is-scrolling')) {
        root.current?.classList.add('is-scrolling');
        root.current?.querySelector('svg')?.pauseAnimations();
      }
      window.clearTimeout(resume);
      resume = window.setTimeout(() => {
        root.current?.classList.remove('is-scrolling');
        root.current?.querySelector('svg')?.unpauseAnimations();
      }, 140);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(resume);
    };
  }, [ready, finished]);

  if (!mounted || finished) return null;
  return createPortal(
    <div ref={root} className={`rastlina-diwali${ready ? ' is-ready' : ''}`} role="status" aria-label={ready ? 'Happy Diwali from Rastlina' : undefined}>
      <style>{`
        .rastlina-diwali{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;pointer-events:none;background:none;opacity:0}
        .rastlina-diwali.is-ready{opacity:1;animation:rastlina-diwali-fade 3s steps(1,end) both}
        .rastlina-diwali-art{position:relative;width:min(86vw,800px,125vh);line-height:0;contain:layout style;isolation:isolate}
        .rastlina-diwali.is-ready .rastlina-diwali-art{animation:rastlina-diwali-enter .65s cubic-bezier(.22,.72,.28,1) both}
        .rastlina-diwali-art img{display:block;width:100%;height:auto;max-width:none}
        .rastlina-diwali-shine{position:absolute;inset:0;mask-image:var(--rastlina-diwali-mask);-webkit-mask-image:var(--rastlina-diwali-mask);mask-size:contain;-webkit-mask-size:contain;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;mask-position:center;-webkit-mask-position:center;overflow:hidden}
        .rastlina-diwali-beam{position:absolute;left:-40%;top:0;width:35%;height:100%;background:linear-gradient(90deg,transparent,#ffe49626 32%,#fffdf0cc 50%,#ffe49626 68%,transparent);opacity:0}
        .rastlina-diwali.is-ready .rastlina-diwali-beam{animation:rastlina-diwali-sweep .95s linear .65s both}
        .rastlina-diwali-opening{position:absolute;left:50%;top:50%;width:18%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#fffbea 0%,#ffe29a88 10%,#f8c65b22 35%,transparent 68%);opacity:0;transform:translate(-50%,-50%)}
        .rastlina-diwali.is-ready .rastlina-diwali-opening{animation:rastlina-diwali-opening .65s ease-out both}
        .rastlina-diwali-orbits{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
        .rastlina-diwali-trail{fill:none;stroke:#ffe9a5;stroke-width:4;stroke-linecap:round;stroke-dasharray:12 100;stroke-dashoffset:12;opacity:0;animation:rastlina-diwali-trace 1.9s linear both}
        .rastlina-diwali-magic-head,.rastlina-diwali-magic-mote{opacity:0;animation:rastlina-diwali-comet 1.9s linear both}
        .rastlina-diwali-glint{position:absolute;display:block;width:7%;aspect-ratio:1;opacity:0;pointer-events:none}
        .rastlina-diwali.is-ready .rastlina-diwali-glint{animation:rastlina-diwali-glint 1.25s ease-in-out infinite}
        .rastlina-diwali-glint:before,.rastlina-diwali-glint:after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse,#fffef0 0%,#fff2ad 8%,#ffd15e99 25%,transparent 68%)}
        .rastlina-diwali-glint:before{transform:scaleX(.12)}
        .rastlina-diwali-glint:after{transform:scaleY(.12)}
        @keyframes rastlina-diwali-enter{from{clip-path:circle(0% at 50% 50%)}to{clip-path:circle(90% at 50% 50%)}}
        @keyframes rastlina-diwali-sweep{0%{opacity:0;transform:translate3d(0,0,0)}12%,88%{opacity:.85}100%{opacity:0;transform:translate3d(520%,0,0)}}
        @keyframes rastlina-diwali-opening{0%{opacity:0;transform:translate(-50%,-50%) scale(.1)}18%{opacity:.85}65%{opacity:.16}100%{opacity:0;transform:translate(-50%,-50%) scale(5.5)}}
        @keyframes rastlina-diwali-fade{from{opacity:1}to{opacity:0}}
        @keyframes rastlina-diwali-glint{0%,100%{opacity:.05;transform:scale(.35) rotate(-12deg)}45%{opacity:1;transform:scale(1) rotate(0deg)}75%{opacity:.2;transform:scale(.5) rotate(10deg)}}
        @keyframes rastlina-diwali-trace{0%{stroke-dashoffset:12;opacity:0}8%{opacity:1}88%{opacity:1}100%{stroke-dashoffset:-88;opacity:0}}
        @keyframes rastlina-diwali-comet{0%{opacity:0}6%,88%{opacity:1}100%{opacity:0}}
        .rastlina-diwali.is-scrolling .rastlina-diwali-orbits,.rastlina-diwali.is-scrolling .rastlina-diwali-shine{visibility:hidden}
        .rastlina-diwali.is-scrolling .rastlina-diwali-beam,.rastlina-diwali.is-scrolling .rastlina-diwali-glint,.rastlina-diwali.is-scrolling .rastlina-diwali-trail,.rastlina-diwali.is-scrolling .rastlina-diwali-magic-head,.rastlina-diwali.is-scrolling .rastlina-diwali-magic-mote{animation-play-state:paused}
        @media(max-width:600px){.rastlina-diwali-magic-mote:nth-of-type(n+6){display:none}}
        @media(prefers-reduced-motion:reduce){.rastlina-diwali.is-ready .rastlina-diwali-art,.rastlina-diwali.is-ready .rastlina-diwali-glint,.rastlina-diwali.is-ready .rastlina-diwali-beam,.rastlina-diwali.is-ready .rastlina-diwali-opening{animation:none}.rastlina-diwali-orbits{display:none}}
      `}</style>
      <div className="rastlina-diwali-art">
        <img src="/diwali-welcome.webp" srcSet="/diwali-welcome-640.webp 640w, /diwali-welcome-960.webp 960w, /diwali-welcome.webp 1735w" sizes="(max-width:930px) 86vw, 800px" alt="" width="1735" height="906" loading="eager" decoding="async" onLoad={event => {
          root.current?.style.setProperty('--rastlina-diwali-mask', `url("${event.currentTarget.currentSrc}")`);
          setReady(true);
        }} onError={() => setFinished(true)} />
        <span className="rastlina-diwali-shine" aria-hidden="true"><span className="rastlina-diwali-beam" /></span>
        {ready && <svg className="rastlina-diwali-orbits" viewBox="0 0 1735 906" aria-hidden="true" focusable="false">
          <defs><radialGradient id="rastlina-diwali-halo"><stop offset="0" stopColor="#fffdf3" /><stop offset=".3" stopColor="#ffe6a1" stopOpacity=".8" /><stop offset="1" stopColor="#ffc543" stopOpacity="0" /></radialGradient></defs>
          {magicTrails.map(trail => <g key={trail.name}>
            <path className="rastlina-diwali-trail" d={trail.path} pathLength="100" style={{ animationDelay: `${trail.delay}s` }} />
            {Array.from({ length: 8 }, (_, index) => <g key={index} className="rastlina-diwali-magic-mote" style={{ animationDelay: `${trail.delay + index * .025}s` }}>
              <animateMotion dur="1.9s" begin={`${trail.delay + index * .025}s`} fill="freeze" path={trail.path} />
              <circle r={6 - index * .5} fill="#ffe4a0" opacity={.75 - index * .075} />
            </g>)}
            <g className="rastlina-diwali-magic-head" style={{ animationDelay: `${trail.delay}s` }}>
              <animateMotion dur="1.9s" begin={`${trail.delay}s`} fill="freeze" path={trail.path} />
              <circle r="38" fill="url(#rastlina-diwali-halo)" /><path d="M0-23 4-4 23 0 4 4 0 23-4 4-23 0-4-4Z" fill="#fff5bf" /><circle r="5" fill="#fffdf5" />
            </g>
          </g>)}
        </svg>}
        {sparkles.map(([left, top], index) => <span key={index} aria-hidden="true" className="rastlina-diwali-glint" style={{ left: `${left - 3.5}%`, top: `${top - 6.7}%`, animationDelay: `${-index * .21}s` }} />)}
        <span className="rastlina-diwali-opening" aria-hidden="true" />
      </div>
    </div>, document.body,
  );
}
