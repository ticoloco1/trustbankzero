import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * ACRCloud audio fingerprint scan — only for Bunny.net & Arweave videos.
 * Grabs only the first ~10 seconds of audio to minimise API costs.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { video_url, video_id, hosting_type } = await req.json();

    // ── Guard: only Bunny / Arweave ──
    if (!hosting_type || !["bunny", "arweave"].includes(hosting_type)) {
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "Only Bunny.net and Arweave videos are scanned" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!video_url) throw new Error("video_url is required");

    const ACRCLOUD_ACCESS_KEY = Deno.env.get("ACRCLOUD_ACCESS_KEY");
    const ACRCLOUD_ACCESS_SECRET = Deno.env.get("ACRCLOUD_ACCESS_SECRET");
    const ACRCLOUD_HOST = Deno.env.get("ACRCLOUD_HOST"); // e.g. identify-us-west-2.acrcloud.com

    if (!ACRCLOUD_ACCESS_KEY || !ACRCLOUD_ACCESS_SECRET || !ACRCLOUD_HOST) {
      throw new Error("ACRCloud credentials not configured");
    }

    // ── 1. Download only the first ~512 KB of the video (≈ 5-10 s of audio) ──
    const SAMPLE_BYTES = 512 * 1024; // 512 KB
    const mediaRes = await fetch(video_url, {
      headers: { Range: `bytes=0-${SAMPLE_BYTES - 1}` },
    });

    if (!mediaRes.ok && mediaRes.status !== 206) {
      const body = await mediaRes.text();
      throw new Error(`Failed to fetch video sample: ${mediaRes.status} – ${body}`);
    }

    const sampleBuffer = new Uint8Array(await mediaRes.arrayBuffer());

    // ── 2. Build ACRCloud signature ──
    const httpMethod = "POST";
    const httpUri = "/v1/identify";
    const dataType = "audio";
    const signatureVersion = "1";
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const stringToSign = [httpMethod, httpUri, ACRCLOUD_ACCESS_KEY, dataType, signatureVersion, timestamp].join("\n");

    const key = new TextEncoder().encode(ACRCLOUD_ACCESS_SECRET);
    const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(stringToSign));
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

    // ── 3. Send to ACRCloud ──
    const formData = new FormData();
    formData.append("sample", new Blob([sampleBuffer]), "sample.mp4");
    formData.append("sample_bytes", sampleBuffer.length.toString());
    formData.append("access_key", ACRCLOUD_ACCESS_KEY);
    formData.append("data_type", dataType);
    formData.append("signature_version", signatureVersion);
    formData.append("signature", signature);
    formData.append("timestamp", timestamp);

    const acrRes = await fetch(`https://${ACRCLOUD_HOST}${httpUri}`, {
      method: "POST",
      body: formData,
    });

    const acrData = await acrRes.json();

    // ── 4. Analyse results ──
    const results: any = {
      raw: acrData,
      copyright_detected: false,
      matches: [] as any[],
      action: "approve",
      severity: "none",
    };

    const statusCode = acrData?.status?.code;

    if (statusCode === 0 && acrData?.metadata?.music) {
      // Music was identified
      for (const track of acrData.metadata.music) {
        const match = {
          title: track.title || "Unknown",
          artist: track.artists?.map((a: any) => a.name).join(", ") || "Unknown",
          album: track.album?.name || "",
          label: track.label || "",
          score: track.score || 0,
          duration: track.duration_ms ? Math.round(track.duration_ms / 1000) : null,
        };
        results.matches.push(match);

        // Score ≥ 70 = high confidence match → copyright issue
        if (match.score >= 70) {
          results.copyright_detected = true;
        }
      }
    }

    // Determine action
    if (results.copyright_detected) {
      results.action = "flag_review";
      results.severity = "high";
    }

    // ── 5. Auto-flag video in database ──
    if (video_id && results.copyright_detected) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      await supabase.from("videos").update({ under_review: true }).eq("id", video_id);

      // Also create a notification for the creator
      const { data: video } = await supabase.from("videos").select("creator_id, title").eq("id", video_id).single();
      if (video?.creator_id) {
        await supabase.from("notifications").insert({
          user_id: video.creator_id,
          title: "⚠️ Copyright detectado",
          message: `Áudio protegido encontrado em "${video.title}": ${results.matches.map((m: any) => `${m.title} – ${m.artist}`).join(", ")}`,
          type: "copyright",
          link: `/studio`,
        });
      }
    }

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ACRCloud scan error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
