import { useState } from "react";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { ClassifiedCard } from "@/components/ClassifiedForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Car, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";

const MARCAS = ["Todas", "Honda", "Toyota", "Volkswagen", "Chevrolet", "Ford", "Hyundai", "Fiat", "Renault", "BMW", "Mercedes"];

export default function CarrosPage() {
  const [search, setSearch] = useState("");
  const { t } = useTranslation();
  const [marca, setMarca] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [maxKm, setMaxKm] = useState("");

  const { data: listings, isLoading } = useQuery({
    queryKey: ["carros", search, marca, maxPrice, maxKm],
    queryFn: async () => {
      let q = supabase
        .from("classified_listings")
        .select("*, mini_sites(slug, site_name, avatar_url)")
        .eq("type", "carro")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (search) q = q.ilike("title", `%${search}%`);
      if (maxPrice) q = q.lte("price", parseFloat(maxPrice));

      const { data } = await q;

      // Filtro de marca no client (está no campo extra jsonb)
      if (marca && marca !== "Todas") {
        return (data || []).filter((item: any) =>
          item.extra?.marca?.toLowerCase().includes(marca.toLowerCase())
        );
      }
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Carros à Venda — TrustBank"
        description="Encontre carros de vendedores independentes com mini sites verificados. Fotos, km, preço e contato direto."
        path="/carros"
      />
      <Header />

      <div className="max-w-7xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Car className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Carros</h1>
            <p className="text-sm text-muted-foreground">Vendedores independentes com mini sites verificados</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar modelo, ano..."
              className="pl-9"
            />
          </div>
          <Input
            type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Preço máximo R$"
            className="w-44"
          />
          <Input
            type="number" value={maxKm} onChange={(e) => setMaxKm(e.target.value)}
            placeholder="KM máximo"
            className="w-36"
          />
        </div>

        {/* Filtro por marca */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {MARCAS.map((m) => (
            <button
              key={m}
              onClick={() => setMarca(m === "Todas" ? "" : m)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border-2 transition-colors ${
                (m === "Todas" && !marca) || marca === m
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {m}
            </button>
          ))}
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
            <Car className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-bold">Nenhum carro encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">Seja o primeiro a anunciar seu carro!</p>
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
