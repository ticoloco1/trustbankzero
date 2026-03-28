import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Flame, Plus, Trash2, ToggleLeft, ToggleRight, Upload, Gavel } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const AdminPremiumSlugs = () => {
  const qc = useQueryClient();
  const [newWord, setNewWord] = useState("");
  const [newPrice, setNewPrice] = useState("2000");
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  // Auction state
  const [auctionKeyword, setAuctionKeyword] = useState("");
  const [auctionStart, setAuctionStart] = useState("100");
  const [auctionIncrement, setAuctionIncrement] = useState("10");
  const [auctionDays, setAuctionDays] = useState("7");
  const [showAuction, setShowAuction] = useState(false);

  const { data: slugs, isLoading } = useQuery({
    queryKey: ["premium-slugs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("premium_slugs")
        .select("*")
        .order("keyword");
      return data || [];
    },
  });

  const { data: auctions } = useQuery({
    queryKey: ["slug-auctions-admin"],
    queryFn: async () => {
      const { data } = await supabase
        .from("slug_auctions")
        .select("*")
        .order("created_at", { ascending: false });
      return (data || []) as any[];
    },
  });

  const addSlug = useMutation({
    mutationFn: async () => {
      const kw = newWord.trim().toLowerCase().replace(/\s+/g, "");
      if (!kw) throw new Error("Palavra obrigatória");
      const { error } = await supabase.from("premium_slugs").insert({
        keyword: kw,
        price: parseFloat(newPrice) || 500,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["premium-slugs"] });
      setNewWord("");
      setNewPrice("2000");
      toast.success("Palavra premium adicionada!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const bulkImport = useMutation({
    mutationFn: async () => {
      const lines = bulkText.trim().split("\n").filter(Boolean);
      if (!lines.length) throw new Error("Nenhuma linha encontrada");
      const rows = lines.map(line => {
        const parts = line.split(/[,\t;|]+/).map(s => s.trim());
        const keyword = parts[0]?.toLowerCase().replace(/\s+/g, "");
        const price = parseFloat(parts[1]) || 500;
        if (!keyword) throw new Error(`Linha inválida: "${line}"`);
        return { keyword, price };
      });
      const { error } = await supabase.from("premium_slugs").insert(rows);
      if (error) throw error;
      return rows.length;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ["premium-slugs"] });
      setBulkText("");
      setShowBulk(false);
      toast.success(`${count} slugs importados com sucesso!`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const createAuction = useMutation({
    mutationFn: async () => {
      const kw = auctionKeyword.trim().toLowerCase().replace(/\s+/g, "");
      if (!kw) throw new Error("Keyword obrigatória");
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + (parseInt(auctionDays) || 7));
      const { error } = await supabase.from("slug_auctions").insert({
        keyword: kw,
        starting_price: parseFloat(auctionStart) || 100,
        min_increment: parseFloat(auctionIncrement) || 10,
        ends_at: endsAt.toISOString(),
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slug-auctions-admin"] });
      setAuctionKeyword("");
      toast.success("Leilão criado!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const endAuction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("slug_auctions").update({ status: "ended" } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slug-auctions-admin"] });
      toast.success("Leilão encerrado!");
    },
  });

  const updateSlug = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, any>) => {
      const { error } = await supabase.from("premium_slugs").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["premium-slugs"] });
      toast.success("Atualizado!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteSlug = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("premium_slugs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["premium-slugs"] });
      toast.success("Removido!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      {/* ── Premium Slugs ── */}
      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-destructive" />
            <div>
              <h2 className="text-sm font-bold text-card-foreground uppercase">Nomes Quentes — Palavras Premium</h2>
              <p className="text-[10px] text-muted-foreground">Subdomínios com palavras-chave especiais</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowBulk(!showBulk)} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1.5 rounded text-xs font-bold hover:bg-muted">
              <Upload className="w-3.5 h-3.5" /> Importar em Massa
            </button>
            <button onClick={() => setShowAuction(!showAuction)} className="flex items-center gap-1 bg-accent text-accent-foreground px-3 py-1.5 rounded text-xs font-bold hover:opacity-90">
              <Gavel className="w-3.5 h-3.5" /> Criar Leilão
            </button>
          </div>
        </div>

        {/* Bulk import */}
        {showBulk && (
          <div className="border border-border rounded-lg p-4 bg-secondary/30 space-y-3">
            <h3 className="text-xs font-bold text-foreground">Importação em Massa</h3>
            <p className="text-[10px] text-muted-foreground">
              Cole uma lista com formato: <code className="bg-secondary px-1 rounded">palavra, preço</code> (uma por linha). 
              Separadores aceitos: vírgula, tab, ponto-e-vírgula ou pipe.
            </p>
            <textarea
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder={`doctor, 2500\nlawyer, 3000\ncrypto, 2000\nmusic, 1500`}
              className="w-full h-40 bg-background text-foreground text-xs font-mono border border-border rounded-lg p-3 resize-y focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                {bulkText.trim().split("\n").filter(Boolean).length} linha(s) detectadas
              </span>
              <button
                onClick={() => bulkImport.mutate()}
                disabled={bulkImport.isPending || !bulkText.trim()}
                className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded text-xs font-bold hover:bg-primary/90 disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" /> Importar Todos
              </button>
            </div>
          </div>
        )}

        {/* Create auction */}
        {showAuction && (
          <div className="border border-border rounded-lg p-4 bg-accent/5 space-y-3">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Gavel className="w-3.5 h-3.5 text-accent" /> Criar Leilão de Subdomínio
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground font-bold uppercase">Keyword</label>
                <Input value={auctionKeyword} onChange={e => setAuctionKeyword(e.target.value)} placeholder="doctor" className="mt-1" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-bold uppercase">Lance Inicial ($)</label>
                <Input type="number" value={auctionStart} onChange={e => setAuctionStart(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-bold uppercase">Incremento Mín ($)</label>
                <Input type="number" value={auctionIncrement} onChange={e => setAuctionIncrement(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-bold uppercase">Duração (dias)</label>
                <Input type="number" value={auctionDays} onChange={e => setAuctionDays(e.target.value)} className="mt-1" />
              </div>
            </div>
            <button
              onClick={() => createAuction.mutate()}
              disabled={createAuction.isPending || !auctionKeyword.trim()}
              className="flex items-center gap-1 bg-accent text-accent-foreground px-4 py-2 rounded text-xs font-bold hover:opacity-90 disabled:opacity-50"
            >
              <Gavel className="w-3.5 h-3.5" /> Iniciar Leilão
            </button>
          </div>
        )}

        {/* Add single */}
        <div className="flex flex-wrap gap-2 items-end">
          <label className="block">
            <span className="text-xs text-muted-foreground">Palavra</span>
            <input type="text" value={newWord} onChange={(e) => setNewWord(e.target.value)} placeholder="ex: doctor"
              className="block w-40 bg-secondary text-foreground text-sm border border-border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-1 focus:ring-primary" />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Preço ($)</span>
            <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} step="100"
              className="block w-28 bg-secondary text-foreground text-sm font-mono border border-border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-1 focus:ring-primary" />
          </label>
          <button onClick={() => addSlug.mutate()} disabled={addSlug.isPending}
            className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded text-xs font-bold hover:bg-primary/90 disabled:opacity-50">
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        </div>

        {/* Active auctions */}
        {(auctions || []).filter((a: any) => a.status === "active").length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-foreground uppercase flex items-center gap-1.5">
              <Gavel className="w-3.5 h-3.5 text-accent" /> Leilões Ativos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(auctions || []).filter((a: any) => a.status === "active").map((a: any) => (
                <div key={a.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-3">
                  <div>
                    <span className="text-sm font-mono font-bold text-foreground">/{a.keyword}</span>
                    <p className="text-[10px] text-muted-foreground">
                      Lance atual: ${a.current_bid || a.starting_price} · Encerra: {new Date(a.ends_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button onClick={() => endAuction.mutate(a.id)} className="text-destructive text-[10px] font-bold hover:underline">
                    Encerrar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Slug list */}
        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center py-4">Carregando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Palavra</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold">Preço ($)</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold text-center">Ativo</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold text-center">Vendido</th>
                  <th className="py-2 px-2 text-muted-foreground font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {(slugs || []).map((s: any) => (
                  <SlugRow
                    key={s.id}
                    slug={s}
                    onUpdate={(updates) => updateSlug.mutate({ id: s.id, ...updates })}
                    onDelete={() => {
                      if (!confirm(`Remover "${s.keyword}"?`)) return;
                      deleteSlug.mutate(s.id);
                    }}
                  />
                ))}
                {(!slugs || slugs.length === 0) && (
                  <tr><td colSpan={5} className="py-4 text-center text-muted-foreground">Nenhuma palavra premium cadastrada</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const SlugRow = ({ slug, onUpdate, onDelete }: { slug: any; onUpdate: (u: Record<string, any>) => void; onDelete: () => void }) => {
  const [price, setPrice] = useState(String(slug.price));

  return (
    <tr className={`border-b border-border/50 hover:bg-muted/50 ${!slug.active ? "opacity-50" : ""}`}>
      <td className="py-1.5 px-2 font-mono font-bold text-foreground">{slug.keyword}</td>
      <td className="py-1.5 px-2">
        <div className="flex gap-1.5 items-center">
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} step="100"
            className="w-24 bg-secondary text-foreground text-xs font-mono border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary" />
          {parseFloat(price) !== slug.price && (
            <button onClick={() => onUpdate({ price: parseFloat(price) || 0 })} className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-[10px] font-bold">OK</button>
          )}
        </div>
      </td>
      <td className="py-1.5 px-2 text-center">
        <button onClick={() => onUpdate({ active: !slug.active })} className={slug.active ? "text-[hsl(var(--ticker-up))]" : "text-muted-foreground"}>
          {slug.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
        </button>
      </td>
      <td className="py-1.5 px-2 text-center">
        {slug.sold_to ? (
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">Vendido</span>
        ) : (
          <span className="text-[10px] text-muted-foreground">—</span>
        )}
      </td>
      <td className="py-1.5 px-2 text-center">
        <button onClick={onDelete} className="text-destructive hover:text-destructive/80">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
};

export default AdminPremiumSlugs;
