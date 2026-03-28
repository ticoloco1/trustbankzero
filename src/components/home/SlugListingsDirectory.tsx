import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Link } from "next/link";
import { Crown, ShoppingCart, Tag, ArrowRight } from "lucide-react";

export default function SlugListingsDirectory() {
  const { data: listings } = useQuery({
    queryKey: ["home-slug-listings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("slug_listings")
        .select("id, slug, price, created_at, mini_sites(site_name, avatar_url, bio)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(8);
      return data || [];
    },
  });

  const { data: premiumSlugs } = useQuery({
    queryKey: ["home-premium-slugs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("premium_slugs")
        .select("id, keyword, price")
        .eq("active", true)
        .is("sold_to" as any, null)
        .order("price", { ascending: true })
        .limit(4);
      return data || [];
    },
  });

  const hasContent = (listings || []).length > 0 || (premiumSlugs || []).length > 0;

  return (
    <section className="py-20 px-6 md:px-12" style={{ background: "#050508" }}>
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6" style={{ color: "#F59E0B" }} />
            <div>
              <h2 className="text-lg font-black" style={{ fontFamily: "'Clash Display', sans-serif", color: "#f2f2f8" }}>Slugs for Sale</h2>
              <p className="text-[10px]" style={{ color: "#5a5a7a" }}>Available subdomains • 5% platform fee · <span className="italic">Subdomínios disponíveis • Taxa de 5%</span></p>
            </div>
          </div>
          <Link to="/slugs" className="flex items-center gap-1 text-xs font-bold hover:opacity-80 transition-opacity" style={{ color: "#00C9B1" }}>
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!hasContent ? (
          <div className="rounded-xl p-8 text-center border" style={{ background: "#0d0d14", borderColor: "#1e1e2e" }}>
            <Crown className="w-8 h-8 mx-auto mb-3" style={{ color: "#5a5a7a" }} />
            <p className="text-sm mb-2" style={{ color: "#8888aa" }}>No slugs for sale yet</p>
            <p className="text-[10px] italic mb-2" style={{ color: "#5a5a7a" }}>Nenhum slug à venda ainda</p>
            <Link to="/slugs" className="text-xs font-bold hover:opacity-80" style={{ color: "#00C9B1" }}>
              Register your subdomain →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {(premiumSlugs || []).length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase mb-3 flex items-center gap-1 tracking-[0.1em]" style={{ color: "#5a5a7a" }}>
                  <Crown className="w-3 h-3" style={{ color: "#F59E0B" }} /> Premium Keywords
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(premiumSlugs || []).map((s: any) => (
                    <Link key={s.id} to="/slugs"
                      className="rounded-xl p-4 border text-center transition-all hover:-translate-y-1 hover:shadow-lg group"
                      style={{ background: "#0d0d14", borderColor: "rgba(245,158,11,.2)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,.4)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,.2)"; }}>
                      <p className="text-sm font-black font-mono group-hover:text-[#F59E0B] transition-colors" style={{ color: "#f2f2f8" }}>/{s.keyword}</p>
                      <p className="text-lg font-black mt-1" style={{ color: "#F59E0B" }}>${s.price.toLocaleString()}</p>
                      <p className="text-[9px] mt-0.5" style={{ color: "#5a5a7a" }}>+ $12.90/year</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(listings || []).length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase mb-3 flex items-center gap-1 tracking-[0.1em]" style={{ color: "#5a5a7a" }}>
                  <Tag className="w-3 h-3" style={{ color: "#00C9B1" }} /> From Users · <span className="italic normal-case">De Usuários</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(listings || []).map((l: any) => {
                    const site = l.mini_sites;
                    return (
                      <Link key={l.id} to="/slugs"
                        className="rounded-xl p-4 border transition-all hover:-translate-y-1 hover:shadow-lg group"
                        style={{ background: "#0d0d14", borderColor: "#1e1e2e" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,201,177,.3)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1e1e2e"; }}>
                        <div className="flex items-center gap-2.5 mb-2">
                          {site?.avatar_url ? (
                            <img src={site.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" style={{ border: "1px solid #1e1e2e" }} />
                          ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                              style={{ background: "#00C9B1", color: "#000" }}>
                              {(site?.site_name || l.slug)?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-black font-mono group-hover:text-[#00C9B1] transition-colors" style={{ color: "#f2f2f8" }}>/{l.slug}</p>
                            {site?.site_name && <p className="text-[9px]" style={{ color: "#5a5a7a" }}>{site.site_name}</p>}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-black" style={{ color: "#00C9B1" }}>${l.price}</p>
                          <ShoppingCart className="w-3.5 h-3.5 group-hover:text-[#00C9B1] transition-colors" style={{ color: "#5a5a7a" }} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
