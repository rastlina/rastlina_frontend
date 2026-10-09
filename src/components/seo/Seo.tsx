import { Helmet } from 'react-helmet-async';
import { canonicalUrl, schemaJson, SITE_URL } from '@/lib/seoUrls';

const DEFAULT_IMAGE = `${SITE_URL}/og-image.webp`;

type SeoProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  noIndex?: boolean;
  schema?: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function Seo({
  title,
  description,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  noIndex = false,
  schema,
}: SeoProps) {
  const canonical = canonicalUrl(path);
  const normalizedImage = image.startsWith('http') ? image : new URL(image, SITE_URL).toString();

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={normalizedImage} />
      <meta property="og:site_name" content="Rastlina" />
      <meta property="og:locale" content="en_IN" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={normalizedImage} />
      {schema && (
        <script type="application/ld+json">{schemaJson(schema)}</script>
      )}
    </Helmet>
  );
}

export const SITE_URL_BASE = SITE_URL;
