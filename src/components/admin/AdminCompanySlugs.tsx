import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Building2, Plus, Trash2, Gavel } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function AdminCompanySlugs() {
  const qc = useQueryClient();
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [saleType, setSaleType] = useState<"direct" | "auction">("direct");
  const [displayName, setDisplayName] = useState("");

  const { data: slugs } = useQuery({
    queryKey: ["admin-company-slugs"],
    queryFn: async () => {
      const { data } = await supabase.from("company_slugs").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const val = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (!val) throw new Error("Invalid slug");
      const { error } = await supabase.from("company_slugs").insert({
        slug: val,
        price: parseFloat(price) || 0,
        sale_type: saleType,
        display_name: displayName || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-company-slugs"] });
      setSlug(""); setPrice(""); setDisplayName("");
      toast({ title: "Company slug created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("company_slugs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-company-slugs"] });
      toast({ title: "Deleted" });
    },
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-black flex items-center gap-2">
        <Building2 className="w-5 h-5 text-accent" /> Company Slugs (@)
      </h3>
      <p className="text-xs text-muted-foreground">
        Admin-only creation. Sell via direct purchase or auction. Route: /@slug
      </p>

      {/* Create */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h4 className="text-sm font-bold">Add Company Slug</h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input placeholder="@slug (e.g. apple)" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <Input placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Input placeholder="Price ($)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          <select value={saleType} onChange={(e) => setSaleType(e.target.value as any)}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-card">
            <option value="direct">Direct Sale</option>
            <option value="auction">Auction</option>
          </select>
        </div>
        <Button onClick={() => create.mutate()} disabled={!slug.trim() || create.isPending} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Create
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {(slugs || []).map((s: any) => (
          <div key={s.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono font-black text-accent">@{s.slug}</span>
              {s.display_name && <span className="text-xs text-muted-foreground">{s.display_name}</span>}
              <span className="text-sm font-bold text-foreground">${s.price?.toLocaleString()}</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {s.sale_type === "auction" ? <><Gavel className="w-3 h-3 inline mr-1" />Auction</> : "Direct"}
              </span>
              {s.sold_to && <span className="text-[10px] font-bold text-green-500">SOLD</span>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => remove.mutate(s.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
        {(slugs || []).length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No company slugs created yet</p>
        )}
      </div>
    </div>
  );
}
