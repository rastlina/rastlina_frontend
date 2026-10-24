import { expect, it } from 'vitest';
import { blogs } from '@/data/blogs';
import { articlePageHtml } from '@/server/pageHtml';

const shell = '<!doctype html><html><head><title>Rastlina</title></head><body><div id="root"></div></body></html>';

it('serves all ten linked plant recommendations and working section navigation before JavaScript', () => {
  const html = articlePageHtml(shell, blogs[0]);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  expect(doc.querySelector('h1')?.textContent).toContain('Top 10 Vastu Plants');
  const plants = [...doc.querySelectorAll('.vastu-plant')];
  expect(plants).toHaveLength(10);
  const destinations = plants.map(plant => plant.querySelector('.vastu-shop-link')?.getAttribute('href'));
  expect(new Set(destinations).size).toBe(10);
  for (const link of doc.querySelectorAll('a[href^="#"]')) {
    expect(doc.getElementById(link.getAttribute('href')!.slice(1))).not.toBeNull();
  }
  for (const plant of plants) {
    const image = plant.querySelector('img');
    expect(image?.getAttribute('alt')).toBeTruthy();
    expect(plant.querySelector('h3')?.id).toBe(plant.getAttribute('aria-labelledby'));
  }
  expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://www.rastlina.com/blog/1');
  expect(doc.querySelector('.vastu-cover img')?.getAttribute('src')).toBe(blogs[0].image);
});

it('escapes article metadata in the new server-rendered guide', () => {
  const html = articlePageHtml(shell, { ...blogs[0], title: '<img src=x onerror=alert(1)>', excerpt: '<script>alert(1)</script>' });
  const doc = new DOMParser().parseFromString(html, 'text/html');
  expect(doc.querySelector('h1 img')).toBeNull();
  expect(doc.querySelector('.vastu-deck script')).toBeNull();
  expect(doc.querySelector('h1')?.textContent).toBe('<img src=x onerror=alert(1)>');
});
