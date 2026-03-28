
-- Add plan pricing columns to platform_settings
ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS hosting_plan_bunny_price numeric NOT NULL DEFAULT 19.90,
  ADD COLUMN IF NOT EXISTS hosting_plan_youtube_price numeric NOT NULL DEFAULT 5.99,
  ADD COLUMN IF NOT EXISTS paywall_min_price numeric NOT NULL DEFAULT 0.60;

-- Create private_video_urls table for protected youtube video IDs
CREATE TABLE IF NOT EXISTS public.private_video_urls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.mini_site_videos(id) ON DELETE CASCADE,
  youtube_video_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  UNIQUE(video_id)
);

ALTER TABLE public.private_video_urls ENABLE ROW LEVEL SECURITY;

-- Only the owner can see/manage their private video URLs
CREATE POLICY "Owners manage own private urls"
  ON public.private_video_urls FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can see all
CREATE POLICY "Admins manage all private urls"
  ON public.private_video_urls FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
