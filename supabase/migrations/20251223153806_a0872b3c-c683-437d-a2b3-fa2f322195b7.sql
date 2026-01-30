-- Create helper functions for incrementing counts
CREATE OR REPLACE FUNCTION public.increment_campaign_open(campaign_uuid UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE scheduled_campaigns 
  SET open_count = open_count + 1 
  WHERE id = campaign_uuid;
$$;

CREATE OR REPLACE FUNCTION public.increment_campaign_click(campaign_uuid UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE scheduled_campaigns 
  SET click_count = click_count + 1 
  WHERE id = campaign_uuid;
$$;