import { useState, useRef, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { categories } from "@/data/mockDatabase";
import { toast } from "sonner";
import { Upload, ArrowLeft, Info, Globe, Server, Image, X, Loader2 } from "lucide-react";

const subcategories: Record<string, string[]> = {
  filmmaker: ["Short Film", "Documentary", "Music Video", "Vlog", "Tutorial"],
  singer: ["Cover", "Original", "Live Performance", "Acoustic", "Remix"],
  musician: ["Instrumental", "Beat", "Composition", "Live Session", "Tutorial"],
  podcaster: ["Interview", "Solo", "Panel", "News", "Commentary"],
  streamer: ["Gameplay", "IRL", "Talk Show", "Creative", "Esports"],
  gamer: ["Walkthrough", "Review", "Highlights", "Speedrun", "Tips"],
  influencer: ["Lifestyle", "Fashion", "Travel", "Food", "Tech"],
  "digital-artist": ["Timelapse", "Tutorial", "Showcase", "Process", "NFT"],
  designer: ["UI/UX", "Graphic", "Motion", "Branding", "3D"],
  journalist: ["Investigation", "Report", "Opinion", "Interview", "Breaking"],
};

type HostingType = "embed" | "upload";

const hostingPlans: { id: HostingType; label: string; price: string; priceNum: number; icon: React.ReactNode; desc: string }[] = [
  { id: "embed", label: "Embed (External)", price: "$5.99/yr", priceNum: 5.99, icon: <Globe className="w-5 h-5" />, desc: "YouTube, Rumble or other platforms. Paste the embed URL." },
  { id: "upload", label: "Upload to TrustBank", price: "$12.90/yr", priceNum: 12.90, icon: <Server className="w-5 h-5" />, desc: "Video hosted on TrustBank CDN (Bunny.net). Thumbnail frames extracted automatically." },
];

function generateHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `0x${Math.abs(hash).toString(16).padStart(40, '0')}`;
}

function generateTicker(title: string): string {
  const words = title.replace(/[^a-zA-Z ]/g, '').split(' ').filter(Boolean);
  let ticker = '';
  for (const w of words) {
    ticker += w[0].toUpperCase();
    if (ticker.length >= 3) break;
  }
  while (ticker.length < 3) ticker += 'X';
  const num = Math.floor(Math.random() * 90) + 10;
  return `$${ticker.slice(0, 3)}${num}`;
}

const AD_SLOTS = [
  { id: "footer_banner", label: "Footer banner (40px) inside video player" },
  { id: "top_banner", label: "Top banner (40px) above video player" },
  { id: "sponsor_logo", label: "Sponsor logo overlay (top-left corner)" },
  { id: "pre_roll", label: "Full-screen pre-roll ad (5 seconds before video)" },
];

/** Extract N frames from a video file at evenly spaced intervals */
function extractFrames(file: File, count: number = 4): Promise<Blob[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (!duration || duration < 1) {
        URL.revokeObjectURL(url);
        reject(new Error("Video too short or unreadable"));
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext("2d")!;
      const timestamps = Array.from({ length: count }, (_, i) =>
        Math.min(duration * ((i + 1) / (count + 1)), duration - 0.1)
      );
      const blobs: Blob[] = [];
      let idx = 0;

      const captureNext = () => {
        if (idx >= timestamps.length) {
          URL.revokeObjectURL(url);
          resolve(blobs);
          return;
        }
        video.currentTime = timestamps[idx];
      };

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) blobs.push(blob);
            idx++;
            captureNext();
          },
          "image/jpeg",
          0.85
        );
      };

      captureNext();
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load video"));
    };
  });
}

