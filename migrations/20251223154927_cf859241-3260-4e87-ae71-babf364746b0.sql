-- Create subscriber_segments table
CREATE TABLE public.subscriber_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriber_segments ENABLE ROW LEVEL SECURITY;

-- Admins can manage segments
CREATE POLICY "Admins can manage segments"
ON public.subscriber_segments
FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view segments"
ON public.subscriber_segments
FOR SELECT
USING (is_admin(auth.uid()));

-- Create junction table for many-to-many relationship
CREATE TABLE public.subscriber_segment_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID NOT NULL REFERENCES public.newsletter_subscribers(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES public.subscriber_segments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subscriber_id, segment_id)
);

-- Enable RLS
ALTER TABLE public.subscriber_segment_members ENABLE ROW LEVEL SECURITY;

-- Admins can manage segment members
CREATE POLICY "Admins can manage segment members"
ON public.subscriber_segment_members
FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view segment members"
ON public.subscriber_segment_members
FOR SELECT
USING (is_admin(auth.uid()));

-- Add custom_fields to newsletter_subscribers for merge fields
ALTER TABLE public.newsletter_subscribers
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- Create template_variables settings
INSERT INTO public.settings (key, value, description)
VALUES (
  'template_variables',
  '{"company_name": "Your Company", "website_url": "https://example.com", "support_email": "support@example.com"}'::jsonb,
  'Custom variables available in email templates'
) ON CONFLICT (key) DO NOTHING;