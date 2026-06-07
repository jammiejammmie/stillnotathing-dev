// netlify/functions/badge.js
// stillnotathing.com/.netlify/functions/badge?tool=supabase
// 개발자 README에 삽입하면 자동 백링크 + 노출 생성

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const defaultScores = {
  vercel: { happiness: 7.4, trend: 'stable', emoji: '😐' },
  supabase: { happiness: 9.2, trend: 'up', emoji: '🥰' },
  netlify: { happiness: 8.1, trend: 'up', emoji: '😊' },
  stripe: { happiness: 8.7, trend: 'stable', emoji: '😄' },
  railway: { happiness: 8.9, trend: 'up', emoji: '🤩' },
  clerk: { happiness: 9.0, trend: 'up', emoji: '😍' },
  resend: { happiness: 9.3, trend: 'up', emoji: '🥰' },
  planetscale: { happiness: 4.1, trend: 'down', emoji: '😤' }
};

exports.handler = async (event) => {
  const tool = (event.queryStringParameters?.tool || 'supabase').toLowerCase();
  const type = event.queryStringParameters?.type || 'score'; // score | stack | devcard

  // Supabase에서 실시간 점수 가져오기
  let score = defaultScores[tool] || { happiness: 8.0, trend: 'stable', emoji: '😊' };

  try {
    if (SUPABASE_URL && SUPABASE_KEY) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/tools?name=ilike.${tool}&select=happiness,trend,happiness_emoji&limit=1`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      const data = await res.json();
      if (data?.[0]) {
        score = { happiness: data[0].happiness, trend: data[0].trend, emoji: data[0].happiness_emoji };
      }
    }
  } catch(e) {}

  const trendArrow = score.trend === 'up' ? '↑' : score.trend === 'down' ? '↓' : '→';
  const trendColor = score.trend === 'up' ? '22c55e' : score.trend === 'down' ? 'ef4444' : '6b7280';
  const scoreColor = score.happiness >= 8.5 ? '00d4aa' : score.happiness >= 7 ? 'f59e0b' : 'ef4444';
  const toolName = tool.charAt(0).toUpperCase() + tool.slice(1);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1e1e2e"/>
      <stop offset="1" stop-color="#13131f"/>
    </linearGradient>
  </defs>
  <rect width="200" height="20" rx="4" fill="url(#bg)"/>
  <rect width="80" height="20" rx="4" fill="#111118"/>
  <text x="6" y="14" font-family="monospace" font-size="10" fill="#6b6b80">StillNotAThing</text>
  <rect x="80" width="120" height="20" rx="4" fill="#${scoreColor}22" stroke="#${scoreColor}44" stroke-width="0.5"/>
  <text x="88" y="14" font-family="monospace" font-size="11" font-weight="bold" fill="#${scoreColor}">${toolName} ${score.happiness}/10</text>
  <text x="178" y="14" font-family="monospace" font-size="11" fill="#${trendColor}">${trendArrow}</text>
</svg>`;

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
