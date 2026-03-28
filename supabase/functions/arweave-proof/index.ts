import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Generate SHA-256 content hash for Arweave proof
async function sha256Hex(data: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { video_id, title, description, thumbnail_url, creator_id } = await req.json();
    if (!video_id || !title) throw new Error("video_id and title required");

    // ─── 1. Generate content fingerprint ───
    const contentPayload = JSON.stringify({
      video_id,
      title,
      description: description || "",
      thumbnail_url: thumbnail_url || "",
      timestamp: new Date().toISOString(),
    });

    const contentHash = await sha256Hex(contentPayload);

    // ─── 2. Create Arweave-compatible data transaction ───
    // We use Arweave's HTTP API to create a data item
    // For production, you'd use a full wallet signing flow
    // Here we store the hash on-chain via arweave.net gateway
    
    const arweaveData = {
      content_hash: contentHash,
      video_id,
      title,
      creator_id: creator_id || "anonymous",
      platform: "TrustBank",
      timestamp: new Date().toISOString(),
      type: "content-proof-of-authorship",
    };

    let arweaveTxId: string | null = null;
    let arweaveStatus = "pending";

    try {
      // Use Arweave GraphQL gateway to store proof
      // In production with a funded wallet, this would submit a real transaction
      // For now, we generate a deterministic proof hash that can be verified
      const proofHash = await sha256Hex(JSON.stringify(arweaveData));
      
      // Attempt to submit to Arweave via bundlr/irys (free for small data)
      const irysResponse = await fetch("https://node1.irys.xyz/tx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: btoa(JSON.stringify(arweaveData)),
          tags: [
            { name: "Content-Type", value: "application/json" },
            { name: "App-Name", value: "TrustBank" },
            { name: "Content-Hash", value: contentHash },
            { name: "Video-Id", value: video_id },
            { name: "Type", value: "proof-of-authorship" },
          ],
        }),
      });

      if (irysResponse.ok) {
        const irysData = await irysResponse.json();
        arweaveTxId = irysData.id || proofHash;
        arweaveStatus = "confirmed";
      } else {
        // Fallback: store proof hash locally
        arweaveTxId = proofHash;
        arweaveStatus = "local_proof";
      }
    } catch (arErr) {
      console.error("Arweave submission error:", arErr);
      const proofHash = await sha256Hex(JSON.stringify(arweaveData));
      arweaveTxId = proofHash;
      arweaveStatus = "local_proof";
    }

    // ─── 3. Store proof in database ───
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Update video with arweave hash
    await supabase.from("videos")
      .update({
        metadata_hash: contentHash,
        video_hash: arweaveTxId,
      })
      .eq("id", video_id);

    return new Response(JSON.stringify({
      success: true,
      content_hash: contentHash,
      arweave_tx_id: arweaveTxId,
      arweave_status: arweaveStatus,
      proof_data: arweaveData,
      verification_url: arweaveStatus === "confirmed"
        ? `https://arweave.net/${arweaveTxId}`
        : null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Arweave proof error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
