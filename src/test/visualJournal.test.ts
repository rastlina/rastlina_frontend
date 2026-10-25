import { expect, it } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import { blogs } from '@/data/blogs';
import { articlePageHtml } from '@/server/pageHtml';

const shell = '<!doctype html><html><head><title>Rastlina</title></head><body><div id="root"></div></body></html>';

for (const id of [2, 3]) {
  it(`serves the complete visual guide ${id} with working navigation, images and metadata before JavaScript`, () => {
    const article = blogs.find(blog => blog.id === id)!;
    const doc = new DOMParser().parseFromString(articlePageHtml(shell, article), 'text/html');
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
    expect(doc.querySelector('h1')?.textContent).toBe(article.title);
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`https://www.rastlina.com/blog/${id}`);
    expect(doc.querySelector('.journal-cover img')?.getAttribute('fetchpriority')).toBe('high');
    expect(doc.querySelector('time')?.getAttribute('datetime')).toBe('2026-10-25');
    const images = [...doc.querySelectorAll('main img')];
    expect(images.length).toBeGreaterThanOrEqual(6);
    for (const image of images) {
      expect(image.getAttribute('alt')).toBeTruthy();
      const path = `public${image.getAttribute('src')}`;
      expect(existsSync(path), path).toBe(true);
      expect(path.endsWith('.webp')).toBe(true);
      expect(statSync(path).size, path).toBeLessThan(100_000);
    }
    for (const link of doc.querySelectorAll('a[href^="#"]')) {
      expect(doc.getElementById(link.getAttribute('href')!.slice(1))).not.toBeNull();
    }
    expect(doc.querySelectorAll('.journal-questions details').length).toBeGreaterThanOrEqual(3);
    expect(doc.querySelectorAll('.journal-source-links a[target="_blank"]').length).toBeGreaterThanOrEqual(2);
    expect(doc.querySelector('.journal-support a')?.getAttribute('href')).toBe('https://wa.me/918143814466');
    expect(doc.querySelector('.journal-next')?.getAttribute('href')).toBe(`/blog/${id === 2 ? 3 : 2}`);
  });
}
