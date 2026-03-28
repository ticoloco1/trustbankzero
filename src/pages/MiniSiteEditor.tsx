import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import {
  useMySite, useSiteLinks, useSiteVideos, useUpsertSite,
  useAddSiteLink, useDeleteSiteLink, useAddSiteVideo, useDeleteSiteVideo, useUpdateSiteVideo
} from "@/hooks/useMiniSite";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import CvEditor from "@/components/CvEditor";
import ModuleDragDrop from "@/components/ModuleDragDrop";
import {
  Globe, Link2, Plus, Trash2, Eye, Upload, Camera,
  LayoutGrid, Columns2, Columns3, Save, Youtube, ShieldCheck, Gem, RefreshCw,
  Palette, Lock, Layers, DollarSign, Image, MapPin, Type
} from "lucide-react";
import SocialLinkPicker, { SOCIAL_NETWORKS } from "@/components/SocialLinkPicker";
import ClassifiedForm from "@/components/ClassifiedForm";
import { useCart } from "@/store/useCart";
import TemplatePickerGrid from "@/components/TemplatePickerGrid";
import { getTemplate, type MiniSiteTemplate } from "@/data/miniSiteTemplates";
import { useMyCollections, useLaunchCollection } from "@/hooks/useCollections";

const VIEW_TIERS = [
  { value: 1, label: "1 view" },
  { value: 5, label: "5 views" },
  { value: 20, label: "20 views" },
];

const THEMES = [
  { id: "white", label: "Branco", colors: "bg-white", accent: "#2563eb", dark: false },
  { id: "beige", label: "Bege", colors: "bg-amber-50", accent: "#b45309", dark: false },
  { id: "rose", label: "Rosa", colors: "bg-rose-50", accent: "#e11d48", dark: false },
  { id: "mint", label: "Menta", colors: "bg-emerald-50", accent: "#059669", dark: false },
  { id: "lavender", label: "Lavanda", colors: "bg-violet-50", accent: "#7c3aed", dark: false },
  { id: "sky", label: "Céu", colors: "bg-sky-50", accent: "#0284c7", dark: false },
  { id: "cream", label: "Creme", colors: "bg-orange-50", accent: "#ea580c", dark: false },
  { id: "pearl", label: "Pérola", colors: "bg-gray-50", accent: "#4b5563", dark: false },
  { id: "lemon", label: "Limão", colors: "bg-yellow-50", accent: "#ca8a04", dark: false },
  { id: "peach", label: "Pêssego", colors: "bg-red-50", accent: "#dc2626", dark: false },
  { id: "cosmic", label: "Cosmic", colors: "from-purple-900 via-indigo-900 to-violet-800", accent: "#a855f7", dark: true },
  { id: "ocean", label: "Ocean", colors: "from-blue-900 via-cyan-900 to-teal-800", accent: "#06b6d4", dark: true },
  { id: "forest", label: "Forest", colors: "from-emerald-900 via-green-900 to-teal-900", accent: "#10b981", dark: true },
  { id: "sunset", label: "Sunset", colors: "from-orange-900 via-amber-900 to-yellow-800", accent: "#f59e0b", dark: true },
  { id: "midnight", label: "Midnight", colors: "from-slate-900 via-gray-900 to-zinc-900", accent: "#64748b", dark: true },
  { id: "neon", label: "Neon", colors: "from-fuchsia-900 via-pink-900 to-rose-900", accent: "#f472b6", dark: true },
  { id: "cyber", label: "Cyber", colors: "from-cyan-900 via-blue-900 to-indigo-900", accent: "#22d3ee", dark: true },
  { id: "ember", label: "Ember", colors: "from-red-900 via-orange-900 to-amber-900", accent: "#ef4444", dark: true },
  { id: "aurora", label: "Aurora", colors: "from-teal-900 via-emerald-900 to-cyan-900", accent: "#2dd4bf", dark: true },
  { id: "noir", label: "Noir", colors: "from-neutral-950 via-neutral-900 to-neutral-800", accent: "#a3a3a3", dark: true },
];

const TEXT_COLOR_PRESETS_DARK = [
  { id: "black", label: "Preto", color: "#000000" },
  { id: "gray-950", label: "Quase Preto", color: "#0a0a0a" },
  { id: "gray-900", label: "Cinza 900", color: "#171717" },
  { id: "gray-800", label: "Cinza 800", color: "#1f2937" },
  { id: "gray-700", label: "Cinza 700", color: "#374151" },
  { id: "gray-600", label: "Cinza 600", color: "#4b5563" },
  { id: "blue-950", label: "Azul Escuro", color: "#0c1a3a" },
  { id: "blue-900", label: "Azul 900", color: "#1e3a5f" },
  { id: "indigo-950", label: "Índigo Escuro", color: "#1a1545" },
  { id: "navy", label: "Marinho", color: "#1e1b4b" },
  { id: "brown-900", label: "Marrom Escuro", color: "#451a03" },
  { id: "brown", label: "Marrom", color: "#78350f" },
  { id: "green-900", label: "Verde Escuro", color: "#14532d" },
  { id: "red-900", label: "Vermelho Escuro", color: "#7f1d1d" },
  { id: "purple-900", label: "Roxo Escuro", color: "#3b0764" },
];

const TEXT_COLOR_PRESETS_LIGHT = [
  { id: "white", label: "Branco", color: "#FFFFFF" },
  { id: "gray-100", label: "Cinza 100", color: "#f3f4f6" },
  { id: "gray-200", label: "Cinza 200", color: "#e5e7eb" },
  { id: "gray-300", label: "Cinza 300", color: "#d1d5db" },
  { id: "gray-400", label: "Cinza 400", color: "#9ca3af" },
  { id: "yellow", label: "Amarelo", color: "#fbbf24" },
  { id: "amber", label: "Âmbar", color: "#f59e0b" },
  { id: "orange", label: "Laranja", color: "#fb923c" },
  { id: "lime", label: "Lima", color: "#a3e635" },
  { id: "cyan-light", label: "Ciano", color: "#67e8f9" },
  { id: "sky-light", label: "Céu", color: "#7dd3fc" },
  { id: "pink-light", label: "Pink", color: "#f9a8d4" },
  { id: "rose-light", label: "Rosa", color: "#fda4af" },
  { id: "green-light", label: "Verde", color: "#86efac" },
  { id: "violet-light", label: "Violeta", color: "#c4b5fd" },
];

