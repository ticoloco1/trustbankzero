import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, description, thumbnail_url, video_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `You are a strict content moderation AI for a video exchange platform. Analyze the following video metadata and return a JSON assessment.

Title: "${title || ""}"
Description: "${description || ""}"
Thumbnail URL: "${thumbnail_url || "none"}"

Evaluate for ALL of the following categories:

1. **PIRACY DETECTION** (CRITICAL):
   - Movies/series keywords: "Full Movie", "HD Rip", "CAMRip", "DVDRip", "BRRip", "WEBRip", "720p", "1080p", "4K", "Dual Audio", "Dubbed", "Subtitle"
   - Sports piracy: "Full Match", "Full Fight", "PPV", "Live Stream" + sports terms
   - Music piracy: "Full Album", "Discography", "Leaked"
   - Software piracy: "Crack", "Keygen", "Serial Key", "Patch", "Nulled"

2. **COPYRIGHT VIOLATIONS** (CRITICAL):
   - Unauthorized use of brand names: Netflix, Disney+, HBO, Amazon Prime, Hulu, Apple TV+, Paramount+, ESPN, UFC, WWE, FIFA, NBA, NFL
   - Reupload indicators: "Re-upload", "Mirror", "Backup copy"
   - Content claiming to be from these platforms without authorization

3. **PROHIBITED CONTENT**:
   - Extreme violence, gore, torture
   - Nudity, pornography, sexual content
   - Hate speech, discrimination, extremism
   - Scams, fraud, phishing ("Free money", "Get rich quick", "Send crypto")
   - Self-harm, suicide encouragement
   - Child exploitation (HIGHEST PRIORITY)

4. **SPAM INDICATORS**:
   - Clickbait patterns, misleading titles
   - Excessive emoji/caps in title
   - Crypto pump schemes

Return ONLY valid JSON:
{
  "safe": true/false,
  "score": 0.0-1.0 (1 = perfectly safe),
  "action": "approve" | "flag_review" | "auto_block",
  "flags": ["list of specific concerns"],
  "piracy_detected": true/false,
  "copyright_violation": true/false,
  "prohibited_content": true/false,
  "spam_detected": true/false,
  "severity": "none" | "low" | "medium" | "high" | "critical",
  "category_suggestion": "suggested category",
  "summary": "brief assessment explaining the decision"
}

RULES:
- If piracy or copyright violation detected → action: "auto_block", severity: "critical"
- If child exploitation suspected → action: "auto_block", severity: "critical"
- If prohibited content detected → action: "auto_block" for critical, "flag_review" for medium
- If spam detected → action: "flag_review"
- If score < 0.3 → action: "auto_block"
- If score 0.3-0.7 → action: "flag_review"
- If score > 0.7 → action: "approve"`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a strict content moderation AI. Return only valid JSON. Be aggressive in detecting piracy and copyright violations." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      throw new Error(`AI gateway error: ${response.status} ${t}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    let assessment;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      assessment = jsonMatch ? JSON.parse(jsonMatch[0]) : { safe: true, score: 1, action: "approve", flags: [], summary: "Could not parse" };
    } catch {
      assessment = { safe: true, score: 1, action: "approve", flags: [], summary: "Parse error" };
    }

    // Auto-action if video_id provided
    if (video_id && (assessment.action === "auto_block" || assessment.action === "flag_review")) {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      
      if (assessment.action === "auto_block") {
        await supabase.from("videos").update({ blocked: true, under_review: true }).eq("id", video_id);
      } else {
        await supabase.from("videos").update({ under_review: true }).eq("id", video_id);
      }
    }

    return new Response(JSON.stringify({ success: true, assessment }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Moderation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
