
-- Domain listings table for web2 and web3 domains
CREATE TABLE public.domain_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  domain_name text NOT NULL,
  domain_url text NOT NULL,
  domain_type text NOT NULL DEFAULT 'web2',
  tld text,
  description text,
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USDC',
  accept_crypto boolean NOT NULL DEFAULT true,
  accept_stripe boolean NOT NULL DEFAULT false,
  registrar text,
  category text DEFAULT 'general',
  thumbnail_url text,
  status text NOT NULL DEFAULT 'active',
  views integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.domain_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Domain listings readable by all" ON public.domain_listings FOR SELECT USING (true);
CREATE POLICY "Users manage own domain listings" ON public.domain_listings FOR ALL TO authenticated
  USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

-- Domain escrow table
CREATE TABLE public.domain_escrows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.domain_listings(id) ON DELETE SET NULL,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  domain_name text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USDC',
  payment_method text NOT NULL DEFAULT 'crypto',
  payment_tx_hash text,
  stripe_payment_id text,
  status text NOT NULL DEFAULT 'pending',
  buyer_confirmed boolean NOT NULL DEFAULT false,
  seller_confirmed boolean NOT NULL DEFAULT false,
  released_at timestamp with time zone,
  disputed_at timestamp with time zone,
  dispute_reason text,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  platform_fee_pct numeric NOT NULL DEFAULT 5,
  platform_fee_amount numeric NOT NULL DEFAULT 0,
  net_to_seller numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.domain_escrows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers see own escrows" ON public.domain_escrows FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers see own escrows" ON public.domain_escrows FOR SELECT TO authenticated
  USING (auth.uid() = seller_id);
CREATE POLICY "Buyers create escrows" ON public.domain_escrows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Buyers update own escrows" ON public.domain_escrows FOR UPDATE TO authenticated
  USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers update own escrows" ON public.domain_escrows FOR UPDATE TO authenticated
  USING (auth.uid() = seller_id);
CREATE POLICY "Admins manage all escrows" ON public.domain_escrows FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Domain offers table (for negotiation)
CREATE TABLE public.domain_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.domain_listings(id) ON DELETE CASCADE NOT NULL,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  amount numeric NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.domain_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Offers readable by parties" ON public.domain_offers FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers create offers" ON public.domain_offers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Sellers update offers" ON public.domain_offers FOR UPDATE TO authenticated
  USING (auth.uid() = seller_id);