const Studio = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [madeForKids, setMadeForKids] = useState(false);
  const [aiContent, setAiContent] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [hostingType, setHostingType] = useState<HostingType>("embed");
  const [paywallPrice, setPaywallPrice] = useState("0.15");

  // Video file & frames
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<number>(0);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) return <div className="min-h-screen bg-background"><Header /><div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Loading...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024 * 1024) {
      toast.error("File too large. Max 2GB.");
      return;
    }

    setVideoFile(file);
    setExtracting(true);
    setExtractedFrames([]);

    try {
      const frames = await extractFrames(file, 6);
      const urls = frames.map((blob) => URL.createObjectURL(blob));
      setExtractedFrames(urls);
      setSelectedFrame(0);
      toast.success(`${frames.length} frames extracted! Select a thumbnail.`);
    } catch (err: any) {
      toast.error(err.message || "Could not extract frames");
    } finally {
      setExtracting(false);
    }
  };

  const removeVideoFile = () => {
    setVideoFile(null);
    extractedFrames.forEach((u) => URL.revokeObjectURL(u));
    setExtractedFrames([]);
    setSelectedFrame(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadSelectedFrame = async (): Promise<string | null> => {
    if (extractedFrames.length === 0) return thumbnailUrl || null;

    // Convert objectURL back to blob
    const res = await fetch(extractedFrames[selectedFrame]);
    const blob = await res.blob();
    const fileName = `thumbnails/${user!.id}/${Date.now()}_frame${selectedFrame}.jpg`;

    const { error } = await supabase.storage
      .from("video-previews")
      .upload(fileName, blob, { contentType: "image/jpeg", upsert: true });

    if (error) throw new Error("Thumbnail upload failed: " + error.message);

    const { data: publicUrl } = supabase.storage
      .from("video-previews")
      .getPublicUrl(fileName);

    return publicUrl.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalAccepted) { toast.error("You must accept the legal declaration."); return; }
    if (!title.trim() || !category) { toast.error("Title and category are required."); return; }

    const pw = parseFloat(paywallPrice);
    const minPw = hostingType === "upload" ? 0.60 : 0.15;
    if (isNaN(pw) || pw < minPw) { toast.error(`Minimum paywall price is $${minPw.toFixed(2)} USDC for ${hostingType === "upload" ? "Bunny.net" : "YouTube Embed"}.`); return; }

    setSubmitting(true);
    try {
      // Upload selected frame as thumbnail
      const finalThumbnail = await uploadSelectedFrame();

      const ticker = generateTicker(title);
      const metadataHash = generateHash(JSON.stringify({ title, description, category, subcategory }));
      const videoHash = generateHash(videoUrl || videoFile?.name || title);
      const legalHash = generateHash(`legal-${user.id}-${Date.now()}`);
      const tagsArray = hashtags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);

      const { error } = await supabase.from("videos").insert({
        title: title.trim(),
        description: description.trim() || null,
        category,
        ticker,
        creator_id: user.id,
        video_url: videoUrl.trim() || null,
        thumbnail_url: finalThumbnail,
        status: "draft" as any,
        subcategory: subcategory || null,
        hashtags: tagsArray.length > 0 ? tagsArray : null,
        made_for_kids: madeForKids,
        ai_content: aiContent,
        metadata_hash: metadataHash,
        video_hash: videoHash,
        legal_hash: legalHash,
        listing_plan: hostingType,
        hosting_type: hostingType,
        share_price: 1.0,
        total_shares: 1000,
        paywall_price: pw,
      } as any);

      if (error) throw error;
      toast.success("Video registered as DRAFT! Go to Channel Content to publish.");
      navigate("/channel");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  const subs = subcategories[category] || [];
  const selectedPlan = hostingPlans.find(p => p.id === hostingType)!;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Studio – TrustBank" description="Upload and list your video content on TrustBank exchange." path="/studio" noIndex />
      <Header />
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-extrabold text-foreground uppercase tracking-wide">TrustBank Studio</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} maxLength={100} required
              className="w-full bg-secondary text-foreground text-sm border border-border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Video title" />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={2000} rows={4}
              className="w-full bg-secondary text-foreground text-sm border border-border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary resize-none" placeholder="Describe your content..." />
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase">Category *</label>
              <select value={category} onChange={e => { setCategory(e.target.value); setSubcategory(""); }} required
                className="w-full bg-secondary text-foreground text-sm border border-border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="">Select...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase">Subcategory</label>
              <select value={subcategory} onChange={e => setSubcategory(e.target.value)} disabled={!category}
                className="w-full bg-secondary text-foreground text-sm border border-border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40">
                <option value="">Select...</option>
                {subs.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Hashtags */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase">Hashtags</label>
            <input value={hashtags} onChange={e => setHashtags(e.target.value)} placeholder="#music, #viral, #indie"
              className="w-full bg-secondary text-foreground text-sm border border-border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
            <p className="text-[10px] text-muted-foreground">Comma-separated. Max 10 tags.</p>
          </div>

          {/* Paywall Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase">Paywall Price (USDC) *</label>
            <input type="number" step="0.01" min={hostingType === "upload" ? "0.60" : "0.15"} value={paywallPrice} onChange={e => setPaywallPrice(e.target.value)}
              className="w-full bg-secondary text-foreground text-sm border border-border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary font-mono" />
            <p className="text-[10px] text-muted-foreground">
              Minimum ${hostingType === "upload" ? "$0.60" : "$0.15"} USDC ({hostingType === "upload" ? "Bunny.net hosting" : "YouTube Embed"}). Price users pay to unlock full video.
            </p>
          </div>

          {/* Hosting Plan */}
          <div className="space-y-3 border-t border-border pt-4">
            <label className="text-xs font-bold text-foreground uppercase">Hosting Plan (Annual) *</label>
            <div className="grid grid-cols-1 gap-3">
              {hostingPlans.map(plan => (
                <button type="button" key={plan.id} onClick={() => setHostingType(plan.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors flex items-start gap-3 ${hostingType === plan.id ? "border-primary bg-primary/5" : "border-border"}`}>
                  <div className={`mt-0.5 ${hostingType === plan.id ? "text-primary" : "text-muted-foreground"}`}>{plan.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">{plan.label}</span>
                      <span className="text-lg font-extrabold font-mono text-primary">{plan.price}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{plan.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* URLs / Upload */}
          <div className="grid grid-cols-1 gap-4">
            {hostingType === "embed" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase">Embed URL (YouTube, Rumble, etc.)</label>
                <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..."
                  className="w-full bg-secondary text-foreground text-sm border border-border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            )}

            {hostingType === "upload" && (
              <div className="space-y-3 bg-secondary/50 rounded-lg p-4">
                <label className="text-xs font-bold text-foreground uppercase">Upload Video</label>

                {!videoFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Click to select video file</p>
                    <p className="text-[9px] text-muted-foreground mt-1">MP4, MOV, WebM — Max 2GB</p>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Server className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{videoFile.name}</p>
                        <p className="text-[10px] text-muted-foreground">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                      </div>
                    </div>
                    <button type="button" onClick={removeVideoFile} className="text-muted-foreground hover:text-destructive p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleVideoSelect} className="hidden" />

                {/* Extracting indicator */}
                {extracting && (
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting frames from video...
                  </div>
                )}

                {/* Extracted frames grid */}
                {extractedFrames.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Image className="w-3.5 h-3.5 text-primary" />
                      <label className="text-xs font-bold text-foreground uppercase">Select Thumbnail</label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {extractedFrames.map((frameUrl, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setSelectedFrame(i)}
                          className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                            selectedFrame === i
                              ? "border-primary ring-2 ring-primary/30 scale-[1.02]"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <img src={frameUrl} alt={`Frame ${i + 1}`} className="w-full h-full object-cover" />
                          {selectedFrame === i && (
                            <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[8px] font-black px-1.5 py-0.5 rounded">
                              ✓
                            </div>
                          )}
                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] font-mono px-1 rounded">
                            #{i + 1}
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Click a frame to use as thumbnail. It will be uploaded to TrustBank storage.</p>
                  </div>
                )}
              </div>
            )}

            {/* Manual thumbnail URL (only for embed mode or fallback) */}
            {hostingType === "embed" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase">Thumbnail URL</label>
                <input value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} placeholder="https://..."
                  className="w-full bg-secondary text-foreground text-sm border border-border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            )}
          </div>

          {/* Mandatory Ads Notice */}
          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-foreground uppercase">Mandatory Ad Slots</label>
              <span className="text-[9px] bg-destructive/10 text-destructive px-2 py-0.5 rounded font-bold">REQUIRED</span>
            </div>
            <p className="text-[10px] text-muted-foreground">All listed videos must accept the following ad placements. This is non-negotiable and ensures platform sustainability.</p>
            <div className="space-y-2">
              {AD_SLOTS.map(slot => (
                <div key={slot.id} className="flex items-center gap-2 bg-secondary/50 rounded px-3 py-2">
                  <div className="w-4 h-4 bg-primary rounded flex items-center justify-center">
                    <span className="text-primary-foreground text-[8px] font-bold">✓</span>
                  </div>
                  <span className="text-xs text-foreground">{slot.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div className="space-y-3 border-t border-border pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={madeForKids} onChange={e => setMadeForKids(e.target.checked)} className="rounded border-border" />
              <span className="text-xs text-foreground">Made for Kids</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={aiContent} onChange={e => setAiContent(e.target.checked)} className="rounded border-border" />
              <span className="text-xs text-foreground">AI / Altered Content Disclosure</span>
            </label>
          </div>

          {/* Legal */}
          <div className="space-y-2 border-t border-border pt-4">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={legalAccepted} onChange={e => setLegalAccepted(e.target.checked)} className="mt-0.5 rounded border-border" />
              <span className="text-[11px] text-foreground leading-relaxed">
                I declare this content is mine and follows TrustBank safety policies. I accept all mandatory ad placements. I understand that once shares are issued, this content becomes <strong>permanently immutable</strong> and cannot be edited or deleted.
              </span>
            </label>
          </div>

          {/* Price Summary */}
          <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Annual Hosting Fee</span>
              <span className="text-lg font-extrabold font-mono text-primary">{selectedPlan.price}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Paywall Price</span>
              <span className="text-sm font-mono font-bold text-foreground">${parseFloat(paywallPrice || "0").toFixed(2)} USDC</span>
            </div>
          </div>

          {/* Hashes Preview */}
          {title && (
            <div className="bg-secondary/50 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                <Info className="w-3 h-3" /> Lazy Mint Hashes (Off-Chain)
              </div>
              <div className="text-[9px] font-mono text-muted-foreground space-y-0.5 break-all">
                <p>META: {generateHash(JSON.stringify({ title, description, category, subcategory }))}</p>
                <p>VIDEO: {generateHash(videoUrl || videoFile?.name || title)}</p>
                <p>LEGAL: {generateHash(`legal-${user.id}-${Date.now()}`)}</p>
              </div>
            </div>
          )}

          <button type="submit" disabled={submitting || !legalAccepted}
            className="w-full bg-primary text-primary-foreground font-bold text-sm py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
            {submitting ? "Registering..." : "Register Video (Draft)"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Studio;
