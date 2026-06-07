// Dynamic OG Image Generator
// stillnotathing.com/.netlify/functions/og-image?type=pain&tool=vercel&score=5.8

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const type = params.type || 'home';
  const tool = params.tool || '';
  const score = params.score || '';
  const title = params.title ? decodeURIComponent(params.title) : '';

  let tools = [];
  try {
    if (SUPABASE_URL && SUPABASE_KEY) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/tools?order=rage.desc&limit=5`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      tools = await res.json();
    }
  } catch(e) {}

  if (!tools.length) {
    tools = [
      { name: 'PlanetScale', rage: 8.2, happiness: 4.1, trend: 'down', emoji: '🪐' },
      { name: 'Vercel', rage: 5.8, happiness: 7.4, trend: 'flat', emoji: '⬡' },
      { name: 'Netlify', rage: 2.8, happiness: 8.1, trend: 'up', emoji: '🌐' }
    ];
  }

  const top = tools.slice(0, 3);
  const rageBar = (rage) => {
    const width = Math.round(rage * 20);
    const color = rage >= 7 ? '#ef4444' : rage >= 5 ? '#f59e0b' : '#6b7280';
    return { width, color };
  };

  let svg = '';

  if (type === 'guide' && title) {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#0a0a0f"/>
  <rect width="1200" height="630" fill="url(#grad)"/>
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#00d4aa" stop-opacity="0.05"/>
      <stop offset="1" stop-color="#7c5cfc" stop-opacity="0.05"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="6" height="630" fill="#00d4aa"/>
  <text x="60" y="80" font-family="monospace" font-size="22" fill="#00d4aa">⚡ StillNotAThing — Developer Guide</text>
  <text x="60" y="160" font-family="Arial,sans-serif" font-size="52" font-weight="bold" fill="#e8e8f0" width="1080">${title.slice(0,50)}</text>
  ${title.length > 50 ? `<text x="60" y="230" font-family="Arial,sans-serif" font-size="52" font-weight="bold" fill="#e8e8f0">${title.slice(50,95)}</text>` : ''}
  <text x="60" y="320" font-family="monospace" font-size="24" fill="#6b6b80">Daily dev resources for indie hackers</text>
  <rect x="60" y="380" width="200" height="50" rx="8" fill="#00d4aa"/>
  <text x="160" y="412" font-family="Arial,sans-serif" font-size="22" font-weight="bold" fill="#000" text-anchor="middle">Read Guide →</text>
  <text x="60" y="580" font-family="monospace" font-size="22" fill="#6b6b80">stillnotathing.com</text>
</svg>`;
  } else if (type === 'opportunity') {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#0a0a0f"/>
  <rect x="0" y="0" width="6" height="630" fill="#7c5cfc"/>
  <text x="60" y="80" font-family="monospace" font-size="22" fill="#7c5cfc">💡 StillNotAThing — Opportunity Feed</text>
  <text x="60" y="160" font-family="Arial,sans-serif" font-size="48" font-weight="bold" fill="#e8e8f0">Developer Pain = Market Gap</text>
  <text x="60" y="240" font-family="Arial,sans-serif" font-size="32" fill="#6b6b80">"${title.slice(0,60)}"</text>
  <rect x="60" y="300" width="120" height="40" rx="6" fill="rgba(34,197,94,0.15)" stroke="#22c55e" stroke-width="1"/>
  <text x="120" y="326" font-family="monospace" font-size="18" fill="#22c55e" text-anchor="middle">HIGH</text>
  <text x="60" y="420" font-family="monospace" font-size="22" fill="#00d4aa">See today's opportunities →</text>
  <text x="60" y="580" font-family="monospace" font-size="22" fill="#6b6b80">stillnotathing.com</text>
</svg>`;
  } else {
    // Default: Pain Radar
    const rows = top.map((t, i) => {
      const { width, color } = rageBar(t.rage || 0);
      const y = 260 + i * 90;
      return `
  <text x="60" y="${y}" font-family="monospace" font-size="22" fill="#6b6b80">#${i+1}</text>
  <text x="100" y="${y}" font-family="Arial,sans-serif" font-size="26" fill="#e8e8f0" font-weight="bold">${t.emoji||'🔧'} ${t.name}</text>
  <rect x="400" y="${y-22}" width="${width * 8}" height="28" rx="4" fill="${color}" opacity="0.3"/>
  <rect x="400" y="${y-22}" width="${width * 8}" height="28" rx="4" fill="none" stroke="${color}" stroke-width="1"/>
  <text x="${410 + width * 8}" y="${y}" font-family="monospace" font-size="22" fill="${color}" font-weight="bold"> ${t.rage}/10</text>`;
    }).join('');

    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#0a0a0f"/>
  <rect x="0" y="0" width="6" height="630" fill="#ef4444"/>
  <text x="60" y="80" font-family="monospace" font-size="22" fill="#ef4444">🔥 StillNotAThing — Developer Pain Radar</text>
  <text x="60" y="150" font-family="Arial,sans-serif" font-size="48" font-weight="bold" fill="#e8e8f0">What devs are raging about today</text>
  <text x="60" y="210" font-family="monospace" font-size="24" fill="#6b6b80">Community rage scores — updated daily</text>
  ${rows}
  <text x="60" y="580" font-family="monospace" font-size="22" fill="#6b6b80">stillnotathing.com — daily dev intelligence</text>
</svg>`;
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    },
    body: svg
  };
};
