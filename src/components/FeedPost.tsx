import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, Underline, Image, Pin, Send, Trash2, Smile } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";

const EMOJI_LIST = ["😀", "😎", "🔥", "❤️", "👏", "🚀", "💡", "🎯", "💎", "⭐", "✅", "🎉", "💪", "👀", "🤝"];

interface FeedProps {
  siteId: string;
  userId: string;
  isOwner: boolean;
  isDark?: boolean; // recebe do MiniSitePublic
  textColor?: string; // cor personalizada do tema
}

export default function Feed({ siteId, userId, isOwner, isDark = true, textColor }: FeedProps) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [pinPost, setPinPost] = useState(false);

  // ── Determine if text color is light or dark to pick contrasting UI ──
  const isLightColor = (hex: string) => {
    if (!hex || hex.length < 4) return false;
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 160;
  };
  // If textColor set, use it; auto-detect contrast
  const effectiveIsDark = textColor ? isLightColor(textColor) : isDark;

  const c = {
    composerBg: effectiveIsDark ? "bg-white/10" : "bg-black/5",
    composerBorder: effectiveIsDark ? "border-white/10" : "border-gray-300",
    postBg: effectiveIsDark ? "bg-white/5" : "bg-white",
    postBorder: effectiveIsDark ? "border-white/10" : "border-gray-200",
    postShadow: effectiveIsDark ? "" : "shadow-sm",
    text: "",
    textSub: "",
    textMuted: effectiveIsDark ? "text-white/30" : "text-gray-400",
    textPlaceholder: effectiveIsDark ? "placeholder:text-white/30" : "placeholder:text-gray-400",
    inputBorder: effectiveIsDark ? "border-white/10" : "border-gray-300",
    btnHover: effectiveIsDark ? "hover:bg-white/10" : "hover:bg-gray-100",
    btnIcon: effectiveIsDark ? "text-white/60" : "text-gray-500",
    emojiPicker: effectiveIsDark ? "bg-white/5" : "bg-gray-100",
    empty: effectiveIsDark ? "text-white/20" : "text-gray-400",
  };

  const effectiveTextColor = textColor || (isDark ? "#ffffff" : "#111827");
  const textStyle = { color: effectiveTextColor };
  const textSubStyle = { color: effectiveTextColor + "99" };

  const { data: posts } = useQuery({
    queryKey: ["feed-posts", siteId],
    queryFn: async () => {
      const { data } = await supabase
        .from("feed_posts")
        .select("*")
        .eq("site_id", siteId)
        .gte("expires_at", new Date().toISOString())
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!siteId,
  });

  const createPost = useMutation({
    mutationFn: async () => {
      if (!content.trim()) throw new Error("Content required");
      if (pinPost) {
        const { data: lastTx } = await supabase
          .from("ledger_transactions")
          .select("balance_after")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(1);
        const balance = lastTx?.[0]?.balance_after ?? 0;
        if (balance < 10) throw new Error("Insufficient balance. You need $10 USDC to pin a post.");
        const { error: ledgerErr } = await supabase.from("ledger_transactions").insert({
          user_id: user!.id,
          amount: -10,
          balance_after: balance - 10,
          tx_type: "pin_post",
          description: "Pinned post for 365 days",
        });
        if (ledgerErr) throw ledgerErr;
      }
      const postData: any = {
        user_id: user!.id,
        site_id: siteId,
        content: content.trim(),
        image_url: imageUrl || null,
        pinned: pinPost,
        pinned_until: pinPost ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
      };
      const { error } = await supabase.from("feed_posts").insert(postData);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed-posts", siteId] });
      setContent("");
      setImageUrl("");
      setPinPost(false);
      toast.success(pinPost ? "Post fixado por 365 dias ($10 USDC)" : "Post publicado!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("feed_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed-posts", siteId] }),
  });

  const applyFormat = (tag: string) => {
    const ta = document.getElementById("feed-textarea") as HTMLTextAreaElement;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.substring(start, end);
    let wrapped = selected;
    if (tag === "bold") wrapped = `**${selected}**`;
    else if (tag === "italic") wrapped = `*${selected}*`;
    else if (tag === "underline") wrapped = `__${selected}__`;
    else if (tag === "upper") wrapped = selected.toUpperCase();
    else if (tag === "lower") wrapped = selected.toLowerCase();
    setContent(content.substring(0, start) + wrapped + content.substring(end));
  };

  const renderContent = (text: string) => {
    const html = text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/__(.+?)__/g, "<u>$1</u>")
      .replace(/\n/g, "<br/>");
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="space-y-3">
      {/* Composer — só para o dono */}
      {isOwner && (
        <div className={`${c.composerBg} backdrop-blur-sm border ${c.composerBorder} rounded-xl p-4 space-y-3`}>
          <div className="flex items-center gap-1 mb-1">
            {[
              { icon: <Bold className="w-3.5 h-3.5" />, tag: "bold" },
              { icon: <Italic className="w-3.5 h-3.5" />, tag: "italic" },
              { icon: <Underline className="w-3.5 h-3.5" />, tag: "underline" },
            ].map(({ icon, tag }) => (
              <button key={tag} onClick={() => applyFormat(tag)} className={`p-1.5 rounded ${c.btnHover} ${c.btnIcon}`}>
                {icon}
              </button>
            ))}
            <button
              onClick={() => applyFormat("upper")}
              className={`p-1.5 rounded ${c.btnHover} ${c.btnIcon} text-[10px] font-bold`}
            >
              AA
            </button>
            <button
              onClick={() => applyFormat("lower")}
              className={`p-1.5 rounded ${c.btnHover} ${c.btnIcon} text-[10px] font-bold`}
            >
              aa
            </button>
            <div className="flex-1" />
            <button onClick={() => setShowEmoji(!showEmoji)} className={`p-1.5 rounded ${c.btnHover} ${c.btnIcon}`}>
              <Smile className="w-3.5 h-3.5" />
            </button>
          </div>

          {showEmoji && (
            <div className={`flex flex-wrap gap-1 p-2 ${c.emojiPicker} rounded-lg`}>
              {EMOJI_LIST.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    setContent((ct) => ct + e);
                    setShowEmoji(false);
                  }}
                  className="text-lg hover:scale-125 transition-transform"
                >
                  {e}
                </button>
              ))}
            </div>
          )}

          <Textarea
            id="feed-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={500}
            rows={3}
            className={`bg-transparent border ${c.inputBorder} ${c.textPlaceholder} text-sm resize-none`}
            style={textStyle}
          />

          <div className="flex items-center gap-2">
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Image URL (optional)"
              className={`flex-1 bg-transparent border ${c.inputBorder} ${c.textPlaceholder} text-xs h-8`}
              style={textStyle}
            />
            <Image className={`w-3.5 h-3.5 ${c.textMuted}`} />
          </div>

          <div className="flex items-center justify-between">
            <label className={`flex items-center gap-2 text-xs cursor-pointer`} style={textSubStyle}>
              <input
                type="checkbox"
                checked={pinPost}
                onChange={(e) => setPinPost(e.target.checked)}
                className="rounded"
              />
              <Pin className="w-3 h-3" /> Pin for 365 days ($10 USDC)
            </label>
            <button
              onClick={() => createPost.mutate()}
              disabled={!content.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> Post
            </button>
          </div>
        </div>
      )}

      {/* Lista de posts */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-hide">
        {(posts || []).map((post: any) => (
          <div
            key={post.id}
            className={`${c.postBg} ${c.postShadow} backdrop-blur-sm border ${c.postBorder} rounded-xl p-4 space-y-2`}
            style={{ minHeight: "80px", borderLeft: post.pinned ? "3px solid #f59e0b" : undefined }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {post.pinned && <Pin className="w-3 h-3 text-yellow-500" />}
                <span className={`text-[10px] ${c.textMuted}`}>
                  {new Date(post.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              {isOwner && (
                <button
                  onClick={() => deletePost.mutate(post.id)}
                  className={`${c.textMuted} hover:text-red-500 transition-colors`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className={`text-sm leading-relaxed`} style={textStyle}>
              {renderContent(post.content)}
            </div>

            {post.image_url && <img src={post.image_url} alt="" className="w-full rounded-lg max-h-48 object-cover" />}

            <CountdownTimer expiresAt={post.expires_at} />
          </div>
        ))}

        {(!posts || posts.length === 0) && (
          <div className={`text-center py-8 ${c.empty} text-xs`}>Nenhum post ainda</div>
        )}
      </div>
    </div>
  );
}
