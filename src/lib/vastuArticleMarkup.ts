type VastuArticle = {
  title: string; excerpt: string; image: string; imageAlt?: string;
  publishedDate: string; modifiedDate?: string; content: string;
};

const escape = (value: string) => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]!);

// Shared by the interactive page and its initial server response.
export function vastuArticleMarkup(article: VastuArticle) {
  return `<main class="vastu-guide">
    <header class="vastu-hero"><div class="vastu-container">
      <nav class="vastu-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/#journal">The journal</a><span aria-hidden="true">/</span><span>Vastu &amp; living</span></nav>
      <div class="vastu-hero-grid"><div class="vastu-hero-copy"><p class="vastu-eyebrow">THE RASTLINA JOURNAL · VASTU &amp; LIVING</p><h1>${escape(article.title)}</h1><p class="vastu-deck">${escape(article.excerpt)}</p><p class="vastu-meta">By Rastlina <span aria-hidden="true">·</span> Updated <time datetime="${escape(article.modifiedDate || article.publishedDate)}">24 October 2026</time></p><a href="#quick-picks" class="vastu-button">Discover the top 10 <span aria-hidden="true">↓</span></a></div>
      <figure class="vastu-cover"><img src="${escape(article.image)}" alt="${escape(article.imageAlt || article.title)}" width="1200" height="800" fetchpriority="high" decoding="async" /><figcaption>A few favourites from the edit, styled in our original self-watering pots.</figcaption></figure></div>
    </div></header>
    <div class="vastu-container vastu-body"><nav class="vastu-contents" aria-label="In this guide"><span>IN THIS GUIDE</span><a href="#quick-picks">The top 10</a><a href="#placement">Placement</a><a href="#care">Pot &amp; care</a><a href="#questions">Your questions</a><a href="#sources">Our research</a></nav><article class="blog-content vastu-article">${article.content}</article></div>
  </main>`;
}
