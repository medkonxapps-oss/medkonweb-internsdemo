-- Add recurring campaign fields to scheduled_campaigns table
ALTER TABLE public.scheduled_campaigns
ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_pattern text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS recurrence_end_date timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_sent_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS next_scheduled_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS parent_campaign_id uuid DEFAULT NULL REFERENCES public.scheduled_campaigns(id) ON DELETE SET NULL;

-- Create link_clicks table for detailed heatmap tracking
CREATE TABLE public.link_clicks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES public.scheduled_campaigns(id) ON DELETE CASCADE,
  link_url text NOT NULL,
  link_text text,
  click_count integer DEFAULT 0,
  unique_clicks integer DEFAULT 0,
  first_clicked_at timestamp with time zone DEFAULT now(),
  last_clicked_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_link_clicks_campaign ON public.link_clicks(campaign_id);
CREATE INDEX idx_link_clicks_url ON public.link_clicks(link_url);

-- Enable RLS
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

-- Policies for link_clicks
CREATE POLICY "Admins can view link clicks" ON public.link_clicks
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage link clicks" ON public.link_clicks
FOR ALL USING (is_admin(auth.uid()));

-- Function to increment or create link click record
CREATE OR REPLACE FUNCTION public.track_link_click(
  p_campaign_id uuid,
  p_link_url text,
  p_link_text text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO link_clicks (campaign_id, link_url, link_text, click_count, unique_clicks, last_clicked_at)
  VALUES (p_campaign_id, p_link_url, p_link_text, 1, 1, now())
  ON CONFLICT (campaign_id, link_url) 
  DO UPDATE SET 
    click_count = link_clicks.click_count + 1,
    last_clicked_at = now();
END;
$$;

-- Add unique constraint for campaign_id + link_url
ALTER TABLE public.link_clicks ADD CONSTRAINT link_clicks_campaign_url_unique UNIQUE (campaign_id, link_url);