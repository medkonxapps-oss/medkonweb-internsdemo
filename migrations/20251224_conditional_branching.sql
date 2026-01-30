-- Enhanced Workflow System with Conditional Branching
-- This migration adds support for IF/ELSE logic and multiple workflow paths

-- Add branching support to workflow steps
ALTER TABLE public.workflow_steps ADD COLUMN IF NOT EXISTS step_type TEXT DEFAULT 'email'; -- email, condition, action, delay
ALTER TABLE public.workflow_steps ADD COLUMN IF NOT EXISTS condition_field TEXT;
ALTER TABLE public.workflow_steps ADD COLUMN IF NOT EXISTS condition_operator TEXT; -- equals, not_equals, contains, greater_than, less_than, exists
ALTER TABLE public.workflow_steps ADD COLUMN IF NOT EXISTS condition_value TEXT;
ALTER TABLE public.workflow_steps ADD COLUMN IF NOT EXISTS true_next_step INTEGER; -- step to go to if condition is true
ALTER TABLE public.workflow_steps ADD COLUMN IF NOT EXISTS false_next_step INTEGER; -- step to go to if condition is false
ALTER TABLE public.workflow_steps ADD COLUMN IF NOT EXISTS action_type TEXT; -- create_task, send_notification, update_field, add_tag
ALTER TABLE public.workflow_steps ADD COLUMN IF NOT EXISTS action_params JSONB DEFAULT '{}';

-- Create workflow branches table for complex branching
CREATE TABLE IF NOT EXISTS public.workflow_branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.email_workflows(id) ON DELETE CASCADE,
  parent_step_id UUID NOT NULL REFERENCES public.workflow_steps(id) ON DELETE CASCADE,
  condition_field TEXT NOT NULL,
  condition_operator TEXT NOT NULL,
  condition_value TEXT,
  branch_name TEXT NOT NULL,
  next_step_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow tags table for subscriber tagging
CREATE TABLE IF NOT EXISTS public.workflow_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3B82F6',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscriber tags junction table
CREATE TABLE IF NOT EXISTS public.subscriber_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID NOT NULL REFERENCES public.newsletter_subscribers(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.workflow_tags(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subscriber_id, tag_id)
);

-- Add custom fields to subscribers for conditional logic
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0;
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS engagement_level TEXT DEFAULT 'new'; -- new, engaged, highly_engaged, inactive
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS total_opens INTEGER DEFAULT 0;
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0;
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS purchase_count INTEGER DEFAULT 0;
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10,2) DEFAULT 0;

