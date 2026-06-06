import { Helmet } from "react-helmet-async";

const SITE_NAME = "Astro — Daily Dev Resource";
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://astro.replit.app";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;
const DEFAULT_DESCRIPTION = "Tool scorecards, daily guides, and curated Hacker News for indie hackers and solo builders.";

interface SeoHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  schema?: Record<string, unknown>;
  path?: string;
}

export default function SeoHead({ title, description, ogImage, schema, path = "" }: SeoHeadProps) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  const desc = description || DEFAULT_DESCRIPTION;
  const image = ogImage || DEFAULT_OG_IMAGE;
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />

      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

export function siteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/tools?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function toolSchema(tool: {
  name: string;
  tagline: string;
  category: string;
  websiteUrl?: string | null;
  happinessScore: number;
  dxScore: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.tagline,
    applicationCategory: tool.category,
    url: tool.websiteUrl || undefined,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: tool.happinessScore,
      bestRating: 10,
      worstRating: 0,
    },
  };
}

export function guideSchema(guide: {
  title: string;
  excerpt: string;
  author?: string | null;
  publishedAt: string;
  readingTime: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.excerpt,
    author: guide.author
      ? { "@type": "Person", name: guide.author }
      : undefined,
    datePublished: guide.publishedAt,
    timeRequired: `PT${guide.readingTime}M`,
  };
}
