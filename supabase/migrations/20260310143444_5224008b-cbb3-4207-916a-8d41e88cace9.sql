-- Slug listings for user-to-user subdomain trading
CREATE TABLE public.slug_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  site_id uuid REFERENCES public.mini_sites(id) ON DELETE CASCADE NOT NULL,
  slug text NOT NULL,
  price numeric NOT NULL DEFAULT 100,
  status text NOT NULL DEFAULT 'active',
  buyer_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.slug_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Slug listings readable by all"
ON public.slug_listings FOR SELECT
USING (true);

CREATE POLICY "Sellers manage own slug listings"
ON public.slug_listings FOR ALL
TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Buyers can update to buy"
ON public.slug_listings FOR UPDATE
TO authenticated
USING (status = 'active');

-- Add sold_at to premium_slugs for platform marketplace tracking
ALTER TABLE public.premium_slugs ADD COLUMN IF NOT EXISTS sold_to uuid;
ALTER TABLE public.premium_slugs ADD COLUMN IF NOT EXISTS sold_at timestamptz;