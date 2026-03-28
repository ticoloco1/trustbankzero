import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export function useMyBadge() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-badge", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("verification_badges")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });
}

export function useUserBadge(userId: string | null) {
  return useQuery({
    queryKey: ["user-badge", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("verification_badges")
        .select("badge_type, status")
        .eq("user_id", userId!)
        .eq("status", "active")
        .maybeSingle();
      return data;
    },
    enabled: !!userId,
  });
}

export function useRequestBadge() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      badge_type: "personal" | "company";
      plan_type: "monthly" | "annual";
      company_name?: string;
      full_name?: string;
      document_number?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const isCompany = params.badge_type === "company";
      const monthlyPrice = isCompany ? 41.67 : 8.00; // $500/12 for company
      const annualPrice = isCompany ? 450.00 : 86.40; // 10% discount
      const isAnnual = params.plan_type === "annual";
      const paidAmount = isAnnual ? annualPrice : monthlyPrice;

      const expiresAt = new Date();
      if (isAnnual) {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      // Badge starts as "pending_payment" — only after payment confirmation does it go to "pending" for AI review
      const { error } = await supabase.from("verification_badges").upsert({
        user_id: user.id,
        badge_type: params.badge_type,
        plan_type: params.plan_type,
        monthly_price: monthlyPrice,
        annual_price: annualPrice,
        paid_amount: paidAmount,
        company_name: params.company_name || null,
        kyc_data: {
          full_name: params.full_name,
          document_number: params.document_number,
        },
        status: "pending_payment",
        expires_at: expiresAt.toISOString(),
      } as any);
      if (error) throw error;

      // NOTE: AI review is only triggered after payment confirmation
      // For now, user sees "pending_payment" status until payment is processed
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-badge"] });
    },
  });
}
