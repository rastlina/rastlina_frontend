import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://www.rastlina.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

type SeoProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  schema?: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function Seo({
  title,
  description,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  schema,
}: SeoProps) {
  const canonical = new URL(path, SITE_URL).toString();
  const normalizedImage = image.startsWith('http') ? image : new URL(image, SITE_URL).toString();

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={normalizedImage} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={normalizedImage} />
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
}

export const SITE_URL_BASE = SITE_URL;
