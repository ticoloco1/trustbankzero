import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id } = await req.json();
    if (!user_id) throw new Error("user_id required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Get the badge request
    const { data: badge, error: fetchErr } = await supabase
      .from("verification_badges")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (fetchErr || !badge) throw new Error("Badge request not found");

    const kycData = badge.kyc_data as any;
    const fullName = kycData?.full_name || "";
    const docNumber = kycData?.document_number || "";

    // Use AI to analyze KYC data
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let aiApproved = false;
    let aiResult: any = { method: "rules" };

    if (LOVABLE_API_KEY) {
      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `You are a KYC verification AI. Analyze the following data and determine if it's valid for identity verification. 
                Return a JSON with: { "approved": boolean, "reason": string, "confidence": number (0-1) }
                Rules: Name must be at least 2 words, document number must be at least 8 chars and contain digits.
                For companies, company name must be provided.
                Be strict but fair. Approve if data looks legitimate.`
              },
              {
                role: "user",
                content: JSON.stringify({
                  badge_type: badge.badge_type,
                  full_name: fullName,
                  document_number: docNumber,
                  company_name: badge.company_name,
                })
              }
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "kyc_decision",
                  description: "Return KYC verification decision",
                  parameters: {
                    type: "object",
                    properties: {
                      approved: { type: "boolean" },
                      reason: { type: "string" },
                      confidence: { type: "number" }
                    },
                    required: ["approved", "reason", "confidence"],
                    additionalProperties: false
                  }
                }
              }
            ],
            tool_choice: { type: "function", function: { name: "kyc_decision" } },
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
          if (toolCall) {
            aiResult = JSON.parse(toolCall.function.arguments);
            aiApproved = aiResult.approved && aiResult.confidence >= 0.6;
            aiResult.method = "ai";
          }
        }
      } catch (e) {
        console.error("AI review failed, falling back to rules:", e);
      }
    }

    // Fallback rules-based check
    if (aiResult.method === "rules") {
      const nameWords = fullName.trim().split(/\s+/).length;
      const docDigits = (docNumber.match(/\d/g) || []).length;
      aiApproved = nameWords >= 2 && docDigits >= 8;
      if (badge.badge_type === "company" && !badge.company_name) aiApproved = false;
      aiResult = { approved: aiApproved, reason: aiApproved ? "Rules-based approval" : "Insufficient data", confidence: aiApproved ? 0.8 : 0.3, method: "rules" };
    }

    // Update badge status
    const { error: updateErr } = await supabase
      .from("verification_badges")
      .update({
        status: aiApproved ? "active" : "rejected",
        ai_review_result: aiResult,
        kyc_verified_at: aiApproved ? new Date().toISOString() : null,
      })
      .eq("user_id", user_id);

    if (updateErr) throw updateErr;

    return new Response(JSON.stringify({ approved: aiApproved, result: aiResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("verify-kyc error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
