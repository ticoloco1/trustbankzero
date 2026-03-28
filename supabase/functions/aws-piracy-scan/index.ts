import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as hexEncode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── AWS Signature V4 helpers ───
function hmacSha256(key: Uint8Array, message: string): Promise<ArrayBuffer> {
  return crypto.subtle.importKey("raw", key.buffer as ArrayBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
    .then((k) => crypto.subtle.sign("HMAC", k, new TextEncoder().encode(message)));
}

async function sha256(data: string | Uint8Array): Promise<string> {
  const buf = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const hash = await crypto.subtle.digest("SHA-256", buf.buffer as ArrayBuffer);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getSignatureKey(secretKey: string, dateStamp: string, region: string, service: string) {
  let key = new TextEncoder().encode("AWS4" + secretKey);
  for (const msg of [dateStamp, region, service, "aws4_request"]) {
    key = new Uint8Array(await hmacSha256(key, msg));
  }
  return key;
}

async function signRequest(method: string, url: string, body: string, accessKey: string, secretKey: string, region: string, service: string) {
  const u = new URL(url);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const dateStamp = amzDate.slice(0, 8);
  const scope = `${dateStamp}/${region}/${service}/aws4_request`;

  const headers: Record<string, string> = {
    "content-type": "application/x-amz-json-1.1",
    host: u.host,
    "x-amz-date": amzDate,
    "x-amz-target": "RekognitionService.DetectLabels",
  };

  const signedHeadersList = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers).sort().map((k) => `${k}:${headers[k]}\n`).join("");
  const payloadHash = await sha256(body);

  const canonicalRequest = [method, u.pathname, "", canonicalHeaders, signedHeadersList, payloadHash].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256(canonicalRequest)].join("\n");

  const signingKey = await getSignatureKey(secretKey, dateStamp, region, service);
  const signatureBuf = await hmacSha256(signingKey, stringToSign);
  const signature = Array.from(new Uint8Array(signatureBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");

  headers["authorization"] = `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signedHeadersList}, Signature=${signature}`;
  return headers;
}

// ─── Piracy label detection ───
const PIRACY_LABELS = new Set([
  "movie", "cinema", "film", "television", "tv show", "series",
  "screen recording", "screenshot", "watermark", "subtitle", "closed caption",
  "cam recording", "theater", "theatre", "projector screen",
]);

const BRAND_LABELS = new Set([
  "netflix", "disney", "hbo", "amazon", "hulu", "paramount", "apple tv",
  "espn", "ufc", "wwe", "fifa", "nba", "nfl", "marvel", "warner",
]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { thumbnail_url, video_id, title, description } = await req.json();

    const AWS_ACCESS_KEY_ID = Deno.env.get("AWS_ACCESS_KEY_ID");
    const AWS_SECRET_ACCESS_KEY = Deno.env.get("AWS_SECRET_ACCESS_KEY");
    const AWS_REGION = Deno.env.get("AWS_REGION") || "us-east-1";

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      throw new Error("AWS credentials not configured");
    }

    const results: any = {
      rekognition: null,
      text_scan: null,
      piracy_detected: false,
      brand_detected: false,
      flags: [] as string[],
      action: "approve",
      severity: "none",
    };

    // ─── 1. AWS Rekognition: Analyze thumbnail ───
    if (thumbnail_url) {
      try {
        // Fetch thumbnail as bytes
        const imgResponse = await fetch(thumbnail_url);
        if (imgResponse.ok) {
          const imgBytes = new Uint8Array(await imgResponse.arrayBuffer());
          
          const rekBody = JSON.stringify({
            Image: { Bytes: btoa(String.fromCharCode(...imgBytes)) },
            MaxLabels: 30,
            MinConfidence: 60,
          });

          const rekUrl = `https://rekognition.${AWS_REGION}.amazonaws.com/`;
          const rekHeaders = await signRequest("POST", rekUrl, rekBody, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, "rekognition");

          const rekResponse = await fetch(rekUrl, {
            method: "POST",
            headers: rekHeaders,
            body: rekBody,
          });

          if (rekResponse.ok) {
            const rekData = await rekResponse.json();
            const labels = (rekData.Labels || []).map((l: any) => ({
              name: l.Name.toLowerCase(),
              confidence: l.Confidence,
            }));

            results.rekognition = labels;

            // Check for piracy indicators
            for (const label of labels) {
              if (PIRACY_LABELS.has(label.name) && label.confidence > 75) {
                results.piracy_detected = true;
                results.flags.push(`Rekognition: "${label.name}" (${label.confidence.toFixed(0)}%)`);
              }
              if (BRAND_LABELS.has(label.name) && label.confidence > 70) {
                results.brand_detected = true;
                results.flags.push(`Brand detected: "${label.name}" (${label.confidence.toFixed(0)}%)`);
              }
            }
          } else {
            console.error("Rekognition error:", await rekResponse.text());
          }
        }
      } catch (imgErr) {
        console.error("Image analysis error:", imgErr);
      }
    }

    // ─── 2. Text-based piracy scan ───
    const textToScan = `${title || ""} ${description || ""}`.toLowerCase();
    const piracyKeywords = [
      "full movie", "hd rip", "camrip", "dvdrip", "brrip", "webrip",
      "720p", "1080p", "4k", "dual audio", "dubbed", "full match",
      "full fight", "ppv", "live stream", "full album", "leaked",
      "crack", "keygen", "serial key", "nulled", "re-upload", "mirror",
      "backup copy", "free download", "torrent",
    ];

    const brandKeywords = [
      "netflix", "disney+", "hbo max", "amazon prime", "hulu",
      "paramount+", "apple tv+", "espn+", "ufc", "wwe", "fifa",
      "nba", "nfl", "marvel", "warner bros",
    ];

    for (const kw of piracyKeywords) {
      if (textToScan.includes(kw)) {
        results.piracy_detected = true;
        results.flags.push(`Text piracy keyword: "${kw}"`);
      }
    }

    for (const kw of brandKeywords) {
      if (textToScan.includes(kw)) {
        results.brand_detected = true;
        results.flags.push(`Brand keyword: "${kw}"`);
      }
    }

    // ─── 3. Determine action ───
    if (results.piracy_detected && results.brand_detected) {
      results.action = "auto_block";
      results.severity = "critical";
    } else if (results.piracy_detected || results.brand_detected) {
      results.action = "flag_review";
      results.severity = "high";
    }

    // ─── 4. Auto-action on video ───
    if (video_id && results.action !== "approve") {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      if (results.action === "auto_block") {
        await supabase.from("videos").update({ blocked: true, under_review: true }).eq("id", video_id);
      } else {
        await supabase.from("videos").update({ under_review: true }).eq("id", video_id);
      }
    }

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AWS scan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
