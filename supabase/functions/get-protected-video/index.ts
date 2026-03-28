import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── AES-256-GCM encryption helpers ───
async function generateAesKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

async function encryptAes(plaintext: string, key: CryptoKey): Promise<{ ciphertext: string; iv: string; keyHex: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  
  const exportedKey = await crypto.subtle.exportKey("raw", key);
  
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
    keyHex: btoa(String.fromCharCode(...new Uint8Array(exportedKey))),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { video_id } = await req.json();
    if (!video_id) throw new Error("video_id required");

    const authHeader = req.headers.get("Authorization");
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      userId = user?.id || null;
    }

    // Get video
    const { data: video } = await supabaseAdmin
      .from("mini_site_videos")
      .select("id, youtube_video_id, paywall_enabled, paywall_price, nft_enabled, user_id")
      .eq("id", video_id)
      .single();

    if (!video) {
      return new Response(JSON.stringify({ error: "Video not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Access control checks ───
    const hasAccess = await checkAccess(supabaseAdmin, video, userId);

    if (!hasAccess) {
      return new Response(JSON.stringify({ error: "Access denied", locked: true }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── AES encrypt the youtube_video_id ───
    const aesKey = await generateAesKey();
    const encrypted = await encryptAes(video.youtube_video_id, aesKey);

    // Return encrypted data — client decrypts with the key
    // Token expires in 15 minutes (client should use immediately)
    const expiresAt = Date.now() + 15 * 60 * 1000;

    return new Response(JSON.stringify({
      encrypted_video_id: encrypted.ciphertext,
      iv: encrypted.iv,
      key: encrypted.keyHex,
      expires_at: expiresAt,
      algorithm: "AES-256-GCM",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Protected video error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function checkAccess(supabase: any, video: any, userId: string | null): Promise<boolean> {
  // No protection = open access
  if (!video.paywall_enabled && !video.nft_enabled) return true;

  // Owner always has access
  if (userId && userId === video.user_id) return true;

  // Not logged in
  if (!userId) return false;

  // Check paywall unlock
  if (video.paywall_enabled) {
    const { data: unlock } = await supabase
      .from("video_paywall_unlocks")
      .select("id")
      .eq("video_id", video.id)
      .eq("user_id", userId)
      .maybeSingle();
    if (unlock) return true;
  }

  // Check NFT ownership
  if (video.nft_enabled) {
    const { data: nft } = await supabase
      .from("nft_purchases")
      .select("id, views_used, views_allowed")
      .eq("video_id", video.id)
      .eq("buyer_id", userId)
      .maybeSingle();

    if (nft && nft.views_used < nft.views_allowed) {
      await supabase
        .from("nft_purchases")
        .update({ views_used: nft.views_used + 1 })
        .eq("id", nft.id);
      return true;
    }
  }

  return false;
}
