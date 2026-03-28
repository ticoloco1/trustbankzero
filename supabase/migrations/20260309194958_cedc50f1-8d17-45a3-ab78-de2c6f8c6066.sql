
CREATE TABLE public.premium_slugs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL UNIQUE,
  price numeric NOT NULL DEFAULT 500,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.premium_slugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Premium slugs readable by all" ON public.premium_slugs FOR SELECT TO public USING (true);
CREATE POLICY "Admins manage premium slugs" ON public.premium_slugs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
