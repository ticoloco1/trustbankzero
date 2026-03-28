import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedVideoResponse {
  encrypted_video_id?: string;
  iv?: string;
  key?: string;
  expires_at?: number;
  algorithm?: string;
  youtube_video_id?: string;
  locked?: boolean;
  error?: string;
}

// AES-256-GCM decryption in the browser
async function decryptAes(ciphertext: string, ivB64: string, keyB64: string): Promise<string> {
  const ciphertextBuf = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const rawKey = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertextBuf);

  return new TextDecoder().decode(decrypted);
}

export function useProtectedVideo(videoId: string | undefined) {
  return useQuery({
    queryKey: ["protected-video", videoId],
    queryFn: async (): Promise<{ youtube_video_id?: string; locked?: boolean; error?: string }> => {
      const { data, error } = await supabase.functions.invoke("get-protected-video", {
        body: { video_id: videoId },
      });
      if (error) throw error;

      const response = data as ProtectedVideoResponse;

      // If encrypted, decrypt on client
      if (response.encrypted_video_id && response.iv && response.key) {
        try {
          const decrypted = await decryptAes(response.encrypted_video_id, response.iv, response.key);
          return { youtube_video_id: decrypted };
        } catch {
          return { error: "Decryption failed", locked: true };
        }
      }

      // Legacy plain response
      if (response.youtube_video_id) {
        return { youtube_video_id: response.youtube_video_id };
      }

      return { locked: response.locked ?? true, error: response.error };
    },
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000,
  });
}
