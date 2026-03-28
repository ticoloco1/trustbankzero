
-- Verification badges table
CREATE TABLE public.verification_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_type text NOT NULL DEFAULT 'personal',
  status text NOT NULL DEFAULT 'pending',
  plan_type text NOT NULL DEFAULT 'monthly',
  monthly_price numeric NOT NULL DEFAULT 8.00,
  annual_price numeric NOT NULL DEFAULT 86.40,
  paid_amount numeric NOT NULL DEFAULT 0,
  kyc_data jsonb DEFAULT '{}',
  kyc_verified_at timestamp with time zone,
  ai_review_result jsonb,
  company_name text,
  company_doc text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.verification_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own badge" ON public.verification_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own badge" ON public.verification_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own badge" ON public.verification_badges FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all badges" ON public.verification_badges FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public read active badges" ON public.verification_badges FOR SELECT USING (status = 'active');

-- Slug transactions table for 5% fee tracking
CREATE TABLE public.slug_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid,
  auction_id uuid,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  slug text NOT NULL,
  amount numeric NOT NULL,
  platform_fee_pct numeric NOT NULL DEFAULT 5,
  platform_fee_amount numeric NOT NULL DEFAULT 0,
  net_to_seller numeric NOT NULL DEFAULT 0,
  tx_type text NOT NULL DEFAULT 'sale',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.slug_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own slug transactions" ON public.slug_transactions FOR SELECT TO authenticated USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users insert slug transactions" ON public.slug_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Admins manage slug transactions" ON public.slug_transactions FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));
