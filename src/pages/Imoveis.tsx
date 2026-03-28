import { useState } from "react";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { ClassifiedCard } from "@/components/ClassifiedForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Home, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ImoveisPage() {
  const [search, setSearch] = useState("");
  const { t } = useTranslation();
  const [tipo, setTipo] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { data: listings, isLoading } = useQuery({
    queryKey: ["imoveis", search, tipo, maxPrice],
    queryFn: async () => {
      let q = supabase
        .from("classified_listings")
        .select("*, mini_sites(slug, site_name, avatar_url)")
        .eq("type", "imovel")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (search) q = q.ilike("title", `%${search}%`);
      if (maxPrice) q = q.lte("price", parseFloat(maxPrice));

      const { data } = await q;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Imóveis à Venda — TrustBank"
        description="Encontre imóveis de corretores independentes. Apartamentos, casas, terrenos com fotos e contato direto."
        path="/imoveis"
      />
      <Header />

      <div className="max-w-7xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Home className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Imóveis</h1>
            <p className="text-sm text-muted-foreground">Corretores independentes com mini sites verificados</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar imóvel, bairro..."
              className="pl-9"
            />
          </div>
          <Input
            value={tipo} onChange={(e) => setTipo(e.target.value)}
            placeholder="Tipo: Apartamento, Casa..."
            className="w-48"
          />
          <Input
            type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Preço máximo R$"
            className="w-44"
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-secondary" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-5 bg-secondary rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : listings?.length === 0 ? (
          <div className="text-center py-20">
            <Home className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-bold">Nenhum imóvel encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">Seja o primeiro a anunciar seu imóvel!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings?.map((item) => (
              <ClassifiedCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
