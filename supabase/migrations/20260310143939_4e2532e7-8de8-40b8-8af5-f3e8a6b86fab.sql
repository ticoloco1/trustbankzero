
-- Slug auctions table
CREATE TABLE public.slug_auctions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug_id uuid REFERENCES public.premium_slugs(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  starting_price numeric NOT NULL DEFAULT 100,
  current_bid numeric NOT NULL DEFAULT 0,
  current_bidder_id uuid,
  min_increment numeric NOT NULL DEFAULT 10,
  ends_at timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.slug_auctions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auctions readable by all" ON public.slug_auctions FOR SELECT USING (true);
CREATE POLICY "Admins manage auctions" ON public.slug_auctions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Slug auction bids table
CREATE TABLE public.slug_auction_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id uuid REFERENCES public.slug_auctions(id) ON DELETE CASCADE NOT NULL,
  bidder_id uuid NOT NULL,
  amount numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.slug_auction_bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bids readable by all" ON public.slug_auction_bids FOR SELECT USING (true);
CREATE POLICY "Authenticated users place bids" ON public.slug_auction_bids FOR INSERT TO authenticated WITH CHECK (auth.uid() = bidder_id);
