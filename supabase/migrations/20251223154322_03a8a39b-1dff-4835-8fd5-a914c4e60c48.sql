-- Create email_templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Admins can manage templates
CREATE POLICY "Admins can manage templates"
ON public.email_templates
FOR ALL
USING (is_admin(auth.uid()));

-- Admins can view templates
CREATE POLICY "Admins can view templates"
ON public.email_templates
FOR SELECT
USING (is_admin(auth.uid()));

-- Add unsubscribe_token to newsletter_subscribers
ALTER TABLE public.newsletter_subscribers
ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT gen_random_uuid();

-- Create index for token lookup
CREATE INDEX IF NOT EXISTS idx_subscribers_unsubscribe_token 
ON public.newsletter_subscribers(unsubscribe_token);

-- Track unsubscribe events
ALTER TABLE public.campaign_events
DROP CONSTRAINT IF EXISTS campaign_events_event_type_check;

ALTER TABLE public.campaign_events
ADD CONSTRAINT campaign_events_event_type_check 
CHECK (event_type IN ('open', 'click', 'unsubscribe'));