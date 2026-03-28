
-- Company slugs: admin-only creation, sold via auction or direct sale
CREATE TABLE public.company_slugs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  display_name text,
  description text,
  logo_url text,
  price numeric NOT NULL DEFAULT 0,
  sale_type text NOT NULL DEFAULT 'direct' CHECK (sale_type IN ('direct','auction')),
  auction_ends_at timestamptz,
  min_bid numeric DEFAULT 0,
  highest_bid numeric DEFAULT 0,
  highest_bidder_id uuid,
  sold_to uuid,
  sold_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.company_slugs ENABLE ROW LEVEL SECURITY;

-- Everyone can see active company slugs
CREATE POLICY "Company slugs readable by all"
  ON public.company_slugs FOR SELECT
  TO public
  USING (true);

-- Only admins can manage company slugs
CREATE POLICY "Admins manage company slugs"
  ON public.company_slugs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Bids table
CREATE TABLE public.company_slug_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug_id uuid NOT NULL REFERENCES public.company_slugs(id) ON DELETE CASCADE,
  bidder_id uuid NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.company_slug_bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own bids"
  ON public.company_slug_bids FOR SELECT
  TO authenticated
  USING (auth.uid() = bidder_id);

CREATE POLICY "Users place bids"
  ON public.company_slug_bids FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = bidder_id);

CREATE POLICY "Admins manage bids"
  ON public.company_slug_bids FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
