-- Create segment automation rules table
CREATE TABLE public.segment_automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  segment_id UUID NOT NULL REFERENCES public.subscriber_segments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  field TEXT NOT NULL,
  operator TEXT NOT NULL,
  value TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.segment_automation_rules ENABLE ROW LEVEL SECURITY;

-- Admins can manage automation rules
CREATE POLICY "Admins can manage automation rules" 
ON public.segment_automation_rules 
FOR ALL 
USING (is_admin(auth.uid()));

-- Admins can view automation rules
CREATE POLICY "Admins can view automation rules" 
ON public.segment_automation_rules 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Create trigger for updating updated_at
CREATE TRIGGER update_segment_automation_rules_updated_at
BEFORE UPDATE ON public.segment_automation_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to apply automation rules
CREATE OR REPLACE FUNCTION public.apply_segment_automation_rules()
RETURNS TRIGGER AS $$
DECLARE
  rule RECORD;
  should_add BOOLEAN;
  field_value TEXT;
BEGIN
  -- Loop through all active automation rules
  FOR rule IN 
    SELECT sar.*, ss.id as seg_id 
    FROM segment_automation_rules sar
    JOIN subscriber_segments ss ON ss.id = sar.segment_id
    WHERE sar.is_active = true
  LOOP
    -- Get the field value based on the rule field
    CASE rule.field
      WHEN 'email' THEN field_value := NEW.email;
      WHEN 'name' THEN field_value := COALESCE(NEW.name, '');
      WHEN 'source' THEN field_value := COALESCE(NEW.source, '');
      ELSE field_value := '';
    END CASE;

    -- Check if the rule condition is met
    should_add := false;
    CASE rule.operator
      WHEN 'contains' THEN 
        should_add := field_value ILIKE '%' || rule.value || '%';
      WHEN 'not_contains' THEN 
        should_add := NOT (field_value ILIKE '%' || rule.value || '%');
      WHEN 'equals' THEN 
        should_add := LOWER(field_value) = LOWER(rule.value);
      WHEN 'not_equals' THEN 
        should_add := LOWER(field_value) != LOWER(rule.value);
      WHEN 'starts_with' THEN 
        should_add := field_value ILIKE rule.value || '%';
      WHEN 'ends_with' THEN 
        should_add := field_value ILIKE '%' || rule.value;
      ELSE should_add := false;
    END CASE;

    -- Add to segment if condition is met
    IF should_add THEN
      INSERT INTO subscriber_segment_members (subscriber_id, segment_id)
      VALUES (NEW.id, rule.segment_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to run automation on new subscribers
CREATE TRIGGER apply_automation_on_new_subscriber
AFTER INSERT ON public.newsletter_subscribers
FOR EACH ROW
EXECUTE FUNCTION public.apply_segment_automation_rules();

-- Create trigger to run automation on subscriber updates
CREATE TRIGGER apply_automation_on_subscriber_update
AFTER UPDATE ON public.newsletter_subscribers
FOR EACH ROW
EXECUTE FUNCTION public.apply_segment_automation_rules();