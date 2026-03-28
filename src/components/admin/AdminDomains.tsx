import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Trash2, Eye, DollarSign, Handshake, Check, X } from "lucide-react";
import { toast } from "sonner";

const AdminDomains = () => {
  const qc = useQueryClient();

  const { data: listings, isLoading } = useQuery({
    queryKey: ["admin-domain-listings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("domain_listings")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: offers } = useQuery({
    queryKey: ["admin-domain-offers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("domain_offers")
        .select("*, domain_listings(domain_name)")
        .order("created_at", { ascending: false });
      return (data || []) as any[];
    },
  });

  const { data: escrows } = useQuery({
    queryKey: ["admin-domain-escrows"],
    queryFn: async () => {
      const { data } = await supabase
        .from("domain_escrows")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const deleteListing = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("domain_listings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-domain-listings"] });
      toast.success("Listing removed");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const activeListings = (listings || []).filter((l: any) => l.status === "active");
  const soldListings = (listings || []).filter((l: any) => l.status === "sold");
  const pendingOffers = (offers || []).filter((o: any) => o.status === "pending");
  const activeEscrows = (escrows || []).filter((e: any) => e.status !== "released" && e.status !== "cancelled");

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-border rounded-lg p-3 bg-card text-center">
          <p className="text-lg font-bold font-mono text-foreground">{activeListings.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Ativos</p>
        </div>
        <div className="border border-border rounded-lg p-3 bg-card text-center">
          <p className="text-lg font-bold font-mono text-foreground">{soldListings.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Vendidos</p>
        </div>
        <div className="border border-border rounded-lg p-3 bg-card text-center">
          <p className="text-lg font-bold font-mono text-foreground">{pendingOffers.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Ofertas Pendentes</p>
        </div>
        <div className="border border-border rounded-lg p-3 bg-card text-center">
          <p className="text-lg font-bold font-mono text-foreground">{activeEscrows.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Escrows Ativos</p>
        </div>
      </div>

      {/* Listings */}
      <div className="border border-border rounded-lg p-4 bg-card space-y-3">
        <h2 className="text-sm font-bold text-card-foreground uppercase flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          Domínios Listados ({(listings || []).length})
        </h2>
        {isLoading ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Carregando...</p>
        ) : (listings || []).length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Nenhum domínio listado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Domínio</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Tipo</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Preço</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Views</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold text-center">Status</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {(listings || []).map((l: any) => (
                  <tr key={l.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-1.5 px-2 font-mono font-bold text-foreground">{l.domain_name}</td>
                    <td className="py-1.5 px-2 text-muted-foreground uppercase">{l.domain_type}</td>
                    <td className="py-1.5 px-2 font-mono">${Number(l.price).toLocaleString()}</td>
                    <td className="py-1.5 px-2 font-mono">{l.views}</td>
                    <td className="py-1.5 px-2 text-center">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        l.status === "active" ? "bg-[hsl(var(--ticker-up))]/20 text-[hsl(var(--ticker-up))]" :
                        l.status === "sold" ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"
                      }`}>
                        {l.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <button onClick={() => { if (confirm("Remover este domínio?")) deleteListing.mutate(l.id); }}
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

      {/* Offers */}
      <div className="border border-border rounded-lg p-4 bg-card space-y-3">
        <h2 className="text-sm font-bold text-card-foreground uppercase flex items-center gap-2">
          <Handshake className="w-4 h-4 text-accent" />
          Ofertas ({(offers || []).length})
        </h2>
        {(offers || []).length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Nenhuma oferta registrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Domínio</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Valor</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Data</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {(offers || []).map((o: any) => (
                  <tr key={o.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-1.5 px-2 font-mono font-bold text-foreground">{(o as any).domain_listings?.domain_name || "—"}</td>
                    <td className="py-1.5 px-2 font-mono">${Number(o.amount).toLocaleString()}</td>
                    <td className="py-1.5 px-2 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="py-1.5 px-2 text-center">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        o.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        o.status === "accepted" ? "bg-[hsl(var(--ticker-up))]/20 text-[hsl(var(--ticker-up))]" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {o.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Escrows */}
      <div className="border border-border rounded-lg p-4 bg-card space-y-3">
        <h2 className="text-sm font-bold text-card-foreground uppercase flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          Escrows ({(escrows || []).length})
        </h2>
        {(escrows || []).length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Nenhum escrow ativo.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Domínio</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Valor</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Taxa</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Expira</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {(escrows || []).map((e: any) => (
                  <tr key={e.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-1.5 px-2 font-mono font-bold text-foreground">{e.domain_name}</td>
                    <td className="py-1.5 px-2 font-mono">${Number(e.amount).toLocaleString()}</td>
                    <td className="py-1.5 px-2 font-mono">${Number(e.platform_fee_amount).toFixed(2)}</td>
                    <td className="py-1.5 px-2 text-muted-foreground">{new Date(e.expires_at).toLocaleDateString()}</td>
                    <td className="py-1.5 px-2 text-center">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        e.status === "funded" ? "bg-blue-100 text-blue-700" :
                        e.status === "released" ? "bg-[hsl(var(--ticker-up))]/20 text-[hsl(var(--ticker-up))]" :
                        e.status === "disputed" ? "bg-destructive/20 text-destructive" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {e.status.toUpperCase()}
                      </span>
                    </td>
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

export default AdminDomains;
