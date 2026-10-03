export function homeBootstrap(modulePath, fontCss, stylesheetPath = '') {
  if (!modulePath.startsWith('/assets/')) throw new Error('Unexpected homepage entry path');
  const entry = JSON.stringify(modulePath).replace(/</g, '\\u003c');
  const fonts = JSON.stringify(fontCss).replace(/</g, '\\u003c');
  if (stylesheetPath && !stylesheetPath.startsWith('/assets/')) throw new Error('Unexpected homepage stylesheet path');
  const stylesheet = JSON.stringify(stylesheetPath).replace(/</g, '\\u003c');
  return `(() => {
    let started = false;
    let ready = false;
    let queuedControl = null;
    const boot = (urgent = false) => {
      if (started) return;
      started = true;
      const fonts = document.createElement('style');
      fonts.textContent = ${fonts};
      document.head.appendChild(fonts);
      let scriptStarted = false;
      const startScript = () => {
        if (scriptStarted) return;
        scriptStarted = true;
        const script = document.createElement('script');
        script.type = 'module';
        script.crossOrigin = 'anonymous';
        script.fetchPriority = urgent ? 'high' : 'low';
        script.src = ${entry};
        document.head.appendChild(script);
      };
      if (${stylesheet}) {
        const sheet = document.createElement('link');
        sheet.rel = 'stylesheet';
        sheet.href = ${stylesheet};
        sheet.addEventListener('load', startScript, { once: true });
        sheet.addEventListener('error', startScript, { once: true });
        document.head.appendChild(sheet);
        setTimeout(startScript, 3000);
      } else startScript();
    };
    const captureClick = event => {
      if (ready || !(event.target instanceof Element)) return;
      const control = event.target.closest('button[aria-label]');
      const label = control?.getAttribute('aria-label');
      if (!['Toggle menu', 'Toggle search', 'Open cart'].includes(label)) return;
      event.preventDefault();
      queuedControl = label;
      boot(true);
    };
    document.addEventListener('click', captureClick, true);
    document.addEventListener('rastlina:ready', () => {
      ready = true;
      document.removeEventListener('click', captureClick, true);
      if (queuedControl) {
        const button = Array.from(document.querySelectorAll('button[aria-label]'))
          .find(button => button.getAttribute('aria-label') === queuedControl);
        button?.click();
      }
    }, { once: true });
    const afterPaint = () => requestAnimationFrame(() => requestAnimationFrame(() => boot()));
    const banner = document.querySelector('img[alt="Rastlina Banner"]');
    if (banner?.complete && banner.naturalWidth > 0) afterPaint();
    else if (banner) {
      banner.addEventListener('load', afterPaint, { once: true });
      banner.addEventListener('error', () => boot(), { once: true });
    } else boot();
    setTimeout(() => boot(), 3000);
  })();`;
}