const TEXT_COLOR_PRESETS_MID = [
  { id: "blue-600", label: "Azul", color: "#2563eb" },
  { id: "indigo", label: "Índigo", color: "#4f46e5" },
  { id: "purple", label: "Roxo", color: "#7c3aed" },
  { id: "pink", label: "Pink", color: "#ec4899" },
  { id: "red", label: "Vermelho", color: "#dc2626" },
  { id: "orange-mid", label: "Laranja", color: "#ea580c" },
  { id: "amber-mid", label: "Âmbar", color: "#d97706" },
  { id: "green-600", label: "Verde", color: "#16a34a" },
  { id: "teal", label: "Teal", color: "#0d9488" },
  { id: "cyan-mid", label: "Ciano", color: "#0891b2" },
];

const FONT_SIZES = [
  { id: "sm", label: "P", desc: "Pequeno" },
  { id: "md", label: "M", desc: "Médio" },
  { id: "lg", label: "G", desc: "Grande" },
  { id: "xl", label: "GG", desc: "Extra Grande" },
];

const PHOTO_SHAPES = [
  { id: "round", label: "Redonda" },
  { id: "square", label: "Quadrada" },
  { id: "rounded", label: "Arredondada" },
];

const PHOTO_SIZES = [
  { id: "sm", label: "P", px: "w-16 h-16" },
  { id: "md", label: "M", px: "w-24 h-24" },
  { id: "lg", label: "G", px: "w-32 h-32" },
  { id: "xl", label: "GG", px: "w-40 h-40" },
];

const MODULES = [
  { id: "feed", label: "Feed / Posts", icon: "📝" },
  { id: "links", label: "Links & Social", icon: "🔗" },
  { id: "videos", label: "Vídeos", icon: "🎬" },
  { id: "presentation", label: "Vídeo Apresentação", icon: "📺" },
  { id: "map", label: "Mapa", icon: "📍" },
];

const getThemeClasses = (themeId: string) => {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  return theme;
};

