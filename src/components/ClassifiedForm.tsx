import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Upload, X, ChevronLeft, ChevronRight, Car, Home, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ListingType = "imovel" | "carro";

interface Props {
  siteId: string;
  type: ListingType;
  onSuccess?: () => void;
}

// ── Photo Carousel ────────────────────────────────────────────
export function PhotoCarousel({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  if (!images.length) return null;

  return (
    <div className="relative rounded-xl overflow-hidden aspect-video bg-secondary">
      <img src={images[idx]} alt="" className="w-full h-full object-cover" />
      {images.length > 1 && (
        <>
          <button onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setIdx((i) => (i + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70">
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? "bg-white" : "bg-white/40"}`} />
            ))}
          </div>
          <span className="absolute top-2 right-2 bg-black/50 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {idx + 1}/{images.length}
          </span>
        </>
      )}
    </div>
  );
}

// ── Card público ──────────────────────────────────────────────
export function ClassifiedCard({ item }: { item: any }) {
  const images = Array.isArray(item.images) ? item.images : [];
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <PhotoCarousel images={images} />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          {item.type === "carro" ? <Car className="w-4 h-4 text-primary shrink-0" /> : <Home className="w-4 h-4 text-primary shrink-0" />}
          <h3 className="font-black text-foreground text-sm truncate">{item.title}</h3>
        </div>
        {item.price && (
          <p className="text-primary font-black text-lg mb-1">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price)}
          </p>
        )}
        {item.location && <p className="text-xs text-muted-foreground mb-2">📍 {item.location}</p>}
        {item.description && <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>}
        {item.type === "carro" && item.extra && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {item.extra.marca && <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{item.extra.marca}</span>}
            {item.extra.ano && <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{item.extra.ano}</span>}
            {item.extra.km && <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{item.extra.km} km</span>}
          </div>
        )}
        {item.type === "imovel" && item.extra && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {item.extra.quartos && <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{item.extra.quartos} quartos</span>}
            {item.extra.m2 && <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{item.extra.m2} m²</span>}
            {item.extra.tipo && <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{item.extra.tipo}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Formulário ────────────────────────────────────────────────
export default function ClassifiedForm({ siteId, type, onSuccess }: Props) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [marca, setMarca] = useState("");
  const [ano, setAno] = useState("");
  const [km, setKm] = useState("");
  const [quartos, setQuartos] = useState("");
  const [m2, setM2] = useState("");
  const [tipoImovel, setTipoImovel] = useState("");

  const handleUpload = async (files: FileList) => {
    if (images.length >= 10) { toast.error("Máximo 10 fotos"); return; }
    setUploading(true);
    for (const file of Array.from(files).slice(0, 10 - images.length)) {
      try {
        const path = `${user!.id}/classified/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
        const { error } = await supabase.storage.from("platform-assets").upload(path, file, { upsert: true });
        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from("platform-assets").getPublicUrl(path);
          setImages((p) => [...p, publicUrl]);
        } else {
          // Fallback base64
          const b64 = await new Promise<string>((res) => {
            const r = new FileReader();
            r.onload = () => res(r.result as string);
            r.readAsDataURL(file);
          });
          setImages((p) => [...p, b64]);
        }
      } catch { toast.error("Erro no upload"); }
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user || !title.trim()) { toast.error("Preencha o título"); return; }
    setSaving(true);

    const extra = type === "carro"
      ? { marca, ano, km }
      : { quartos, m2, tipo: tipoImovel };

    try {
      const payload = {
        site_id: siteId || null,
        user_id: user.id,
        type,
        title: title.trim(),
        description: description.trim() || null,
        price: price ? parseFloat(price) : null,
        location: location.trim() || null,
        images,
        extra,
        status: "active",
      };

      // Try supabase client first (works if schema cache is updated)
      const { error: sbError } = await (supabase as any)
        .from("classified_listings")
        .insert(payload);

      if (sbError) {
        // Fallback: direct REST API (bypasses schema cache)
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${SUPABASE_URL}/rest/v1/classified_listings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${session?.access_token || SUPABASE_KEY}`,
            "Prefer": "return=minimal",
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText);
        }
      }

      toast.success(type === "carro" ? "🚗 Carro anunciado!" : "🏠 Imóvel anunciado!");
      setTitle(""); setDescription(""); setPrice(""); setLocation(""); setImages([]);
      setMarca(""); setAno(""); setKm(""); setQuartos(""); setM2(""); setTipoImovel("");
      onSuccess?.();
    } catch (e: any) {
      console.error("[classified save]", e);
      toast.error("Erro ao salvar: " + (e?.message || String(e)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Fotos */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
          Fotos ({images.length}/10)
        </label>
        {images.length > 0 && (
          <div className="mb-3">
            <PhotoCarousel images={images} />
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <div key={i} className="relative shrink-0">
                  <img src={img} alt="" className="w-16 h-12 rounded-lg object-cover border border-border" />
                  <button onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 bg-secondary rounded-xl border border-border text-sm font-bold hover:bg-secondary/70">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Enviando..." : "Upload fotos"}
          <input type="file" accept="image/*" multiple className="hidden"
            disabled={uploading || images.length >= 10}
            onChange={(e) => e.target.files && handleUpload(e.target.files)} />
        </label>
        <p className="text-xs text-muted-foreground mt-1">Até 10 fotos · JPG PNG WebP</p>
      </div>

      {/* Título e preço */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Título *</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder={type === "carro" ? "Honda Civic 2022" : "Apartamento 2 quartos"} />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Preço (R$)</label>
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="350000" />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Localização</label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="São Paulo, SP" />
        </div>
      </div>

      {/* Carro */}
      {type === "carro" && (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Marca</label>
            <Input value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Honda" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Ano</label>
            <Input value={ano} onChange={(e) => setAno(e.target.value)} placeholder="2022" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">KM</label>
            <Input value={km} onChange={(e) => setKm(e.target.value)} placeholder="45000" />
          </div>
        </div>
      )}

      {/* Imóvel */}
      {type === "imovel" && (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Tipo</label>
            <Input value={tipoImovel} onChange={(e) => setTipoImovel(e.target.value)} placeholder="Apartamento" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Quartos</label>
            <Input type="number" value={quartos} onChange={(e) => setQuartos(e.target.value)} placeholder="2" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Área (m²)</label>
            <Input value={m2} onChange={(e) => setM2(e.target.value)} placeholder="75" />
          </div>
        </div>
      )}

      {/* Descrição */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Descrição</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o imóvel ou veículo..." rows={3} />
      </div>

      <button onClick={handleSave} disabled={saving || !title.trim()}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {saving ? "Salvando..." : (type === "carro" ? "Anunciar Carro" : "Anunciar Imóvel")}
      </button>
    </div>
  );
}
