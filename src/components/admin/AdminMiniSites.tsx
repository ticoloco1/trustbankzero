import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { Globe, Ban, Trash2, Eye, EyeOff, Search, ShieldCheck, ShieldOff, DollarSign, Power, Tag } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import AdminPremiumSlugs from "./AdminPremiumSlugs";

const AdminMiniSites = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();

  const { data: sites, isLoading } = useQuery({
    queryKey: ["admin-mini-sites"],
    queryFn: async () => {
      const { data } = await supabase
        .from("mini_sites")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      return data || [];
    },
  });

  const updateSite = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, any>) => {
      const { error } = await supabase.from("mini_sites").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-mini-sites"] });
      toast.success("Site atualizado!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteSite = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mini_sites").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-mini-sites"] });
      toast.success("Site deletado!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (sites || []).filter((s: any) =>
    !search || s.site_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const s = settings as any;

  return (
    <div className="space-y-6">
      {/* ── GLOBAL MINI-SITE CONTROLS ── */}
      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div className="flex items-center gap-2">
          <Power className="w-4 h-4 text-primary" />
          <div>
            <h2 className="text-sm font-bold text-card-foreground uppercase">Mini-Sites — Controle Global</h2>
            <p className="text-[10px] text-muted-foreground">Habilitar/desabilitar funcionalidade e definir preços</p>
          </div>
        </div>

        {s && (
          <>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/50">
              <Switch
                checked={s.minisite_enabled ?? true}
                onCheckedChange={(v) => updateSettings.mutate({ minisite_enabled: v } as any, { onSuccess: () => toast.success("Atualizado!") })}
              />
              <div>
                <span className="text-sm font-bold text-foreground">
                  {s.minisite_enabled ? "✅ Mini-Sites HABILITADOS" : "⛔ Mini-Sites DESABILITADOS"}
                </span>
                <p className="text-[10px] text-muted-foreground">Desativar bloqueia criação de novos mini-sites</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Monthly Plans */}
              <PriceInput
                label="Plano Mensal Básico ($)"
                value={s.minisite_monthly_price ?? 9.90}
                onSave={(v) => updateSettings.mutate({ minisite_monthly_price: v } as any, { onSuccess: () => toast.success("Atualizado!") })}
              />
              <PriceInput
                label="Plano Mensal PRO ($)"
                value={s.minisite_pro_price ?? 29.90}
                onSave={(v) => updateSettings.mutate({ minisite_pro_price: v } as any, { onSuccess: () => toast.success("Atualizado!") })}
              />
              <PriceInput
                label="Hosting YouTube ($)"
                value={s.hosting_plan_youtube_price ?? 5.99}
                onSave={(v) => updateSettings.mutate({ hosting_plan_youtube_price: v } as any, { onSuccess: () => toast.success("Atualizado!") })}
              />
              <PriceInput
                label="Hosting Bunny.net ($)"
                value={s.hosting_plan_bunny_price ?? 19.90}
                onSave={(v) => updateSettings.mutate({ hosting_plan_bunny_price: v } as any, { onSuccess: () => toast.success("Atualizado!") })}
              />
            </div>

            {/* Subdomain Pricing */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase">Preços de Subdomínio (por tamanho do slug)</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <PriceInput
                  label="1 letra ($)"
                  value={s.minisite_subdomain_1char ?? 2000}
                  onSave={(v) => updateSettings.mutate({ minisite_subdomain_1char: v } as any, { onSuccess: () => toast.success("Atualizado!") })}
                />
                <PriceInput
                  label="2 letras ($)"
                  value={s.minisite_subdomain_2char ?? 1500}
                  onSave={(v) => updateSettings.mutate({ minisite_subdomain_2char: v } as any, { onSuccess: () => toast.success("Atualizado!") })}
                />
                <PriceInput
                  label="3 letras ($)"
                  value={s.minisite_subdomain_3char ?? 1000}
                  onSave={(v) => updateSettings.mutate({ minisite_subdomain_3char: v } as any, { onSuccess: () => toast.success("Atualizado!") })}
                />
                <PriceInput
                  label="4 letras ($)"
                  value={s.minisite_subdomain_4char ?? 500}
                  onSave={(v) => updateSettings.mutate({ minisite_subdomain_4char: v } as any, { onSuccess: () => toast.success("Atualizado!") })}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">5+ letras = gratuito</p>
            </div>
          </>
        )}
      </div>

      {/* ── PREMIUM WORDS ── */}
      <AdminPremiumSlugs />

      {/* ── SITES LIST ── */}
      <div className="border border-border rounded-lg p-4 bg-card space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-card-foreground uppercase">
              Mini-Sites ({filtered.length})
            </h2>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar sites..."
              className="pl-8 pr-3 py-1.5 bg-secondary text-foreground text-xs border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary w-48"
            />
          </div>
        </div>

        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center py-6">Carregando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Nome</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Slug</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Tema</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Plano</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold text-center">CV</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold text-center">Publicado</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold text-center">Status</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((site: any) => (
                  <tr key={site.id} className={`border-b border-border/50 hover:bg-muted/50 ${site.blocked ? "opacity-60 bg-destructive/5" : ""}`}>
                    <td className="py-1.5 px-2 font-medium text-foreground max-w-[160px] truncate">
                      {site.site_name || "Sem nome"}
                    </td>
                    <td className="py-1.5 px-2 font-mono text-muted-foreground">/s/{site.slug}</td>
                    <td className="py-1.5 px-2 text-muted-foreground capitalize">{site.theme}</td>
                    <td className="py-1.5 px-2">
                      <select
                        value={site.monthly_plan || "free"}
                        onChange={(e) => updateSite.mutate({ id: site.id, monthly_plan: e.target.value })}
                        className="bg-secondary text-foreground text-[10px] border border-border rounded px-1.5 py-0.5 focus:outline-none"
                      >
                        <option value="free">Free</option>
                        <option value="basic">Basic</option>
                        <option value="pro">PRO</option>
                      </select>
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${site.show_cv ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {site.show_cv ? "ON" : "OFF"}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <button
                        onClick={() => updateSite.mutate({ id: site.id, published: !site.published })}
                        className={`p-1 rounded transition-colors ${site.published ? "text-primary" : "text-muted-foreground"}`}
                        title={site.published ? "Despublicar" : "Publicar"}
                      >
                        {site.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <button
                        onClick={() => updateSite.mutate({ id: site.id, blocked: !site.blocked })}
                        className={`p-1 rounded transition-colors ${site.blocked ? "text-destructive" : "text-[hsl(var(--ticker-up))]"}`}
                        title={site.blocked ? "Desbloquear" : "Bloquear"}
                      >
                        {site.blocked ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link to={`/s/${site.slug}`} className="text-primary hover:text-primary/80" title="Ver">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            if (!confirm(`Deletar site "${site.site_name || site.slug}"?`)) return;
                            deleteSite.mutate(site.id);
                          }}
                          className="text-destructive hover:text-destructive/80" title="Deletar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── PRICING SUMMARY ── */}
      {s && (
        <div className="border border-border rounded-lg p-5 bg-card">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-card-foreground uppercase">Resumo de Preços Mini-Sites</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 px-3 text-left text-muted-foreground">Item</th>
                  <th className="py-2 px-3 text-right text-muted-foreground">Preço</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr><td className="py-2 px-3 text-foreground">Plano Mensal Básico</td><td className="py-2 px-3 text-right font-mono font-bold text-primary">${s.minisite_monthly_price ?? 9.90}</td></tr>
                <tr><td className="py-2 px-3 text-foreground">Plano Mensal PRO</td><td className="py-2 px-3 text-right font-mono font-bold text-primary">${s.minisite_pro_price ?? 29.90}</td></tr>
                <tr><td className="py-2 px-3 text-foreground">Hosting YouTube</td><td className="py-2 px-3 text-right font-mono font-bold text-primary">${s.hosting_plan_youtube_price ?? 5.99}/mês</td></tr>
                <tr><td className="py-2 px-3 text-foreground">Hosting Bunny.net</td><td className="py-2 px-3 text-right font-mono font-bold text-primary">${s.hosting_plan_bunny_price ?? 19.90}/mês</td></tr>
                <tr><td className="py-2 px-3 text-foreground">Subdomínio 1 letra</td><td className="py-2 px-3 text-right font-mono font-bold text-primary">${s.minisite_subdomain_1char ?? 2000}</td></tr>
                <tr><td className="py-2 px-3 text-foreground">Subdomínio 2 letras</td><td className="py-2 px-3 text-right font-mono font-bold text-primary">${s.minisite_subdomain_2char ?? 1500}</td></tr>
                <tr><td className="py-2 px-3 text-foreground">Subdomínio 3 letras</td><td className="py-2 px-3 text-right font-mono font-bold text-primary">${s.minisite_subdomain_3char ?? 1000}</td></tr>
                <tr><td className="py-2 px-3 text-foreground">Subdomínio 4 letras</td><td className="py-2 px-3 text-right font-mono font-bold text-primary">${s.minisite_subdomain_4char ?? 500}</td></tr>
                <tr><td className="py-2 px-3 text-foreground">Subdomínio 5+ letras</td><td className="py-2 px-3 text-right font-mono font-bold text-[hsl(var(--ticker-up))]">GRÁTIS</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Price Input Helper ── */
const PriceInput = ({ label, value, onSave }: { label: string; value: number; onSave: (v: number) => void }) => {
  const [val, setVal] = useState(String(value));
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex gap-2 mt-1">
        <input
          type="number" value={val} onChange={e => setVal(e.target.value)} step="0.01"
          className="flex-1 bg-secondary text-foreground text-sm font-mono border border-border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={() => onSave(parseFloat(val) || 0)}
          className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-bold hover:bg-primary/90"
        >
          Salvar
        </button>
      </div>
    </label>
  );
};

export default AdminMiniSites;
