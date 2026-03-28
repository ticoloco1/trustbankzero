import { useState } from "react";
import { Link } from "next/link";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Search, MapPin, Lock, Eye, Globe, Zap } from "lucide-react";

const DirectorySection = () => {
  const [search, setSearch] = useState("");

  const { data: sites, isLoading } = useQuery({
    queryKey: ["directory-sites", search],
    queryFn: async () => {
      let q = supabase
        .from("mini_sites")
        .select("id, slug, site_name, bio, avatar_url, cv_headline, cv_location, show_cv, user_id, boost_rank")
        .eq("published", true);
      if (search.trim()) {
        q = q.or(`site_name.ilike.%${search}%,cv_headline.ilike.%${search}%,cv_location.ilike.%${search}%`);
      }
      const { data } = await q
        .order("boost_rank", { ascending: true })
        .order("updated_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  return (
    <section className="py-20 px-6 md:px-12" style={{ background: "#050508" }}>
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="block mb-2 text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: "'DM Mono', monospace", color: "#00C9B1" }}>
              Directory
            </span>
            <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 700, lineHeight: 1.05 }}>
              <span style={{ color: "#f2f2f8" }}>Find the best.</span>{" "}
              <em className="not-italic" style={{ background: "linear-gradient(135deg,#ff6b2b,#F59E0B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Be the best.
              </em>
            </h2>
            <p className="text-[11px] mt-1 italic" style={{ color: "#5a5a7a" }}>Encontre os melhores. Seja o melhor.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#5a5a7a" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, skill, location..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg outline-none border transition-colors focus:border-[rgba(0,201,177,.4)]"
                style={{ background: "#0d0d14", border: "1px solid #1e1e2e", color: "#f2f2f8" }}
              />
            </div>
            <Link to="/site/edit"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-opacity hover:opacity-90 whitespace-nowrap"
              style={{ background: "#00C9B1", color: "#000" }}>
              <Globe className="w-4 h-4" /> Create Yours
            </Link>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm py-10 text-center" style={{ color: "#5a5a7a" }}>Loading...</p>
        ) : (sites || []).length === 0 ? (
          <div className="text-center py-16 rounded-xl border" style={{ background: "#0d0d14", borderColor: "#1e1e2e" }}>
            <Globe className="w-12 h-12 mx-auto mb-4" style={{ color: "#5a5a7a" }} />
            <p className="text-lg font-bold mb-2" style={{ color: "#f2f2f8" }}>No mini sites yet</p>
            <p className="text-sm mb-1" style={{ color: "#8888aa" }}>Be the first to create your professional mini site!</p>
            <p className="text-[11px] italic mb-6" style={{ color: "#5a5a7a" }}>Seja o primeiro a criar seu mini site!</p>
            <Link to="/site/edit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm"
              style={{ background: "#00C9B1", color: "#000" }}>
              Create Mini Site
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(sites || []).map((site: any) => (
              <Link
                key={site.id}
                to={`/s/${site.slug}`}
                className="rounded-xl p-5 border transition-all hover:-translate-y-1 hover:shadow-lg group"
                style={{ background: "#0d0d14", borderColor: "#1e1e2e" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,201,177,.3)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1e1e2e"; }}
              >
                <div className="flex items-start gap-3 mb-3">
                  {site.avatar_url ? (
                    <img src={site.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" style={{ border: "2px solid #1e1e2e" }} />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg"
                      style={{ background: "#00C9B1", color: "#000" }}>
                      {(site.site_name || "?")?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-black truncate group-hover:text-[#00C9B1] transition-colors" style={{ color: "#f2f2f8" }}>
                        {site.site_name || "Unnamed"}
                      </h3>
                      {site.boost_rank < 999 && <Zap className="w-3 h-3 fill-yellow-500 flex-shrink-0" style={{ color: "#F59E0B" }} />}
                    </div>
                    {site.cv_headline && (
                      <p className="text-xs font-bold truncate" style={{ color: "#F59E0B" }}>{site.cv_headline}</p>
                    )}
                    {site.cv_location && (
                      <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "#5a5a7a" }}>
                        <MapPin className="w-3 h-3" /> {site.cv_location}
                      </p>
                    )}
                  </div>
                </div>
                {site.bio && (
                  <p className="text-xs line-clamp-2 mb-2" style={{ color: "#8888aa" }}>{site.bio}</p>
                )}
                <div className="flex items-center gap-2">
                  {site.show_cv && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ background: "rgba(0,201,177,.1)", color: "#00C9B1" }}>
                      <Lock className="w-2.5 h-2.5" /> CV — $20
                    </span>
                  )}
                  <span className="text-[10px] flex items-center gap-1 ml-auto" style={{ color: "#5a5a7a" }}>
                    <Eye className="w-3 h-3" /> View
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DirectorySection;
