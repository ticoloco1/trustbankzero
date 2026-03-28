import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldAlert, CheckCircle, Ban, Eye, Music, RefreshCw, ExternalLink } from "lucide-react";

interface CopyrightVideo {
  id: string;
  title: string;
  ticker: string;
  thumbnail_url: string | null;
  creator_id: string | null;
  hosting_type: string;
  under_review: boolean;
  blocked: boolean;
  created_at: string;
  creator_name?: string;
}

const AdminCopyright = () => {
  const [videos, setVideos] = useState<CopyrightVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState<string | null>(null);

  const loadFlaggedVideos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("videos")
      .select("id, title, ticker, thumbnail_url, creator_id, hosting_type, under_review, blocked, created_at")
      .eq("under_review", true)
      .order("created_at", { ascending: false });

    if (data) {
      // Enrich with creator names
      const enriched = await Promise.all(
        data.map(async (v) => {
          let creator_name = "Unknown";
          if (v.creator_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("user_id", v.creator_id)
              .single();
            if (profile?.display_name) creator_name = profile.display_name;
          }
          return { ...v, creator_name };
        })
      );
      setVideos(enriched);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFlaggedVideos();
  }, []);

  const handleApprove = async (videoId: string) => {
    const { error } = await supabase
      .from("videos")
      .update({ under_review: false, blocked: false } as any)
      .eq("id", videoId);
    if (error) toast.error(error.message);
    else {
      toast.success("Video approved ✅");
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
    }
  };

  const handleBlock = async (videoId: string) => {
    if (!confirm("Block this video permanently?")) return;
    const { error } = await supabase
      .from("videos")
      .update({ blocked: true, under_review: false } as any)
      .eq("id", videoId);
    if (error) toast.error(error.message);
    else {
      toast.success("Video blocked 🚫");
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
    }
  };

  const handleRescan = async (video: CopyrightVideo) => {
    setScanning(video.id);
    try {
      // Run AWS piracy scan
      const awsRes = await supabase.functions.invoke("aws-piracy-scan", {
        body: {
          video_id: video.id,
          thumbnail_url: video.thumbnail_url,
          title: video.title,
        },
      });

      // Run ACRCloud scan if Bunny/Arweave
      let acrResult = null;
      if (["bunny", "arweave"].includes(video.hosting_type)) {
        const acrRes = await supabase.functions.invoke("acrcloud-scan", {
          body: {
            video_id: video.id,
            video_url: video.thumbnail_url, // placeholder — real URL would come from video_url
            hosting_type: video.hosting_type,
          },
        });
        acrResult = acrRes.data;
      }

      const awsFlags = awsRes.data?.flags || [];
      const acrMatches = acrResult?.matches || [];

      if (awsFlags.length === 0 && acrMatches.length === 0) {
        toast.success("No issues found on rescan.");
      } else {
        toast.warning(
          `Found: ${awsFlags.length} visual flag(s), ${acrMatches.length} audio match(es)`
        );
      }
    } catch (err: any) {
      toast.error("Rescan failed: " + (err.message || "Unknown error"));
    } finally {
      setScanning(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-destructive" />
          <h3 className="text-sm font-bold text-foreground uppercase">
            Copyright & Piracy Review
          </h3>
          <span className="bg-destructive/20 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full">
            {videos.length} pending
          </span>
        </div>
        <button
          onClick={loadFlaggedVideos}
          disabled={loading}
          className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1.5 rounded text-xs font-medium hover:bg-secondary/80 disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground text-sm">Loading flagged videos...</div>
      ) : videos.length === 0 ? (
        <div className="text-center py-10 border border-border rounded-lg bg-card">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No flagged videos. All clear! 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="border border-border rounded-lg bg-card p-4 flex flex-col md:flex-row gap-4"
            >
              {/* Thumbnail */}
              <div className="w-full md:w-40 h-24 rounded overflow-hidden bg-muted flex-shrink-0">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    No thumbnail
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-card-foreground truncate">{video.title}</h4>
                    <p className="text-xs text-muted-foreground font-mono">${video.ticker}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {video.blocked && (
                      <span className="bg-destructive/20 text-destructive text-[9px] font-bold px-1.5 py-0.5 rounded">
                        BLOCKED
                      </span>
                    )}
                    <span className="bg-yellow-500/20 text-yellow-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      REVIEW
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>By: {video.creator_name}</span>
                  <span>•</span>
                  <span>Host: {video.hosting_type}</span>
                  <span>•</span>
                  <span>{new Date(video.created_at).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleApprove(video.id)}
                    className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleBlock(video.id)}
                    className="flex items-center gap-1 bg-destructive text-destructive-foreground px-3 py-1.5 rounded text-xs font-bold hover:bg-destructive/90"
                  >
                    <Ban className="w-3 h-3" />
                    Block
                  </button>
                  <button
                    onClick={() => handleRescan(video)}
                    disabled={scanning === video.id}
                    className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1.5 rounded text-xs font-medium hover:bg-secondary/80 disabled:opacity-50"
                  >
                    <Music className={`w-3 h-3 ${scanning === video.id ? "animate-spin" : ""}`} />
                    {scanning === video.id ? "Scanning..." : "Rescan"}
                  </button>
                  <a
                    href={`/video/${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCopyright;