const MiniSiteEditor = () => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const { addItem: addToCart, items: cartItems, open: openCart, isOpen: cartOpen, close: closeCart } = useCart();
  const { data: site, isLoading } = useMySite();
  const { data: links } = useSiteLinks(site?.id);
  const { data: videos } = useSiteVideos(site?.id);
  const upsertSite = useUpsertSite();
  const addLink = useAddSiteLink();
  const deleteLink = useDeleteSiteLink();
  const addVideo = useAddSiteVideo();
  const deleteVideo = useDeleteSiteVideo();
  const updateVideo = useUpdateSiteVideo();
  const { data: myCollections } = useMyCollections();
  const launchCollection = useLaunchCollection();

  const [siteName, setSiteName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [layoutCols, setLayoutCols] = useState(2);
  const [showCv, setShowCv] = useState(false);
  const [cvContent, setCvContent] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("cosmic");
  const [templateId, setTemplateId] = useState("blank");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPrice, setContactPrice] = useState("20");
  const [cvHeadline, setCvHeadline] = useState("");
  const [cvLocation, setCvLocation] = useState("");
  const [cvSkills, setCvSkills] = useState<string[]>([]);
  const [cvExperience, setCvExperience] = useState<any[]>([]);
  const [cvEducation, setCvEducation] = useState<any[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [bannerUrl, setBannerUrl] = useState("");
  const [fontSize, setFontSize] = useState("md");
  const [photoShape, setPhotoShape] = useState("round");
  const [photoSize, setPhotoSize] = useState("md");
  const [textColor, setTextColor] = useState("");
  const [bgImageUrl, setBgImageUrl] = useState("");
  const [presentationVideoUrl, setPresentationVideoUrl] = useState("");
  const [moduleOrder, setModuleOrder] = useState<string[]>(["feed", "links", "videos", "presentation", "map"]);

  const [linkTitle, setLinkTitle] = useState("");
  const [published, setPublished] = useState(false);
  const [showImoveisForm, setShowImoveisForm] = useState(false);
  const [showCarrosForm, setShowCarrosForm] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const [ytUrl, setYtUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [nftEnabled, setNftEnabled] = useState(false);
  const [nftPrice, setNftPrice] = useState("1.00");
  const [nftMaxViews, setNftMaxViews] = useState("1");
  const [nftMaxEditions, setNftMaxEditions] = useState("");
  const [rechargeEnabled, setRechargeEnabled] = useState(false);
  const [rechargePrice, setRechargePrice] = useState("0.50");
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [paywallEnabled, setPaywallEnabled] = useState(false);
  const [paywallPrice, setPaywallPrice] = useState("0.15");

  useEffect(() => {
    if (site) {
      setSiteName(site.site_name || "");
      setSlug(site.slug || "");
      setBio(site.bio || "");
      setPublished(site.published ?? false);
      setLayoutCols(site.layout_columns || 2);
      setShowCv(site.show_cv || false);
      setCvContent(site.cv_content || "");
      setSelectedTheme(site.theme || "cosmic");
      setTemplateId((site as any).template_id || "blank");
      setContactEmail((site as any).contact_email || "");
      setContactPhone((site as any).contact_phone || "");
      setContactPrice(String((site as any).contact_price ?? 20));
      setCvHeadline((site as any).cv_headline || "");
      setCvLocation((site as any).cv_location || "");
      setCvSkills((site as any).cv_skills || []);
      setCvExperience((site as any).cv_experience || []);
      setCvEducation((site as any).cv_education || []);
      setAvatarUrl(site.avatar_url || "");
      setFontSize((site as any).font_size || "md");
      setPhotoShape((site as any).photo_shape || "round");
      setPhotoSize((site as any).photo_size || "md");
      setTextColor((site as any).text_color || "");
      setBgImageUrl((site as any).bg_image_url || "");
      setBannerUrl(site.banner_url || "");
      setPresentationVideoUrl((site as any).presentation_video_url || "");
      const savedOrder = (site as any).module_order;
      if (Array.isArray(savedOrder) && savedOrder.length > 0) {
        setModuleOrder(savedOrder);
      }
    }
  }, [site]);

  // Auto-create site for new users so links work immediately
  useEffect(() => {
    if (!isLoading && !site && user && !upsertSite.isPending) {
      const defaultSlug = (user.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9]/g, "") || "user") + "-" + user.id.slice(0, 6);
      upsertSite.mutate({
        site_name: user.user_metadata?.full_name || "Meu Site",
        slug: defaultSlug,
        bio: "",
        published: false,
        layout_columns: 2,
      });
    }
  }, [isLoading, site?.id, user?.id]);

  if (loading || isLoading) return <div className="min-h-screen bg-background"><Header /><div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Carregando...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const PREMIUM_SLUG_TIERS = [
    { maxLen: 1, price: 5000 },
    { maxLen: 2, price: 3500 },
    { maxLen: 3, price: 3000 },
    { maxLen: 4, price: 1500 },
    { maxLen: 5, price: 500 },
    { maxLen: 6, price: 150 },
  ];

  const getSlugPrice = (s: string) => {
    const tier = PREMIUM_SLUG_TIERS.find(t => s.length <= t.maxLen);
    return tier?.price || 0;
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    return match?.[1] || url;
  };

  const handleSaveSite = async () => {
    const typedSlug = slug || user.email?.split("@")[0] || "";
    const price = getSlugPrice(typedSlug);
    
    // Se slug tem custo e é diferente do atual → adiciona ao carrinho
    // mas salva com o slug ATUAL (não o novo premium)
    const slugToSave = (price > 0 && typedSlug !== site?.slug)
      ? (site?.slug || user.email?.split("@")[0] || "meusite")
      : typedSlug;
      
    if (price > 0 && typedSlug !== site?.slug) {
      addToCart({ id: `slug_${typedSlug}`, type: "slug_standard", label: `Slug /@${typedSlug}`, price });
      toast.info(`Slug "/${typedSlug}" adicionado ao carrinho. Pague para ativar. Salvando outros dados...`);
    }
    try {
      await upsertSite.mutateAsync({
        site_name: siteName,
        slug: slugToSave,
        bio,
        published,
        layout_columns: layoutCols,
        show_cv: showCv,
        cv_content: cvContent,
        theme: selectedTheme,
        template_id: templateId,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        contact_price: parseFloat(contactPrice) || 20,
        cv_headline: cvHeadline,
        cv_location: cvLocation,
        cv_skills: cvSkills,
        cv_experience: cvExperience,
        cv_education: cvEducation,
        avatar_url: avatarUrl || null,
        font_size: fontSize,
        photo_shape: photoShape,
        photo_size: photoSize,
        text_color: textColor || null,
        bg_image_url: bgImageUrl || null,
        banner_url: bannerUrl || null,
        presentation_video_url: presentationVideoUrl || null,
        module_order: moduleOrder,
      });
      toast.success("✅ Site salvo com sucesso!");
    } catch (e: any) {
      console.error("Save error:", e);
      toast.error("Erro ao salvar: " + (e?.message || JSON.stringify(e)));
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const ts = Date.now();
      const path = `${user!.id}/avatar-${ts}.${ext}`;
      // Remove old avatar if exists
      const { data: oldFiles } = await supabase.storage.from("platform-assets").list(user!.id, { search: "avatar-" });
      if (oldFiles && oldFiles.length > 0) {
        await supabase.storage.from("platform-assets").remove(oldFiles.map(f => `${user!.id}/${f.name}`));
      }
      const { error } = await supabase.storage.from("platform-assets").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("platform-assets").getPublicUrl(path);
      const newUrl = `${data.publicUrl}?t=${ts}`;
      setAvatarUrl(newUrl);
      // Also save avatar_url to profile for public visibility
      await supabase.from("profiles").update({ avatar_url: newUrl }).eq("user_id", user!.id);
      toast.success("Avatar uploaded!");
    } catch (e: any) { toast.error(e.message); }
    setUploadingAvatar(false);
  };

  const handleBannerUpload = async (file: File) => {
    setUploadingBanner(true);
    try {
      const ext = file.name.split(".").pop();
      const ts = Date.now();
      const path = `${user!.id}/banner-${ts}.${ext}`;
      const { error } = await supabase.storage.from("platform-assets").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("platform-assets").getPublicUrl(path);
      setBannerUrl(`${data.publicUrl}?t=${ts}`);
      toast.success("Banner uploaded!");
    } catch (e: any) { toast.error(e.message); }
    setUploadingBanner(false);
  };

  const handleBgUpload = async (file: File) => {
    setUploadingBg(true);
    try {
      const ext = file.name.split(".").pop();
      const ts = Date.now();
      const path = `${user!.id}/bg-${ts}.${ext}`;
      const { error } = await supabase.storage.from("platform-assets").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("platform-assets").getPublicUrl(path);
      setBgImageUrl(`${data.publicUrl}?t=${ts}`);
      toast.success("Background uploaded!");
    } catch (e: any) { toast.error(e.message); }
    setUploadingBg(false);
  };

  const uploadPreview = async (file: File, ytId: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/${ytId}-preview.${ext}`;
    const { error } = await supabase.storage.from("video-previews").upload(path, file, { upsert: true });
    if (error) { toast.error("Preview upload failed: " + error.message); return null; }
    const { data } = supabase.storage.from("video-previews").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAddVideo = async () => {
    if (!site?.id || !ytUrl) return;
    const ytId = extractYouTubeId(ytUrl);
    let previewUrl: string | undefined;
    if (previewFile) { const url = await uploadPreview(previewFile, ytId); if (url) previewUrl = url; }
    try {
      await addVideo.mutateAsync({
        site_id: site.id, youtube_video_id: ytId, title: videoTitle || `Video ${ytId}`,
        thumbnail_url: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        nft_enabled: nftEnabled, nft_price: nftEnabled ? (parseFloat(nftPrice) || 1) : 0,
        nft_max_views: parseInt(nftMaxViews) || 1,
        nft_max_editions: nftMaxEditions ? parseInt(nftMaxEditions) : undefined,
        preview_url: previewUrl, recharge_enabled: rechargeEnabled,
        recharge_price: rechargeEnabled ? (parseFloat(rechargePrice) || 0) : 0,
        view_tier: parseInt(nftMaxViews) || 1,
        paywall_enabled: paywallEnabled,
        paywall_price: paywallEnabled ? (parseFloat(paywallPrice) || 0.15) : 0,
      });
      setYtUrl(""); setVideoTitle(""); setNftEnabled(false); setNftPrice("1.00");
      setNftMaxViews("1"); setNftMaxEditions(""); setPreviewFile(null);
      setRechargeEnabled(false); setRechargePrice("0.50");
      setPaywallEnabled(false); setPaywallPrice("0.15");
      toast.success("Video added!");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleAddLink = async (title?: string, url?: string, icon?: string) => {
    const t = title || linkTitle;
    const u = url || linkUrl;
    if (!site?.id || !t || !u) return;
    try {
      await addLink.mutateAsync({ site_id: site.id, title: t, url: u, icon: icon || "link" });
      if (!title) { setLinkTitle(""); setLinkUrl(""); }
      toast.success("Link added!");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/site/edit`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) toast.error("Google sign-in failed: " + error.message);
  };

  const publicUrl = `${window.location.origin}/s/${site?.slug || slug || "preview"}`;
  const currentTheme = getThemeClasses(selectedTheme);

  return (
    <>
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-black text-foreground">Editor de Mini Site</h1>
          </div>
          <div className="flex items-center gap-3">
            <a href={publicUrl} target="_blank" className="flex items-center gap-1.5 text-xs text-primary hover:underline">
              <Eye className="w-3.5 h-3.5" /> Preview
            </a>
            <a href="/marketplace" className="flex items-center gap-1.5 text-xs text-accent hover:underline">
              <Gem className="w-3.5 h-3.5" /> Marketplace
            </a>
            <button onClick={handleSaveSite} disabled={upsertSite.isPending} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 disabled:opacity-60">
              <Save className="w-4 h-4" /> {upsertSite.isPending ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={async () => {
                if (published && site?.slug) {
                  window.open(`${window.location.origin}/s/${site.slug}`, "_blank");
                  return;
                }
                // Salva primeiro
                const typedSlug2 = slug || user.email?.split("@")[0] || "meusite";
                const sp2 = getSlugPrice(typedSlug2);
                const finalSlug = (sp2 > 0 && typedSlug2 !== site?.slug) ? (site?.slug || typedSlug2) : typedSlug2;
                try {
                  await upsertSite.mutateAsync({ site_name: siteName, slug: finalSlug, bio, published: false, layout_columns: layoutCols, show_cv: showCv, cv_content: cvContent, theme: selectedTheme, template_id: templateId, contact_email: contactEmail, contact_phone: contactPhone, contact_price: parseFloat(contactPrice)||20, cv_headline: cvHeadline, cv_location: cvLocation, cv_skills: cvSkills, cv_experience: cvExperience, cv_education: cvEducation, avatar_url: avatarUrl||null, font_size: fontSize, photo_shape: photoShape, photo_size: photoSize, text_color: textColor||null, bg_image_url: bgImageUrl||null, banner_url: bannerUrl||null, presentation_video_url: presentationVideoUrl||null, module_order: moduleOrder });
                } catch(e:any){ toast.error("Erro ao salvar: " + (e?.message||"")); return; }
                // Adiciona plano ao carrinho e abre
                addToCart({ id: "plan_pro", type: "subscription_monthly", label: "Plano Pro — Publicar mini site online", price: 29.90 });
                if (sp2 > 0 && typedSlug2 !== site?.slug) {
                  addToCart({ id: `slug_${typedSlug2}`, type: "slug_standard", label: `Slug /@${typedSlug2}`, price: sp2 });
                }
                openCart();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black text-white"
              style={{ background: published ? "#059669" : "#f59e0b" }}
            >
              {published ? "🟢 Ver Site" : "💳 Publicar"}
            </button>
          </div>
        </div>

        {/* Template Picker */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 mb-6">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4" /> Escolha um Template
          </h2>
          <TemplatePickerGrid
            selectedId={templateId}
            onSelect={(tpl: MiniSiteTemplate) => {
              setTemplateId(tpl.id);
              setSelectedTheme(tpl.theme);
              setLayoutCols(tpl.layoutColumns);
              setShowCv(tpl.showCv);
              toast.success(`Template "${tpl.name}" aplicado!`);
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Editor panels */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" /> Perfil
              </h2>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Username (URL)</label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{window.location.origin}/s/</span>
                  <Input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="seuusername" />
                </div>
                {slug && slug.length <= 4 && slug !== site?.slug && (
                  <p className="text-[11px] text-destructive font-bold mt-1">
                    ⚡ Premium slug ({slug.length} letter{slug.length > 1 ? "s" : ""}) — ${getSlugPrice(slug).toLocaleString()}. Use 5+ characters for free.
                  </p>
                )}
              </div>
              {/* Avatar Upload */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1"><Camera className="w-3 h-3" /> Foto de Perfil</label>
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="w-14 h-14 rounded-full object-cover border-2 border-primary" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-2xl font-black text-muted-foreground border-2 border-border">
                      {siteName?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div>
                    <Input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }} className="text-xs w-48" disabled={uploadingAvatar} />
                    {uploadingAvatar && <p className="text-[10px] text-accent animate-pulse">Enviando...</p>}
                  </div>
                </div>
              </div>

              {/* Banner de capa ponta a ponta */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  🖼️ Banner de Capa (ponta a ponta)
                </p>
                {bannerUrl ? (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-border">
                    <img src={bannerUrl} alt="banner" className="w-full h-full object-cover" />
                    <button onClick={() => setBannerUrl("")} className="absolute top-1 right-1 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer w-fit px-3 py-1.5 bg-secondary rounded-lg border border-border text-xs font-bold hover:bg-secondary/70">
                    {uploadingBanner ? "Enviando..." : "📁 Upload banner"}
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingBanner}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleBannerUpload(f); }} />
                  </label>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Nome de Exibição</label>
                <Input value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="Seu Nome" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Bio</label>
                <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} />
              </div>
            </div>

            {/* Theme & Appearance */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4" /> Aparência
              </h2>

              {/* Theme colors */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Cor de Fundo</p>
                <p className="text-[10px] text-muted-foreground">Claros</p>
                <div className="flex flex-wrap gap-2">
                  {THEMES.filter(t => !t.dark).map(theme => (
                    <button key={theme.id} onClick={() => setSelectedTheme(theme.id)}
                      className={`relative flex flex-col items-center gap-1 transition-all ${selectedTheme === theme.id ? "scale-105" : "opacity-70 hover:opacity-100"}`}>
                      <div className={`w-12 h-12 rounded-lg ${theme.colors} border-2 ${selectedTheme === theme.id ? "border-primary ring-2 ring-primary/30" : "border-border"} flex items-center justify-center shadow-sm`}>
                        {selectedTheme === theme.id && <span className="text-gray-800 text-sm">✓</span>}
                      </div>
                      <span className="text-[9px] font-bold text-foreground">{theme.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Escuros</p>
                <div className="flex flex-wrap gap-2">
                  {THEMES.filter(t => t.dark).map(theme => (
                    <button key={theme.id} onClick={() => setSelectedTheme(theme.id)}
                      className={`relative flex flex-col items-center gap-1 transition-all ${selectedTheme === theme.id ? "scale-105" : "opacity-70 hover:opacity-100"}`}>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${theme.colors} border-2 ${selectedTheme === theme.id ? "border-primary ring-2 ring-primary/30" : "border-border"} flex items-center justify-center`}>
                        {selectedTheme === theme.id && <span className="text-white text-sm">✓</span>}
                      </div>
                      <span className="text-[9px] font-bold text-foreground">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <Type className="w-3 h-3" /> Cor das Letras
                </p>
                {/* Auto */}
                <button
                  onClick={() => setTextColor("")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${textColor === "" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                >
                  Auto (baseado no tema)
                </button>
                {/* Escuras */}
                <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">🌑 Escuras (para fundos claros)</p>
                <div className="flex flex-wrap gap-1.5">
                  {TEXT_COLOR_PRESETS_DARK.map(preset => (
                    <button key={preset.id} onClick={() => setTextColor(preset.color)}
                      className={`relative flex flex-col items-center gap-0.5 transition-all ${textColor === preset.color ? "scale-110" : "opacity-70 hover:opacity-100"}`}>
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shadow-sm ${textColor === preset.color ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                        style={{ backgroundColor: preset.color, color: "#fff" }}>
                        {textColor === preset.color ? "✓" : "A"}
                      </div>
                      <span className="text-[7px] text-muted-foreground">{preset.label}</span>
                    </button>
                  ))}
                </div>
                {/* Claras */}
                <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">☀️ Claras (para fundos escuros)</p>
                <div className="flex flex-wrap gap-1.5">
                  {TEXT_COLOR_PRESETS_LIGHT.map(preset => (
                    <button key={preset.id} onClick={() => setTextColor(preset.color)}
                      className={`relative flex flex-col items-center gap-0.5 transition-all ${textColor === preset.color ? "scale-110" : "opacity-70 hover:opacity-100"}`}>
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shadow-sm ${textColor === preset.color ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                        style={{ backgroundColor: preset.color, color: "#333" }}>
                        {textColor === preset.color ? "✓" : "A"}
                      </div>
                      <span className="text-[7px] text-muted-foreground">{preset.label}</span>
                    </button>
                  ))}
                </div>
                {/* Médias */}
                <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">🎨 Cores Médias</p>
                <div className="flex flex-wrap gap-1.5">
                  {TEXT_COLOR_PRESETS_MID.map(preset => (
                    <button key={preset.id} onClick={() => setTextColor(preset.color)}
                      className={`relative flex flex-col items-center gap-0.5 transition-all ${textColor === preset.color ? "scale-110" : "opacity-70 hover:opacity-100"}`}>
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shadow-sm ${textColor === preset.color ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                        style={{ backgroundColor: preset.color, color: "#fff" }}>
                        {textColor === preset.color ? "✓" : "A"}
                      </div>
                      <span className="text-[7px] text-muted-foreground">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Image */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <Image className="w-3 h-3" /> Imagem de Fundo
                </p>
                <label className="flex items-center gap-2 cursor-pointer w-fit px-3 py-1.5 bg-secondary rounded-lg border border-border text-xs font-bold hover:bg-secondary/70">
                  {uploadingBg ? "Enviando..." : "📁 Upload imagem"}
                  <input type="file" accept="image/*" className="hidden" disabled={uploadingBg}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleBgUpload(f); }} />
                </label>
                {bgImageUrl && (
                  <div className="relative w-full h-20 rounded-lg overflow-hidden border border-border">
                    <img src={bgImageUrl} alt="bg preview" className="w-full h-full object-cover" />
                    <button onClick={() => setBgImageUrl("")} className="absolute top-1 right-1 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                  </div>
                )}
              </div>

              {/* Font size */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Tamanho das Letras</p>
                <div className="flex gap-2">
                  {FONT_SIZES.map(fs => (
                    <button key={fs.id} onClick={() => setFontSize(fs.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${fontSize === fs.id ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:border-primary/50"}`}>
                      {fs.label} <span className="text-[9px] font-normal">({fs.desc})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo shape */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Formato da Foto</p>
                <div className="flex gap-2">
                  {PHOTO_SHAPES.map(ps => (
                    <button key={ps.id} onClick={() => setPhotoShape(ps.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${photoShape === ps.id ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:border-primary/50"}`}>
                      <div className={`w-5 h-5 bg-current opacity-40 ${ps.id === "round" ? "rounded-full" : ps.id === "rounded" ? "rounded-md" : "rounded-none"}`} />
                      {ps.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo size */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Tamanho da Foto</p>
                <div className="flex gap-2">
                  {PHOTO_SIZES.map(ps => (
                    <button key={ps.id} onClick={() => setPhotoSize(ps.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${photoSize === ps.id ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:border-primary/50"}`}>
                      {ps.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Presentation Video */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Youtube className="w-4 h-4 text-destructive" /> Vídeo de Apresentação
              </h2>
              <p className="text-[10px] text-muted-foreground">Cole um link do YouTube para exibir um vídeo de apresentação aberto no seu site.</p>
              <Input
                value={presentationVideoUrl}
                onChange={e => setPresentationVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="text-xs"
              />
              {presentationVideoUrl && (
                <div className="aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-border">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(presentationVideoUrl)}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              )}
            </div>

            {/* Module Order (Drag & Drop) */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" /> Ordem dos Módulos (Arraste)
              </h2>
              <p className="text-[10px] text-muted-foreground">Arraste para reorganizar a ordem dos módulos no seu site público.</p>
              <ModuleDragDrop
                modules={MODULES}
                order={moduleOrder}
                onReorder={setModuleOrder}
              />
            </div>

            {/* Layout */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Video Layout</h2>
              <div className="flex gap-2">
                {[1, 2, 3].map(n => (
                  <button key={n} onClick={() => setLayoutCols(n)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${layoutCols === n ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:border-primary/50"}`}>
                    {n === 3 ? <Columns3 className="w-4 h-4" /> : <Columns2 className="w-4 h-4" />}
                    {n} {n === 1 ? "Column" : "Columns"}
                  </button>
                ))}
              </div>
            </div>

            {/* CV & Contact */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4" /> CV / Resume & Contact
              </h2>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground">Mostrar CV Expansível</label>
                <Switch checked={showCv} onCheckedChange={setShowCv} />
              </div>
              {showCv && (
                <CvEditor
                  cvContent={cvContent} setCvContent={setCvContent}
                  cvHeadline={cvHeadline} setCvHeadline={setCvHeadline}
                  cvLocation={cvLocation} setCvLocation={setCvLocation}
                  cvSkills={cvSkills} setCvSkills={setCvSkills}
                  cvExperience={cvExperience} setCvExperience={setCvExperience}
                  cvEducation={cvEducation} setCvEducation={setCvEducation}
                  contactEmail={contactEmail} setContactEmail={setContactEmail}
                  contactPhone={contactPhone} setContactPhone={setContactPhone}
                  contactPrice={contactPrice} setContactPrice={setContactPrice}
                />
              )}
            </div>

            {/* Videos */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Youtube className="w-4 h-4 text-destructive" /> Videos
              </h2>
              <div className="bg-secondary/50 border border-border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">YouTube URL or ID</label>
                    <Input value={ytUrl} onChange={e => setYtUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mt-1">
                      <p className="text-[10px] text-amber-600 font-bold">💡 Para proteger seu vídeo com paywall:</p>
                      <p className="text-[10px] text-amber-600/80 mt-0.5">No YouTube → Studio → vídeo → altere visibilidade para <strong>"Não listado"</strong>. O vídeo só aparecerá no seu mini site, não no YouTube.</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Title</label>
                    <Input value={videoTitle} onChange={e => setVideoTitle(e.target.value)} placeholder="Video title" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Upload className="w-3 h-3" /> Preview Clip (optional)</label>
                  <Input type="file" accept="video/*,.gif" onChange={e => setPreviewFile(e.target.files?.[0] || null)} className="text-xs" />
                  {previewFile && <p className="text-[10px] text-accent">{previewFile.name}</p>}
                </div>
                {/* Video Paywall */}
                <div className="flex items-center gap-3">
                  <Switch checked={paywallEnabled} onCheckedChange={c => { setPaywallEnabled(c); if (c) setNftEnabled(false); }} />
                  <span className="text-xs font-bold text-foreground flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-accent" /> Paywall de Vídeo (pagar para assistir)</span>
                </div>
                {paywallEnabled && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Price (USDC)</label>
                    <Input type="number" value={paywallPrice} onChange={e => setPaywallPrice(e.target.value)} min="0.10" step="0.01" className="w-32" />
                    <p className="text-[10px] text-muted-foreground italic">Access lasts 12 hours. Min $0.10 embed / $0.60 bunny.net. 60% Creator / 40% Platform.</p>
                  </div>
                )}
                {/* NFT Paywall */}
                <div className="flex items-center gap-3">
                  <Switch checked={nftEnabled} onCheckedChange={c => { setNftEnabled(c); if (c) setPaywallEnabled(false); }} />
                  <span className="text-xs font-bold text-foreground flex items-center gap-1"><Gem className="w-3.5 h-3.5 text-primary" /> NFT Paywall (propriedade + views limitadas)</span>
                </div>
                {nftEnabled && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Price (USDC)</label>
                        <Input type="number" value={nftPrice} onChange={e => setNftPrice(e.target.value)} min="0" step="0.01" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">View Tier</label>
                        <div className="flex gap-1">
                          {VIEW_TIERS.map(t => (
                            <button key={t.value} onClick={() => setNftMaxViews(String(t.value))}
                              className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold border transition-all ${nftMaxViews === String(t.value) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:border-primary/50"}`}>
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Max Editions (∞ = blank)</label>
                        <Input type="number" value={nftMaxEditions} onChange={e => setNftMaxEditions(e.target.value)} min="1" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <Switch checked={rechargeEnabled} onCheckedChange={setRechargeEnabled} />
                      <span className="text-xs font-bold text-foreground flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5 text-accent" /> Allow Recharge</span>
                      {rechargeEnabled && (
                        <div className="flex items-center gap-1">
                          <label className="text-[10px] font-bold text-muted-foreground">Price:</label>
                          <Input type="number" value={rechargePrice} onChange={e => setRechargePrice(e.target.value)} min="0" step="0.01" className="w-24 h-7 text-xs" />
                          <span className="text-[10px] text-muted-foreground">USDC</span>
                        </div>
                      )}
                    </div>
                    {!rechargeEnabled && <p className="text-[10px] text-muted-foreground italic">Without recharge, NFT becomes collectible after views run out.</p>}
                  </>
                )}
                <button onClick={handleAddVideo} disabled={!ytUrl || !site?.id} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 disabled:opacity-50">
                  <Plus className="w-4 h-4" /> Adicionar Vídeo
                </button>
              </div>
              {(videos || []).length > 0 && (
                <div className="space-y-2">
                  {(videos || []).map((v: any) => (
                    <div key={v.id} className="flex items-center gap-3 bg-secondary/30 rounded-lg p-3 border border-border">
                      <img src={v.thumbnail_url || `https://img.youtube.com/vi/${v.youtube_video_id}/default.jpg`} alt="" className="w-20 h-12 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{v.title}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {v.nft_enabled && <span className="text-[10px] text-primary font-bold">NFT · ${v.nft_price} · {v.nft_max_views} view(s) · {v.nft_editions_sold || 0}{v.nft_max_editions ? `/${v.nft_max_editions}` : ""} sold</span>}
                          {(v as any).paywall_enabled && <span className="text-[10px] text-accent font-bold flex items-center gap-0.5"><DollarSign className="w-2.5 h-2.5" /> Paywall ${(v as any).paywall_price}</span>}
                          {v.recharge_enabled && <span className="text-[10px] text-accent font-bold flex items-center gap-0.5"><RefreshCw className="w-2.5 h-2.5" /> ${v.recharge_price}</span>}
                          {!v.nft_enabled && !(v as any).paywall_enabled && <span className="text-[10px] text-muted-foreground">Free</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {v.nft_enabled && site?.id && !myCollections?.some((c: any) => c.video_id === v.id) && (
                          <button
                            onClick={() => {
                              if (!confirm(`Launch NFT Collection for "${v.title}"?\n\nFee: $300 (deducted from wallet)\nEditions: ${v.nft_max_editions || "1,000,000"}\nPrice: $${v.nft_price}/NFT\nSplit: 70% Creator / 30% Platform`)) return;
                              launchCollection.mutate({
                                video_id: v.id,
                                site_id: site.id,
                                title: v.title,
                                max_editions: v.nft_max_editions || 1000000,
                                price_per_nft: v.nft_price,
                                view_tier: v.nft_max_views,
                                recharge_enabled: v.recharge_enabled,
                                recharge_price: v.recharge_price,
                                thumbnail_url: v.thumbnail_url,
                              });
                            }}
                            disabled={launchCollection.isPending}
                            className="px-2 py-1.5 bg-primary/10 text-primary rounded text-[10px] font-bold hover:bg-primary/20 transition-colors flex items-center gap-1 whitespace-nowrap"
                            title="Launch NFT Collection ($300)"
                          >
                            🚀 Launch
                          </button>
                        )}
                        {myCollections?.some((c: any) => c.video_id === v.id) && (
                          <Link to="/marketplace" className="px-2 py-1.5 bg-accent/10 text-accent rounded text-[10px] font-bold flex items-center gap-1 whitespace-nowrap">
                            ✅ Live
                          </Link>
                        )}
                        <button onClick={() => deleteVideo.mutateAsync(v.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!site && <p className="text-xs text-muted-foreground italic">Salve o site primeiro para adicionar vídeos.</p>}
            </div>

            {/* Links */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2"><Link2 className="w-4 h-4 text-primary" /> Links & Social</h2>
              <SocialLinkPicker onAdd={(title, url, icon) => handleAddLink(title, url, icon)} disabled={!site?.id} />
              <div className="border-t border-border pt-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Custom Link</p>
                <div className="flex gap-2">
                  <Input value={linkTitle} onChange={e => setLinkTitle(e.target.value)} placeholder="Título do link" className="flex-1" />
                  <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." className="flex-1" />
                  <button onClick={() => handleAddLink()} disabled={!linkTitle || !linkUrl || !site?.id} className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 disabled:opacity-50"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              {(links || []).map((l: any) => {
                const social = SOCIAL_NETWORKS.find(s => s.id === l.icon);
                return (
                  <div key={l.id} className="flex items-center justify-between bg-secondary/30 rounded-lg px-4 py-2 border border-border">
                    <div className="flex items-center gap-2">
                      {social ? <span style={{ color: social.color }}>{social.icon}</span> : <Link2 className="w-4 h-4 text-muted-foreground" />}
                      <div><p className="text-xs font-bold text-foreground">{l.title}</p><p className="text-[10px] text-muted-foreground truncate">{l.url}</p></div>
                    </div>
                    <button onClick={() => deleteLink.mutateAsync(l.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                );
              })}
            </div>

            {/* Imóveis */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  🏠 Imóveis à Venda
                </h2>
                <button
                  onClick={() => setShowImoveisForm(!showImoveisForm)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${showImoveisForm ? "bg-primary" : "bg-secondary"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${showImoveisForm ? "left-[22px]" : "left-0.5"}`}/>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Anuncie imóveis no seu mini site e no diretório. Até 10 fotos por anúncio em carrossel.</p>
              {showImoveisForm && (
                site?.id ? (
                  <ClassifiedForm siteId={site.id} type="imovel" onSuccess={() => { toast.success("Imóvel anunciado!"); setShowImoveisForm(false); }} />
                ) : (
                  <p className="text-xs text-destructive font-bold">⚠️ Salve o site primeiro para anunciar.</p>
                )
              )}
            </div>

            {/* Carros */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  🚗 Carros à Venda
                </h2>
                <button
                  onClick={() => setShowCarrosForm(!showCarrosForm)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${showCarrosForm ? "bg-primary" : "bg-secondary"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${showCarrosForm ? "left-[22px]" : "left-0.5"}`}/>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Anuncie veículos no seu mini site e no diretório de carros. Até 10 fotos em carrossel.</p>
              {showCarrosForm && (
                site?.id ? (
                  <ClassifiedForm siteId={site.id} type="carro" onSuccess={() => { toast.success("Carro anunciado!"); setShowCarrosForm(false); }} />
                ) : (
                  <p className="text-xs text-destructive font-bold">⚠️ Salve o site primeiro para anunciar.</p>
                )
              )}
            </div>

            {/* Google Auth */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-accent" /> Conta Google</h2>
              <p className="text-xs text-muted-foreground">Conecte sua conta Google para verificar o canal YouTube.</p>
              <button onClick={handleGoogleSignIn} className="flex items-center gap-2 px-4 py-2 bg-foreground text-background font-bold text-xs rounded-lg hover:opacity-90">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Entrar com Google
              </button>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Preview</h3>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                  Tema: {currentTheme.label}
                </span>
              </div>
              {(() => {
                const isDark = currentTheme.dark;
                const bgClass = isDark ? `bg-gradient-to-br ${currentTheme.colors}` : currentTheme.colors;
                const autoTextMain = isDark ? "#ffffff" : "#111827";
                const autoTextSub = isDark ? "rgba(255,255,255,0.6)" : "rgba(107,114,128,1)";
                const resolvedTextColor = textColor || autoTextMain;
                const cardBg = isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10";
                const textMuted = isDark ? "text-white/30" : "text-gray-300";
                const photoShapeClass = photoShape === "round" ? "rounded-full" : photoShape === "rounded" ? "rounded-xl" : "rounded-none";
                const photoSizeClass = PHOTO_SIZES.find(p => p.id === photoSize)?.px || "w-24 h-24";
                const fontClass = fontSize === "sm" ? "text-sm" : fontSize === "lg" ? "text-xl" : fontSize === "xl" ? "text-2xl" : "text-lg";
                const fontSubClass = fontSize === "sm" ? "text-[10px]" : fontSize === "lg" ? "text-sm" : fontSize === "xl" ? "text-base" : "text-xs";

                return (
                  <div
                    className={`${bgClass} rounded-2xl min-h-[500px] border border-border/20 shadow-xl relative overflow-hidden`}
                    style={bgImageUrl ? { backgroundImage: `url(${bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
                  >
                    {bgImageUrl && <div className="absolute inset-0 bg-black/40 rounded-2xl" />}
                    {/* Banner preview */}
                    {bannerUrl && (
                      <div className="w-full h-20 overflow-hidden rounded-t-2xl">
                        <img src={bannerUrl} alt="banner" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="relative z-10 p-6">
                      <div className="flex flex-col items-center text-center space-y-3 mb-6">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="" className={`${photoSizeClass} ${photoShapeClass} object-cover border-2 shadow-lg`} style={{ borderColor: currentTheme.accent + "40" }} />
                        ) : (
                          <div className={`${photoSizeClass} ${photoShapeClass} flex items-center justify-center text-3xl font-black text-white border-2`} style={{ backgroundColor: currentTheme.accent, borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" }}>
                            {siteName?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                        <h4 className={`${fontClass} font-black`} style={{ color: resolvedTextColor }}>{siteName || "Seu Nome"}</h4>
                        {bio && <p className={`${fontSubClass} max-w-[200px]`} style={{ color: textColor ? resolvedTextColor + "99" : autoTextSub }}>{bio}</p>}
                      </div>

                      {presentationVideoUrl && (
                        <div className="aspect-video w-full rounded-lg overflow-hidden border border-white/10 mb-4">
                          <iframe
                            src={`https://www.youtube.com/embed/${extractYouTubeId(presentationVideoUrl)}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        </div>
                      )}

                      <div className="space-y-2 mb-4">
                        {(links || []).length > 0 ? (
                          (links || []).slice(0, 3).map((l: any) => {
                            const social = SOCIAL_NETWORKS.find(s => s.id === l.icon);
                            return (
                              <div key={l.id} className={`flex items-center gap-2 px-3 py-2 ${cardBg} rounded-lg border`}>
                                {social ? <span style={{ color: social.color }}>{social.icon}</span> : <Link2 className={`w-3 h-3 ${textMuted}`} />}
                                <span className={fontSubClass} style={{ color: resolvedTextColor + "cc" }}>{l.title}</span>
                              </div>
                            );
                          })
                        ) : (
                          <div className={`px-3 py-3 ${isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"} rounded-lg border border-dashed text-center`}>
                            <p className={`text-[10px] ${textMuted}`}>Adicione links na seção "Links & Social" ao lado</p>
                          </div>
                        )}
                      </div>

                      {(videos || []).length > 0 && (
                        <div className={`grid gap-2 ${layoutCols === 1 ? "grid-cols-1" : layoutCols === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                          {(videos || []).slice(0, 4).map((v: any) => (
                            <div key={v.id} className={`${cardBg} rounded-lg overflow-hidden border`}>
                              <img src={v.thumbnail_url || `https://img.youtube.com/vi/${v.youtube_video_id}/default.jpg`} alt="" className="w-full aspect-video object-cover" />
                              <div className="p-1.5">
                                <p className="text-[9px] font-bold truncate" style={{ color: resolvedTextColor + "cc" }}>{v.title}</p>
                                {v.nft_enabled && <span className="text-[8px] font-bold" style={{ color: currentTheme.accent }}>${v.nft_price}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {showCv && (
                        <div className={`mt-4 ${isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"} rounded-lg p-3 border`}>
                          <p className="text-[10px] font-bold mb-1" style={{ color: resolvedTextColor + "99" }}>📄 CV / Resume</p>
                          <p className="text-[9px] line-clamp-2" style={{ color: resolvedTextColor + "66" }}>{cvContent || "Your experience..."}</p>
                          {contactEmail && (
                            <div className="mt-2 flex items-center gap-1">
                              <Lock className={`w-3 h-3 ${textMuted}`} />
                              <span className={`text-[9px] ${textMuted}`}>Contact locked · ${contactPrice} to unlock</span>
                            </div>
                          )}
                        </div>
                      )}

                      <p className={`text-[8px] ${textMuted} text-center mt-6`}>trustbank.xyz</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
};

export default MiniSiteEditor;
