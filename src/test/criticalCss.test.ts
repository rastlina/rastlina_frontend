import { expect, it } from 'vitest';
import { criticalCss } from '../../build/criticalCss.mjs';

it('preserves initial responsive styles, resets and variables without unrelated classes or webfonts', () => {
  const css = ':root{--color:green}*{box-sizing:border-box}.flex{display:flex}.unused{color:red}@media(min-width:768px){.md\\:h-\\[80vh\\]{height:80vh}.unused-md{color:red}}@font-face{font-family:Test;src:url(test.woff2)}';
  const result = criticalCss(css, '<div class="flex md:h-[80vh]"></div>');
  expect(result).toContain(':root');
  expect(result).toContain('box-sizing');
  expect(result).toContain('.flex');
  expect(result).toContain('height:80vh');
  expect(result).not.toContain('unused');
  expect(result).not.toContain('@font-face');
});

it('keeps mixed selector rules when an initial class is used', () => {
  expect(criticalCss('.used,.other:hover{color:green}', '<p class="used">Test</p>')).toContain('color:green');
  expect(criticalCss('.unused,h1{color:green}', '<h1>Test</h1>')).toContain('color:green');
});
