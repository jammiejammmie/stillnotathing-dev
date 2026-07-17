// netlify/functions/page-meta.js
// /guides/:id, /guides, /tools 요청을 가로채 canonical·og:url·title·description을
// 요청 경로 자기 자신으로 맞추고, 가이드 상세는 Article JSON-LD와 SSR 본문을 주입한다.
// 목적: GSC "대체 페이지(적절한 canonical 태그)" — 모든 라우트가 동일한 정적
// index.html(canonical=홈)을 반환하던 문제를 해결.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SITE_URL = 'https://stillnotathing.com';

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function mdToHtml(md) {
  if (!md) return '';
  const withInline = escapeHtml(md)
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/^- (.*)$/gm, '<li>$1</li>');

  return withInline
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (/^<(h1|h2|h3|li)/.test(trimmed)) return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .join('');
}

async function fetchGuide(id) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/guides?id=eq.${encodeURIComponent(id)}&select=*`,
    { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` } }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0] || null;
}

async function getShellHtml(event) {
  // Fetch the shell from the requesting deploy's own host (prod or a deploy
  // preview), not a hardcoded SITE_URL, so preview deploys serve their own
  // index.html instead of production's. Canonical/og:url still always point
  // at SITE_URL regardless — that's intentional.
  const host = (event.headers && (event.headers['x-forwarded-host'] || event.headers.host)) || null;
  const origin = host ? `https://${host}` : SITE_URL;
  const res = await fetch(origin + '/');
  if (!res.ok) throw new Error('shell fetch failed: ' + res.status);
  return res.text();
}

function setMeta(html, { title, description, url, image }) {
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`);
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeHtml(title)}$2`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  if (image) html = html.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  return html;
}

function injectHead(html, extraHeadHtml) {
  return html.replace('</head>', `${extraHeadHtml}\n</head>`);
}

function injectBody(html, ssrHtml) {
  return html.replace('<body>', `<body>\n${ssrHtml}`);
}

exports.handler = async function (event) {
  // Routed via netlify.toml as:
  //   /tools          -> /.netlify/functions/page-meta/tools
  //   /guides*        -> /.netlify/functions/page-meta/guides/:splat
  // (/guides and /guides/:id used to be two separate redirect rules, but
  // Netlify's rewrite engine kept preferring the bare /guides rule even for
  // /guides/<id> requests when both rules shared that prefix - collapsing
  // them into one splat rule removes the ambiguity.)
  const segments = event.path.replace(/^\/.netlify\/functions\/page-meta\/?/, '').split('/').filter(Boolean);
  let mode = segments[0];
  let id = segments[1];
  if (mode === 'guides' && id) {
    mode = 'guide'; // /guides/<id> -> detail mode
  }

  let shell;
  try {
    shell = await getShellHtml(event);
  } catch (e) {
    return { statusCode: 502, headers: { 'Content-Type': 'text/plain' }, body: `Shell fetch error: ${e.message}` };
  }

  if (mode === 'guide' && id) {
    let guide = null;
    try {
      guide = await fetchGuide(id);
    } catch (e) {
      console.error('fetchGuide error:', e.message);
    }

    if (!guide) {
      return { statusCode: 404, headers: { 'Content-Type': 'text/html; charset=UTF-8', 'X-Robots-Tag': 'noindex' }, body: shell };
    }

    const url = `${SITE_URL}/guides/${guide.id}`;
    const title = `${guide.title} — StillNotAThing`;
    const description = guide.description || guide.title;
    const image = `${SITE_URL}/.netlify/functions/og-image?type=guide&title=${encodeURIComponent(guide.title || '')}`;

    let html = setMeta(shell, { title, description, url, image });

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.title,
      description,
      datePublished: guide.created_at,
      dateModified: guide.updated_at || guide.created_at,
      author: { '@type': 'Organization', name: 'StillNotAThing' },
      publisher: {
        '@type': 'Organization',
        name: 'StillNotAThing',
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/og.png` }
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      image
    };
    html = injectHead(html, `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`);

    const ssrArticle =
      `<div id="ssr-guide" style="max-width:700px;margin:0 auto;padding:16px;font-family:'DM Sans',sans-serif;color:#e8e8f0">` +
      `<article>` +
      `<h1 style="font-size:1.3rem;font-weight:700;line-height:1.3;margin-bottom:8px">${escapeHtml(guide.title)}</h1>` +
      `<p style="color:#6b6b80;line-height:1.5;margin-bottom:12px">${escapeHtml(description)}</p>` +
      mdToHtml(guide.content || '') +
      `</article></div>`;
    html = injectBody(html, ssrArticle);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'public, max-age=300, s-maxage=300' },
      body: html
    };
  }

  if (mode === 'guides') {
    const url = `${SITE_URL}/guides`;
    const html = setMeta(shell, {
      title: 'Guides — StillNotAThing',
      description: 'Practical guides for indie hackers: tool comparisons, migration playbooks, and dev stack advice.',
      url
    });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'public, max-age=300' },
      body: html
    };
  }

  if (mode === 'tools') {
    const url = `${SITE_URL}/tools`;
    const html = setMeta(shell, {
      title: 'Tool Scores — StillNotAThing',
      description: 'Happiness, rage, DX and price scores for the dev tools indie hackers actually use.',
      url
    });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'public, max-age=300' },
      body: html
    };
  }

  return { statusCode: 200, headers: { 'Content-Type': 'text/html; charset=UTF-8' }, body: shell };
};
