-- Add tracking columns to scheduled_campaigns
ALTER TABLE public.scheduled_campaigns 
ADD COLUMN IF NOT EXISTS open_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS click_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS tracking_id UUID DEFAULT gen_random_uuid();

-- Create campaign_events table for detailed tracking
CREATE TABLE public.campaign_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.scheduled_campaigns(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('open', 'click')),
  recipient_email TEXT,
  link_url TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaign_events ENABLE ROW LEVEL SECURITY;

-- Admins can view events
CREATE POLICY "Admins can view campaign events"
ON public.campaign_events
FOR SELECT
USING (is_admin(auth.uid()));

-- Allow insert from edge functions (public insert for tracking pixel)
CREATE POLICY "Anyone can insert events"
ON public.campaign_events
FOR INSERT
WITH CHECK (true);