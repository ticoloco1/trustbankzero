import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Globe, Crown, RefreshCw, Tag, Calendar, AlertTriangle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

const RENEWAL_FEE = 12.90;

export default function DashboardSlugs() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [renewConfirm, setRenewConfirm] = useState<any>(null);

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["dashboard-slugs", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("slug_registrations")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: myListings } = useQuery({
    queryKey: ["dashboard-slug-listings", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("slug_listings")
        .select("id, slug, price, status")
        .eq("seller_id", user!.id)
        .eq("status", "active");
      return data || [];
    },
    enabled: !!user,
  });

  const renewSlug = useMutation({
    mutationFn: async (reg: any) => {
      const newExpiry = new Date(reg.expires_at);
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);

      const { error } = await supabase.from("slug_registrations").update({
        expires_at: newExpiry.toISOString(),
        renewed_at: new Date().toISOString(),
        status: "active",
        renewal_fee: RENEWAL_FEE,
      } as any).eq("id", reg.id);
      if (error) throw error;

      if (reg.site_id) {
        await supabase.from("mini_sites").update({
          slug_expires_at: newExpiry.toISOString(),
        } as any).eq("id", reg.site_id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard-slugs"] });
      toast.success("Slug renovado por mais 1 ano!");
      setRenewConfirm(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const activeCount = (registrations || []).filter((r: any) => r.status === "active").length;
  const expiredCount = (registrations || []).filter((r: any) => new Date(r.expires_at) < new Date()).length;
  const listedCount = (myListings || []).length;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-card-foreground uppercase flex items-center gap-2">
          <Crown className="w-4 h-4 text-accent" />
          Meus Slugs
        </h2>
        <Link to="/slugs" className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1">
          Marketplace <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <p className="text-xl font-black text-foreground">{activeCount}</p>
          <p className="text-[9px] text-muted-foreground font-bold uppercase">Ativos</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <p className="text-xl font-black text-destructive">{expiredCount}</p>
          <p className="text-[9px] text-muted-foreground font-bold uppercase">Expirados</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <p className="text-xl font-black text-primary">{listedCount}</p>
          <p className="text-[9px] text-muted-foreground font-bold uppercase">À Venda</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground text-center py-4">Carregando...</p>
      ) : !(registrations || []).length ? (
        <div className="text-center py-6">
          <p className="text-xs text-muted-foreground mb-2">Você não tem slugs registrados</p>
          <Link to="/slugs" className="text-xs font-bold text-accent hover:underline">
            Registre seu primeiro slug →
          </Link>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {(registrations || []).map((reg: any) => {
            const expiresAt = new Date(reg.expires_at);
            const isExpired = expiresAt < new Date();
            const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const isExpiring = daysLeft <= 30 && daysLeft > 0;
            const isListed = (myListings || []).some((l: any) => l.slug === reg.slug);

            return (
              <div key={reg.id} className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${
                isExpired ? "border-destructive/30 bg-destructive/5" : isExpiring ? "border-accent/30 bg-accent/5" : "border-border bg-secondary/30"
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <Globe className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black text-foreground font-mono truncate">/{reg.slug}</p>
                      {reg.slug_type === "premium" && <Badge className="text-[7px] bg-accent text-accent-foreground px-1 py-0">Premium</Badge>}
                      {isListed && <Badge variant="outline" className="text-[7px] px-1 py-0">À venda</Badge>}
                    </div>
                    <p className={`text-[9px] ${isExpired ? "text-destructive font-bold" : isExpiring ? "text-accent" : "text-muted-foreground"}`}>
                      {isExpired ? "Expirado" : isExpiring ? `${daysLeft}d restantes` : expiresAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {(isExpired || isExpiring) && (
                  <button
                    onClick={() => setRenewConfirm(reg)}
                    className="shrink-0 px-2.5 py-1.5 bg-primary text-primary-foreground rounded text-[10px] font-bold hover:bg-primary/90 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> ${RENEWAL_FEE}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Renew confirmation */}
      <AlertDialog open={!!renewConfirm} onOpenChange={o => !o && setRenewConfirm(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" /> Renovar Slug
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>Slug: <strong className="font-mono">/{renewConfirm?.slug}</strong></p>
                <p>Taxa: <strong className="text-primary">${RENEWAL_FEE}/ano</strong></p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => renewSlug.mutate(renewConfirm)} className="bg-primary text-primary-foreground">
              Renovar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
