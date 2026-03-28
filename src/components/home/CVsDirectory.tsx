import { useState } from "react";
import { Link } from "next/link";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Search, MapPin, Lock, Eye, FileText, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";

const CVsDirectory = () => {
  const [search, setSearch] = useState("");

  const { data: sites, isLoading } = useQuery({
    queryKey: ["cvs-directory", search],
    queryFn: async () => {
      let q = supabase
        .from("mini_sites")
        .select("id, slug, site_name, bio, avatar_url, cv_headline, cv_location, cv_skills, show_cv, user_id, boost_rank")
        .eq("published", true)
        .eq("show_cv", true);
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

  if (isLoading && !sites) return null;
  if (!sites || sites.length === 0) return null;

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-2">
              <FileText className="w-7 h-7 text-accent" /> Profissionais & CVs
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Encontre profissionais qualificados e desbloqueie seus currículos</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar habilidade, cargo, cidade..." className="pl-10" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sites.map((site: any) => (
            <Link
              key={site.id}
              to={`/s/${site.slug}`}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex items-start gap-3 mb-3">
                {site.avatar_url ? (
                  <img src={site.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-border" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-lg">
                    {(site.site_name || "?")?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-foreground truncate group-hover:text-accent transition-colors">
                      {site.site_name || "Unnamed"}
                    </h3>
                    {site.boost_rank < 999 && <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                  </div>
                  {site.cv_headline && <p className="text-xs text-accent font-bold truncate">{site.cv_headline}</p>}
                  {site.cv_location && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {site.cv_location}
                    </p>
                  )}
                </div>
              </div>

              {/* Skills */}
              {site.cv_skills && site.cv_skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {site.cv_skills.slice(0, 4).map((skill: string, i: number) => (
                    <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">
                      {skill}
                    </span>
                  ))}
                  {site.cv_skills.length > 4 && (
                    <span className="text-[9px] text-muted-foreground">+{site.cv_skills.length - 4}</span>
                  )}
                </div>
              )}

              {site.bio && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{site.bio}</p>}

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> CV — $20
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto">
                  <Eye className="w-3 h-3" /> Ver perfil
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CVsDirectory;
