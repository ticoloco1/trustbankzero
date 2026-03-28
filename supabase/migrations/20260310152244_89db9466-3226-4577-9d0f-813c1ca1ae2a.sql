
-- Slug registrations: annual renewal system
CREATE TABLE public.slug_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  slug text NOT NULL,
  site_id uuid REFERENCES public.mini_sites(id) ON DELETE SET NULL,
  registration_fee numeric NOT NULL DEFAULT 12.00,
  renewal_fee numeric NOT NULL DEFAULT 12.00,
  registered_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '1 year'),
  renewed_at timestamp with time zone,
  status text NOT NULL DEFAULT 'active',
  is_free_with_plan boolean NOT NULL DEFAULT false,
  slug_type text NOT NULL DEFAULT 'standard',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(slug)
);

ALTER TABLE public.slug_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own registrations" ON public.slug_registrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own registrations" ON public.slug_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own registrations" ON public.slug_registrations FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all registrations" ON public.slug_registrations FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public read active registrations" ON public.slug_registrations FOR SELECT USING (status = 'active');

-- Add slug_expires_at to mini_sites
ALTER TABLE public.mini_sites ADD COLUMN IF NOT EXISTS slug_expires_at timestamp with time zone;
ALTER TABLE public.mini_sites ADD COLUMN IF NOT EXISTS slug_registration_id uuid REFERENCES public.slug_registrations(id);
