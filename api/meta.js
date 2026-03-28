// Vercel Edge Function - injects SEO meta tags for mini sites
export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default async function handler(req) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');
  
  if (!slug) {
    return new Response('Missing slug', { status: 400 });
  }

  try {
    // Fetch site data from Supabase
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/mini_sites?slug=eq.${slug}&select=site_name,bio,avatar_url,accent_color&limit=1`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const sites = await res.json();
    const site = sites?.[0];

    if (!site) {
      return new Response('Not found', { status: 404 });
    }

    const title = `${site.site_name} | TrustBank`;
    const description = site.bio || `${site.site_name} on TrustBank — mini site, videos, CV and more.`;
    const image = site.avatar_url || 'https://trustbank.xyz/og-default.png';
    const siteUrl = `https://${slug}.trustbank.xyz`;

    return new Response(JSON.stringify({ title, description, image, url: siteUrl }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (e) {
    return new Response('Error', { status: 500 });
  }
}