-- Enable RLS for new tables
ALTER TABLE public.workflow_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriber_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage workflow branches" ON public.workflow_branches
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage workflow tags" ON public.workflow_tags
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage subscriber tags" ON public.subscriber_tags
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Function to evaluate workflow conditions
CREATE OR REPLACE FUNCTION public.evaluate_workflow_condition(
  p_subscriber_id UUID,
  p_condition_field TEXT,
  p_condition_operator TEXT,
  p_condition_value TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_field_value TEXT;
  v_numeric_value NUMERIC;
  v_condition_numeric NUMERIC;
BEGIN
  -- Get the field value from subscriber
  CASE p_condition_field
    WHEN 'email' THEN
      SELECT email INTO v_field_value FROM newsletter_subscribers WHERE id = p_subscriber_id;
    WHEN 'name' THEN
      SELECT name INTO v_field_value FROM newsletter_subscribers WHERE id = p_subscriber_id;
    WHEN 'lead_score' THEN
      SELECT lead_score::TEXT INTO v_field_value FROM newsletter_subscribers WHERE id = p_subscriber_id;
    WHEN 'engagement_level' THEN
      SELECT engagement_level INTO v_field_value FROM newsletter_subscribers WHERE id = p_subscriber_id;
    WHEN 'total_opens' THEN
      SELECT total_opens::TEXT INTO v_field_value FROM newsletter_subscribers WHERE id = p_subscriber_id;
    WHEN 'total_clicks' THEN
      SELECT total_clicks::TEXT INTO v_field_value FROM newsletter_subscribers WHERE id = p_subscriber_id;
    WHEN 'purchase_count' THEN
      SELECT purchase_count::TEXT INTO v_field_value FROM newsletter_subscribers WHERE id = p_subscriber_id;
    WHEN 'total_spent' THEN
      SELECT total_spent::TEXT INTO v_field_value FROM newsletter_subscribers WHERE id = p_subscriber_id;
    WHEN 'has_tag' THEN
      -- Check if subscriber has a specific tag
      SELECT CASE WHEN EXISTS(
        SELECT 1 FROM subscriber_tags st 
        JOIN workflow_tags wt ON st.tag_id = wt.id 
        WHERE st.subscriber_id = p_subscriber_id AND wt.name = p_condition_value
      ) THEN 'true' ELSE 'false' END INTO v_field_value;
    ELSE
      v_field_value := '';
  END CASE;

  -- Evaluate condition based on operator
  CASE p_condition_operator
    WHEN 'equals' THEN
      RETURN LOWER(v_field_value) = LOWER(p_condition_value);
    WHEN 'not_equals' THEN
      RETURN LOWER(v_field_value) != LOWER(p_condition_value);
    WHEN 'contains' THEN
      RETURN v_field_value ILIKE '%' || p_condition_value || '%';
    WHEN 'not_contains' THEN
      RETURN v_field_value NOT ILIKE '%' || p_condition_value || '%';
    WHEN 'starts_with' THEN
      RETURN v_field_value ILIKE p_condition_value || '%';
    WHEN 'ends_with' THEN
      RETURN v_field_value ILIKE '%' || p_condition_value;
    WHEN 'greater_than' THEN
      BEGIN
        v_numeric_value := v_field_value::NUMERIC;
        v_condition_numeric := p_condition_value::NUMERIC;
        RETURN v_numeric_value > v_condition_numeric;
      EXCEPTION WHEN OTHERS THEN
        RETURN FALSE;
      END;
    WHEN 'less_than' THEN
      BEGIN
        v_numeric_value := v_field_value::NUMERIC;
        v_condition_numeric := p_condition_value::NUMERIC;
        RETURN v_numeric_value < v_condition_numeric;
      EXCEPTION WHEN OTHERS THEN
        RETURN FALSE;
      END;
    WHEN 'greater_equal' THEN
      BEGIN
        v_numeric_value := v_field_value::NUMERIC;
        v_condition_numeric := p_condition_value::NUMERIC;
        RETURN v_numeric_value >= v_condition_numeric;
      EXCEPTION WHEN OTHERS THEN
        RETURN FALSE;
      END;
    WHEN 'less_equal' THEN
      BEGIN
        v_numeric_value := v_field_value::NUMERIC;
        v_condition_numeric := p_condition_value::NUMERIC;
        RETURN v_numeric_value <= v_condition_numeric;
      EXCEPTION WHEN OTHERS THEN
        RETURN FALSE;
      END;
    WHEN 'exists' THEN
      RETURN v_field_value IS NOT NULL AND v_field_value != '';
    WHEN 'not_exists' THEN
      RETURN v_field_value IS NULL OR v_field_value = '';
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$;

-- Function to add tag to subscriber
CREATE OR REPLACE FUNCTION public.add_tag_to_subscriber(
  p_subscriber_id UUID,
  p_tag_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tag_id UUID;
BEGIN
  -- Get or create tag
  SELECT id INTO v_tag_id FROM workflow_tags WHERE name = p_tag_name;
  
  IF v_tag_id IS NULL THEN
    INSERT INTO workflow_tags (name) VALUES (p_tag_name) RETURNING id INTO v_tag_id;
  END IF;
  
  -- Add tag to subscriber (ignore if already exists)
  INSERT INTO subscriber_tags (subscriber_id, tag_id)
  VALUES (p_subscriber_id, v_tag_id)
  ON CONFLICT (subscriber_id, tag_id) DO NOTHING;
END;
$$;

-- Function to execute workflow action
CREATE OR REPLACE FUNCTION public.execute_workflow_action(
  p_subscriber_id UUID,
  p_action_type TEXT,
  p_action_params JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task_id UUID;
  v_user_id UUID;
BEGIN
  CASE p_action_type
    WHEN 'add_tag' THEN
      PERFORM add_tag_to_subscriber(p_subscriber_id, p_action_params->>'tag_name');
    
    WHEN 'update_lead_score' THEN
      UPDATE newsletter_subscribers 
      SET lead_score = COALESCE(lead_score, 0) + (p_action_params->>'score_change')::INTEGER
      WHERE id = p_subscriber_id;
    
    WHEN 'update_engagement' THEN
      UPDATE newsletter_subscribers 
      SET engagement_level = p_action_params->>'engagement_level'
      WHERE id = p_subscriber_id;
    
    WHEN 'create_task' THEN
      -- Find an admin user to assign the task
      SELECT id INTO v_user_id FROM profiles 
      WHERE id IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'super_admin'))
      LIMIT 1;
      
      IF v_user_id IS NOT NULL THEN
        SELECT create_automated_task(
          p_action_params->>'title',
          p_action_params->>'description',
          v_user_id,
          CASE WHEN p_action_params->>'due_days' IS NOT NULL 
            THEN now() + ((p_action_params->>'due_days')::INTEGER || ' days')::INTERVAL 
            ELSE NULL 
          END,
          COALESCE(p_action_params->>'priority', 'medium'),
          'subscriber',
          p_subscriber_id
        ) INTO v_task_id;
      END IF;
    
    WHEN 'send_notification' THEN
      -- Find admin users to notify
      FOR v_user_id IN 
        SELECT user_id FROM user_roles WHERE role IN ('admin', 'super_admin')
      LOOP
        PERFORM create_notification(
          v_user_id,
          p_action_params->>'title',
          p_action_params->>'message',
          COALESCE(p_action_params->>'type', 'info'),
          p_action_params->>'link'
        );
      END LOOP;
    
    ELSE
      -- Unknown action type, do nothing
      NULL;
  END CASE;
END;
$$;

-- Insert some default workflow tags
INSERT INTO public.workflow_tags (name, color, description) VALUES
  ('VIP', '#FFD700', 'High-value customers'),
  ('Engaged', '#10B981', 'Highly engaged subscribers'),
  ('New', '#3B82F6', 'New subscribers'),
  ('Inactive', '#EF4444', 'Inactive subscribers'),
  ('Potential Customer', '#8B5CF6', 'Likely to purchase'),
  ('Churned', '#6B7280', 'Unsubscribed or inactive')
ON CONFLICT (name) DO NOTHING;