type VisualArticle = {
  id: number; title: string; excerpt: string; image: string; imageAlt?: string;
  publishedDate: string; modifiedDate?: string; content: string;
};
const escape = (value: string) => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]!);

// Identical article structure in the initial server HTML and the interactive app.
export function visualArticleMarkup(article: VisualArticle) {
  const care = article.id === 2;
  const sections = care ? [['first-day', 'The first day'], ['water-light', 'Water & light'], ['first-weeks', 'First two weeks'], ['your-plant', 'Your plant'], ['questions', 'Questions']] : [['journey', 'The journey'], ['delivery', 'Delivery timing'], ['gifting', 'Plant gifts'], ['questions', 'Questions']];
  const updated = article.modifiedDate || article.publishedDate;
  const date = new Intl.DateTimeFormat('en-IN', { dateStyle: 'long', timeZone: 'Asia/Kolkata' }).format(new Date(updated));
  return `<main class="visual-journal ${care ? 'journal-care' : 'journal-delivery'}">
    <header class="journal-hero"><div class="journal-container">
      <nav class="journal-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/#journal">The journal</a><span aria-hidden="true">/</span><span>${care ? 'Arrival care' : 'Plant delivery'}</span></nav>
      <div class="journal-hero-grid"><div class="journal-hero-copy"><p class="journal-kicker">THE RASTLINA JOURNAL / ${care ? 'GROW WITH CONFIDENCE' : 'FROM OUR NURSERY TO YOU'}</p><h1>${escape(article.title)}</h1><p class="journal-deck">${escape(article.excerpt)}</p><p class="journal-meta">By Rastlina <span aria-hidden="true">·</span> Updated <time datetime="${escape(updated)}">${escape(date)}</time></p><a class="journal-button" href="#${sections[0][0]}">${care ? 'Start the care guide' : 'Follow the journey'} <span aria-hidden="true">↓</span></a></div><figure class="journal-cover"><img src="${escape(article.image)}" alt="${escape(article.imageAlt || article.title)}" width="1050" height="700" fetchpriority="high" decoding="async"/><figcaption>${care ? 'A gentle welcome for the newest living thing in your home.' : 'Packed with care. Ready for its next chapter.'}</figcaption></figure></div>
    </div></header>
    <nav class="journal-nav" aria-label="In this guide"><div class="journal-container"><span>IN THIS GUIDE</span>${sections.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}</div></nav>
    <article class="journal-container journal-body">${article.content}
      <a class="journal-next" href="/blog/${care ? '3' : '2'}"><img src="/optimized/journal-${care ? 'delivery-hero' : 'arrival-light'}.webp" alt="${care ? 'A plant prepared for delivery' : 'A Rastlina plant settling beside a bright window'}" width="1050" height="700" loading="lazy" decoding="async"/><div><span class="journal-kicker">KEEP EXPLORING</span><h2>${care ? 'From our nursery to your doorstep.' : 'Your plant is home. What happens next?'}</h2><p>${care ? 'Our guide to PAN-India delivery and safe packaging.' : 'A visual guide to the first day and beyond.'}</p><span class="journal-text-link">Read the guide ↗</span></div></a>
    </article>
  </main>`;
}
