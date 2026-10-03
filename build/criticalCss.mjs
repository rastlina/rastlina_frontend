import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

// Keep resets, variables and every class present in the public initial HTML.
// The complete stylesheet loads before interactive controls are hydrated.
export function criticalCss(css, html) {
  const classes = new Set(Array.from(html.matchAll(/\bclass="([^"]*)"/g))
    .flatMap(match => match[1].split(/\s+/)));
  const tree = postcss.parse(css);
  tree.walkAtRules('font-face', rule => rule.remove());
  tree.walkRules(rule => {
    let keep = false;
    selectorParser(selectors => selectors.each(selector => {
      let hasClass = false;
      let usedClass = false;
      selector.walkClasses(node => {
        hasClass = true;
        if (classes.has(node.value)) usedClass = true;
      });
      if (!hasClass || usedClass) keep = true;
    })).processSync(rule.selector);
    if (!keep) rule.remove();
  });
  tree.walkAtRules(rule => { if (rule.nodes?.length === 0) rule.remove(); });
  return tree.toString();
}
