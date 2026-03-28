
-- Company accounts for CV access subscription ($399/month)
CREATE TABLE public.company_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_name text NOT NULL,
  company_email text,
  company_logo_url text,
  plan_price numeric NOT NULL DEFAULT 399,
  status text NOT NULL DEFAULT 'active',
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;

-- Companies see own subscription
CREATE POLICY "Companies see own subscription"
  ON public.company_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Companies insert own subscription
CREATE POLICY "Companies insert own subscription"
  ON public.company_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Companies update own subscription
CREATE POLICY "Companies update own subscription"
  ON public.company_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins manage all
CREATE POLICY "Admins manage company subscriptions"
  ON public.company_subscriptions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all subscriptions
CREATE POLICY "Admins read all company subscriptions"
  ON public.company_subscriptions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
