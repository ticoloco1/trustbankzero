import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Home, Eye, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";

const REALESTATE_TEMPLATES = [
  "realestate-broker", "realestate-agency", "realestate-luxury",
  "realestate-commercial", "realestate-portfolio", "realestate-minimal",
];

const ImoveisDirectory = () => {
  const [search, setSearch] = useState("");

  const { data: sites, isLoading } = useQuery({
    queryKey: ["imoveis-directory", search],
    queryFn: async () => {
      let q = supabase
        .from("mini_sites")
        .select("id, slug, site_name, bio, avatar_url, cv_headline, cv_location, show_cv, user_id, template_id, boost_rank, banner_url")
        .eq("published", true)
        .in("template_id", REALESTATE_TEMPLATES);
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

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-2">
              <Home className="w-7 h-7 text-accent" /> Imóveis
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Corretores, imobiliárias e propriedades em destaque</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar imóvel, corretor, cidade..." className="pl-10" />
          </div>
        </div>

        {(!sites || sites.length === 0) ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold text-foreground mb-2">Nenhum imóvel listado ainda</p>
            <p className="text-sm text-muted-foreground mb-6">Seja o primeiro corretor a criar seu mini site imobiliário!</p>
            <Link
              to="/site/edit"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-2.5 rounded-lg font-bold text-sm"
            >
              Criar Mini Site Imobiliário
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sites.map((site: any) => (
              <Link
                key={site.id}
                to={`/s/${site.slug}`}
                className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group"
              >
                <div className="h-32 bg-secondary overflow-hidden">
                  {site.banner_url ? (
                    <img src={site.banner_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Home className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-2">
                    {site.avatar_url ? (
                      <img src={site.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black">
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
                    </div>
                  </div>
                  {site.cv_location && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" /> {site.cv_location}
                    </p>
                  )}
                  {site.bio && <p className="text-xs text-muted-foreground line-clamp-2">{site.bio}</p>}
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-2">
                    <Eye className="w-3 h-3" /> Ver propriedades
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

export default ImoveisDirectory;
