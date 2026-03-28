import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

// ── Busca o mini site do usuário logado ──────────────────────
export function useMySite() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-mini-site", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("mini_sites")
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

// ── Busca mini site público por slug ─────────────────────────
export function usePublicSite(slug: string) {
  return useQuery({
    queryKey: ["public-site", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mini_sites")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Site não encontrado");
      return data;
    },
    enabled: !!slug,
    staleTime: 0,
  });
}

// ── Links do mini site ────────────────────────────────────────
export function useSiteLinks(siteId: string | undefined) {
  return useQuery({
    queryKey: ["site-links", siteId],
    queryFn: async () => {
      const { data } = await supabase
        .from("mini_site_links")
        .select("*")
        .eq("site_id", siteId!)
        .order("sort_order");
      return data || [];
    },
    enabled: !!siteId,
  });
}

// ── Vídeos do mini site ───────────────────────────────────────
export function useSiteVideos(siteId: string | undefined) {
  return useQuery({
    queryKey: ["site-videos", siteId],
    queryFn: async () => {
      const { data } = await supabase
        .from("mini_site_videos")
        .select("*")
        .eq("site_id", siteId!)
        .order("sort_order");
      return data || [];
    },
    enabled: !!siteId,
  });
}

// ── Salvar / Criar mini site ──────────────────────────────────
export function useUpsertSite() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: Record<string, any>) => {
      if (!user?.id) throw new Error("Faça login primeiro");

      // Remove user_id dos values para o upsert não conflitar
      const { user_id: _uid, ...cleanValues } = values;

      // Busca site existente do usuário
      const { data: existing } = await supabase
        .from("mini_sites")
        .select("id, slug")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        // UPDATE site existente
        const { error } = await supabase
          .from("mini_sites")
          .update({ ...cleanValues, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
          .eq("user_id", user.id);

        if (error) throw new Error("Erro ao salvar: " + error.message);
        return { id: existing.id, slug: cleanValues.slug || existing.slug };
      } else {
        // INSERT novo site — slug único
        const base = (cleanValues.slug || user.email?.split("@")[0] || "user")
          .toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
        const slug = base + user.id.slice(0, 6);

        const { data, error } = await supabase
          .from("mini_sites")
          .insert({ ...cleanValues, user_id: user.id, slug })
          .select("id, slug")
          .single();

        if (error) throw new Error("Erro ao criar: " + error.message);
        return data;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-mini-site"] });
    },
    onError: (e: any) => {
      console.error("[upsertSite]", e);
    },
  });
}

// ── Links CRUD ────────────────────────────────────────────────
export function useAddSiteLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (link: { site_id: string; title: string; url: string; icon?: string }) => {
      const { error } = await supabase.from("mini_site_links").insert({
        ...link,
        icon: link.icon || "link",
        sort_order: Date.now(),
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-links"] }),
  });
}

export function useDeleteSiteLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mini_site_links").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-links"] }),
  });
}

// ── Vídeos CRUD ───────────────────────────────────────────────
export function useAddSiteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (video: Record<string, any>) => {
      const { error } = await supabase.from("mini_site_videos").insert(video);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-videos"] }),
  });
}

export function useDeleteSiteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mini_site_videos").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-videos"] }),
  });
}

export function useUpdateSiteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: Record<string, any>) => {
      const { error } = await supabase.from("mini_site_videos").update(values).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-videos"] }),
  });
}

// ── NFT buy ───────────────────────────────────────────────────
export function useBuyNft() {
  return useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase.from("nft_purchases").insert({
        video_id: videoId,
        views_used: 0,
        max_views: 1,
      } as any);
      if (error) throw new Error(error.message);
    },
  });
}

// ── My collections ────────────────────────────────────────────
export function useMyCollections() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-collections", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("nft_collections")
        .select("*")
        .eq("creator_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });
}

export function useLaunchCollection() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: Record<string, any>) => {
      const { error } = await supabase.from("nft_collections").insert({
        ...values,
        creator_id: user!.id,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-collections"] }),
  });
}

// ── NFT Marketplace hooks (used by Marketplace.tsx) ──────────

export function useAllNftListings() {
  return useQuery({
    queryKey: ["nft-listings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("nft_listings" as any)
        .select("*, mini_site_videos(*), profiles(username, avatar_url)")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      return (data || []) as any[];
    },
  });
}

export function useMyNfts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-nfts", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("nft_purchases")
        .select("*, mini_site_videos(*)")
        .eq("buyer_id", user!.id)
        .order("created_at", { ascending: false });
      return (data || []) as any[];
    },
    enabled: !!user?.id,
  });
}

export function useBuyNftFromListing() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (listingId: string) => {
      const { data: listing } = await supabase
        .from("nft_listings" as any)
        .select("*")
        .eq("id", listingId)
        .single();
      if (!listing) throw new Error("Listing não encontrado");
      const { error } = await supabase.from("nft_purchases").insert({
        buyer_id: user!.id,
        video_id: (listing as any).video_id,
        price_paid: (listing as any).price,
        max_views: (listing as any).max_views || 1,
        views_used: 0,
      } as any);
      if (error) throw new Error(error.message);
      await supabase.from("nft_listings" as any).update({ status: "sold" } as any).eq("id", listingId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nft-listings"] });
      qc.invalidateQueries({ queryKey: ["my-nfts"] });
    },
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: { video_id: string; price: number; max_views: number }) => {
      const { error } = await supabase.from("nft_listings" as any).insert({
        ...values,
        seller_id: user!.id,
        status: "active",
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nft-listings"] }),
  });
}

export function useCancelListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("nft_listings" as any)
        .update({ status: "cancelled" } as any)
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nft-listings"] }),
  });
}

export function useRechargeNft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, views }: { id: string; views: number }) => {
      const { error } = await supabase
        .from("nft_purchases")
        .update({ views_used: 0, max_views: views } as any)
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-nfts"] }),
  });
}
