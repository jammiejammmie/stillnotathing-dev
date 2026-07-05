// netlify/functions/sitemap-dynamic.js
// Supabase guides 테이블의 글 목록으로 동적 sitemap.xml 생성
// /sitemap.xml 요청이 netlify.toml redirect로 이 함수에 연결됨

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const SITE_URL = 'https://stillnotathing.com';

function escapeXml(str) {
  return String(str).replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
  }[c]));
}

exports.handler = async function(event, context) {
  let guides = [];

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/guides?select=id,created_at&order=created_at.desc`,
      { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error('Supabase fetch error:', res.status, text);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'text/plain' },
        body: `Supabase error: ${res.status}\n${text}\nSUPABASE_URL set: ${!!SUPABASE_URL}\nSUPABASE_SERVICE_KEY set: ${!!SUPABASE_SERVICE_KEY}`
      };
    }

    guides = await res.json();
  } catch (e) {
    console.error('Fatal error fetching guides:', e.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: `Fatal error: ${e.message}\n${e.stack}\nSUPABASE_URL set: ${!!SUPABASE_URL}\nSUPABASE_SERVICE_KEY set: ${!!SUPABASE_SERVICE_KEY}`
    };
  }

  const urls = [
    `  <url>\n    <loc>${SITE_URL}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    `  <url>\n    <loc>${SITE_URL}/tools</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    `  <url>\n    <loc>${SITE_URL}/guides</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    ...guides.map((guide) => {
      const lastmod = new Date(guide.created_at).toISOString().split('T')[0];
      return `  <url>\n    <loc>${SITE_URL}/guides/${escapeXml(guide.id)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    })
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/xml' },
    body: xml
  };
};
