import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Tag, Trash2, DollarSign, Gavel, Users } from "lucide-react";
import { toast } from "sonner";

const AdminSlugListings = () => {
  const qc = useQueryClient();

  const { data: listings, isLoading } = useQuery({
    queryKey: ["admin-slug-listings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("slug_listings")
        .select("*, mini_sites(slug, site_name)")
        .order("created_at", { ascending: false });
      return (data || []) as any[];
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ["admin-slug-transactions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("slug_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return (data || []) as any[];
    },
  });

  const { data: registrations } = useQuery({
    queryKey: ["admin-slug-registrations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("slug_registrations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      return (data || []) as any[];
    },
  });

  const deleteListing = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("slug_listings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-slug-listings"] });
      toast.success("Listing removido");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const activeListings = (listings || []).filter((l: any) => l.status === "active");
  const soldListings = (listings || []).filter((l: any) => l.status === "sold");
  const totalFees = (transactions || []).reduce((s: number, t: any) => s + Number(t.platform_fee_amount || 0), 0);
  const activeRegs = (registrations || []).filter((r: any) => r.status === "active");

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-border rounded-lg p-3 bg-card text-center">
          <p className="text-lg font-bold font-mono text-foreground">{activeRegs.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Slugs Registrados</p>
        </div>
        <div className="border border-border rounded-lg p-3 bg-card text-center">
          <p className="text-lg font-bold font-mono text-foreground">{activeListings.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">À Venda</p>
        </div>
        <div className="border border-border rounded-lg p-3 bg-card text-center">
          <p className="text-lg font-bold font-mono text-foreground">{soldListings.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Vendidos</p>
        </div>
        <div className="border border-border rounded-lg p-3 bg-card text-center">
          <p className="text-lg font-bold font-mono text-foreground text-[hsl(var(--ticker-up))]">${totalFees.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Taxa 5% Coletada</p>
        </div>
      </div>

      {/* Registrations */}
      <div className="border border-border rounded-lg p-4 bg-card space-y-3">
        <h2 className="text-sm font-bold text-card-foreground uppercase flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Registros de Slugs ({activeRegs.length} ativos)
        </h2>
        {(registrations || []).length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Nenhum registro.</p>
        ) : (
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border text-left">
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Slug</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Tipo</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Taxa</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Expira</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {(registrations || []).map((r: any) => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-1.5 px-2 font-mono font-bold text-foreground">/{r.slug}</td>
                    <td className="py-1.5 px-2 text-muted-foreground capitalize">{r.slug_type || "standard"}</td>
                    <td className="py-1.5 px-2 font-mono">${Number(r.registration_fee || 12).toFixed(2)}</td>
                    <td className="py-1.5 px-2 text-muted-foreground">{r.expires_at ? new Date(r.expires_at).toLocaleDateString() : "—"}</td>
                    <td className="py-1.5 px-2 text-center">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        r.status === "active" ? "bg-[hsl(var(--ticker-up))]/20 text-[hsl(var(--ticker-up))]" : "bg-muted text-muted-foreground"
                      }`}>
                        {(r.status || "active").toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slug Listings for Sale */}
      <div className="border border-border rounded-lg p-4 bg-card space-y-3">
        <h2 className="text-sm font-bold text-card-foreground uppercase flex items-center gap-2">
          <Tag className="w-4 h-4 text-accent" />
          Slugs à Venda ({(listings || []).length})
        </h2>
        {isLoading ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Carregando...</p>
        ) : (listings || []).length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Nenhum slug à venda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Slug</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Mini Site</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Preço</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold text-center">Status</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {(listings || []).map((l: any) => (
                  <tr key={l.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-1.5 px-2 font-mono font-bold text-foreground">/{l.slug}</td>
                    <td className="py-1.5 px-2 text-muted-foreground">{l.mini_sites?.site_name || l.mini_sites?.slug || "—"}</td>
                    <td className="py-1.5 px-2 font-mono">${Number(l.price).toLocaleString()}</td>
                    <td className="py-1.5 px-2 text-center">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        l.status === "active" ? "bg-[hsl(var(--ticker-up))]/20 text-[hsl(var(--ticker-up))]" :
                        l.status === "sold" ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"
                      }`}>
                        {l.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <button onClick={() => { if (confirm("Remover este listing?")) deleteListing.mutate(l.id); }}
                        className="text-destructive hover:text-destructive/80">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="border border-border rounded-lg p-4 bg-card space-y-3">
        <h2 className="text-sm font-bold text-card-foreground uppercase flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          Transações Recentes ({(transactions || []).length})
        </h2>
        {(transactions || []).length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Nenhuma transação registrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Slug</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Tipo</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Valor</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Taxa 5%</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Líquido</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Data</th>
                </tr>
              </thead>
              <tbody>
                {(transactions || []).map((t: any) => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-1.5 px-2 font-mono font-bold text-foreground">/{t.slug}</td>
                    <td className="py-1.5 px-2 text-muted-foreground capitalize">{t.tx_type}</td>
                    <td className="py-1.5 px-2 font-mono">${Number(t.amount).toLocaleString()}</td>
                    <td className="py-1.5 px-2 font-mono text-destructive">${Number(t.platform_fee_amount).toFixed(2)}</td>
                    <td className="py-1.5 px-2 font-mono text-[hsl(var(--ticker-up))]">${Number(t.net_to_seller).toFixed(2)}</td>
                    <td className="py-1.5 px-2 text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSlugListings;
