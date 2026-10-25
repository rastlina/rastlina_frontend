// src/pages/BlogDetailPage.tsx

import { useParams } from 'react-router-dom';
import { blogs } from '@/data/blogs';
import { Seo, SITE_URL_BASE } from '@/components/seo/Seo';
import { vastuArticleMarkup } from '@/lib/vastuArticleMarkup';
import { visualArticleMarkup } from '@/lib/visualArticleMarkup';

const BlogDetailPage = () => {
  const { id } = useParams();

  const blog = blogs.find(
    (item) => item.id === Number(id)
  );

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Seo title="Blog Not Found | Rastlina" description="The requested Rastlina article was not found." path={`/blog/${id}`} noIndex />
        <h1 className="text-2xl font-bold">
          Blog Not Found
        </h1>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Seo
        title={`${blog.title} | Rastlina`}
        description={blog.excerpt || blog.title}
        path={`/blog/${blog.id}`}
        image={blog.image}
        type="article"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: blog.title,
          image: new URL(blog.image, SITE_URL_BASE).toString(),
          datePublished: blog.publishedDate,
          dateModified: blog.modifiedDate,
          mainEntityOfPage: `${SITE_URL_BASE}/blog/${blog.id}`,
          publisher: {
            '@type': 'Organization', '@id': `${SITE_URL_BASE}/#organization`,
            name: 'Rastlina Nature Hub Private Limited', url: `${SITE_URL_BASE}/`,
            logo: { '@type': 'ImageObject', url: `${SITE_URL_BASE}/logo-optimized.webp` },
          },
        }}
      />
      <div dangerouslySetInnerHTML={{ __html: blog.id === 1 ? vastuArticleMarkup(blog) : visualArticleMarkup(blog) }} />
    </div>
  );
};

export default BlogDetailPage;
