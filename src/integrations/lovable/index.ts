import { supabase } from "../supabase/client";

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple", opts?: any) => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: { redirectTo: opts?.redirect_uri || window.location.origin },
      });
      if (error) return { error };
      return { data };
    },
  },
};
