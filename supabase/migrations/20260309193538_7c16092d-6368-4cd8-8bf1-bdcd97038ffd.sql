
ALTER TABLE public.mini_sites ADD COLUMN IF NOT EXISTS blocked boolean NOT NULL DEFAULT false;
ALTER TABLE public.mini_sites ADD COLUMN IF NOT EXISTS monthly_plan text NOT NULL DEFAULT 'free';
ALTER TABLE public.mini_sites ADD COLUMN IF NOT EXISTS plan_expires_at timestamp with time zone;

ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS minisite_monthly_price numeric NOT NULL DEFAULT 9.90;
ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS minisite_pro_price numeric NOT NULL DEFAULT 29.90;
ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS minisite_subdomain_1char numeric NOT NULL DEFAULT 2000;
ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS minisite_subdomain_2char numeric NOT NULL DEFAULT 1500;
ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS minisite_subdomain_3char numeric NOT NULL DEFAULT 1000;
ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS minisite_subdomain_4char numeric NOT NULL DEFAULT 500;
ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS minisite_enabled boolean NOT NULL DEFAULT true;
