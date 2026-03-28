import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
};

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Determine base URL from Origin header or default
  const origin = req.headers.get("origin") || Deno.env.get("SITE_URL") || "https://id-preview--7bf6cc16-f40a-4ffa-a1cb-8b83af726afc.lovable.app";

  const path = url.searchParams.get("type") || "index";

  if (path === "index") {
    // Sitemap index pointing to sub-sitemaps
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${origin}/functions/v1/sitemap?type=pages</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${origin}/functions/v1/sitemap?type=mini-sites</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${origin}/functions/v1/sitemap?type=videos</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${origin}/functions/v1/sitemap?type=creators</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </sitemap>
</sitemapindex>`;
    return new Response(xml, { headers: corsHeaders });
  }

  if (path === "pages") {
    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "daily" },
      { loc: "/exchange", priority: "0.9", changefreq: "daily" },
      { loc: "/exchange/index", priority: "0.8", changefreq: "daily" },
      { loc: "/exchange/futures", priority: "0.8", changefreq: "daily" },
      { loc: "/marketplace", priority: "0.9", changefreq: "daily" },
      { loc: "/how-it-works", priority: "0.7", changefreq: "monthly" },
      { loc: "/careers", priority: "0.5", changefreq: "monthly" },
      { loc: "/auth", priority: "0.3", changefreq: "monthly" },
    ];

    const urls = staticPages
      .map(
        (p) => `  <url>
    <loc>${origin}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
    return new Response(xml, { headers: corsHeaders });
  }

  if (path === "mini-sites") {
    const { data: sites } = await supabase
      .from("mini_sites")
      .select("slug, updated_at")
      .eq("published", true)
      .order("updated_at", { ascending: false })
      .limit(1000);

    const urls = (sites || [])
      .map(
        (s: any) => `  <url>
    <loc>${origin}/s/${s.slug}</loc>
    <lastmod>${s.updated_at?.split("T")[0] || new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
    return new Response(xml, { headers: corsHeaders });
  }

  if (path === "videos") {
    const { data: videos } = await supabase
      .from("videos")
      .select("id, title, thumbnail_url, updated_at")
      .eq("status", "active")
      .eq("blocked", false)
      .order("updated_at", { ascending: false })
      .limit(1000);

    const urls = (videos || [])
      .map(
        (v: any) => `  <url>
    <loc>${origin}/video/${v.id}</loc>
    <lastmod>${v.updated_at?.split("T")[0] || new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
    return new Response(xml, { headers: corsHeaders });
  }

  if (path === "creators") {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, updated_at, display_name")
      .order("updated_at", { ascending: false })
      .limit(1000);

    const urls = (profiles || [])
      .map(
        (p: any) => `  <url>
    <loc>${origin}/creator/${p.user_id}</loc>
    <lastmod>${p.updated_at?.split("T")[0] || new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
    return new Response(xml, { headers: corsHeaders });
  }

  return new Response("Not found", { status: 404 });
});
