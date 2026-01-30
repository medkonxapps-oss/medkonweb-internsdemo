-- Create email workflows table for drip campaigns and automation sequences
CREATE TABLE public.email_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL DEFAULT 'manual', -- manual, on_subscribe, on_segment_join, on_lead_create, time_based
  trigger_value TEXT, -- segment_id for segment trigger, or cron expression for time_based
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow steps table for the email sequence
CREATE TABLE public.workflow_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.email_workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  delay_value INTEGER NOT NULL DEFAULT 0, -- delay from previous step
  delay_unit TEXT NOT NULL DEFAULT 'hours', -- minutes, hours, days, weeks
  condition_field TEXT, -- optional condition to check
  condition_operator TEXT,
  condition_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow executions table to track running workflows for each subscriber
CREATE TABLE public.workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.email_workflows(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES public.newsletter_subscribers(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, paused, cancelled
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  next_step_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  UNIQUE(workflow_id, subscriber_id)
);

-- Create workflow step logs to track sent emails
CREATE TABLE public.workflow_step_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id UUID NOT NULL REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public.workflow_steps(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'sent', -- sent, failed, skipped
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  error_message TEXT
);

-- Enable RLS
ALTER TABLE public.email_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_step_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_workflows
CREATE POLICY "Admins can manage workflows" ON public.email_workflows
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage workflow steps" ON public.workflow_steps
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.email_workflows w WHERE w.id = workflow_id AND public.is_admin(auth.uid()))
  );

CREATE POLICY "Admins can manage workflow executions" ON public.workflow_executions
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage workflow step logs" ON public.workflow_step_logs
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_email_workflows_updated_at
  BEFORE UPDATE ON public.email_workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_steps_updated_at
  BEFORE UPDATE ON public.workflow_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to start workflow for a subscriber
CREATE OR REPLACE FUNCTION public.start_workflow_for_subscriber(p_workflow_id UUID, p_subscriber_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_execution_id UUID;
  v_first_step workflow_steps%ROWTYPE;
  v_next_step_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get the first step
  SELECT * INTO v_first_step 
  FROM workflow_steps 
  WHERE workflow_id = p_workflow_id 
  ORDER BY step_order 
  LIMIT 1;
  
  IF v_first_step IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Calculate next step time
  v_next_step_at := now() + 
    CASE v_first_step.delay_unit
      WHEN 'minutes' THEN (v_first_step.delay_value || ' minutes')::INTERVAL
      WHEN 'hours' THEN (v_first_step.delay_value || ' hours')::INTERVAL
      WHEN 'days' THEN (v_first_step.delay_value || ' days')::INTERVAL
      WHEN 'weeks' THEN (v_first_step.delay_value || ' weeks')::INTERVAL
      ELSE '0 seconds'::INTERVAL
    END;
  
  -- Create execution
  INSERT INTO workflow_executions (workflow_id, subscriber_id, current_step, next_step_at)
  VALUES (p_workflow_id, p_subscriber_id, 1, v_next_step_at)
  ON CONFLICT (workflow_id, subscriber_id) DO UPDATE 
  SET status = 'active', current_step = 1, next_step_at = v_next_step_at, started_at = now()
  RETURNING id INTO v_execution_id;
  
  RETURN v_execution_id;
END;
$$;

-- Trigger function to auto-start workflows on new subscriber
CREATE OR REPLACE FUNCTION public.trigger_subscriber_workflows()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  workflow RECORD;
BEGIN
  -- Find all active workflows with on_subscribe trigger
  FOR workflow IN 
    SELECT id FROM email_workflows 
    WHERE trigger_type = 'on_subscribe' AND is_active = true
  LOOP
    PERFORM start_workflow_for_subscriber(workflow.id, NEW.id);
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-starting workflows
CREATE TRIGGER trigger_workflows_on_subscribe
  AFTER INSERT ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.trigger_subscriber_workflows();

-- Trigger function for segment join workflows
CREATE OR REPLACE FUNCTION public.trigger_segment_workflows()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  workflow RECORD;
BEGIN
  -- Find all active workflows with on_segment_join trigger for this segment
  FOR workflow IN 
    SELECT id FROM email_workflows 
    WHERE trigger_type = 'on_segment_join' 
    AND trigger_value = NEW.segment_id::TEXT 
    AND is_active = true
  LOOP
    PERFORM start_workflow_for_subscriber(workflow.id, NEW.subscriber_id);
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for segment join workflows
CREATE TRIGGER trigger_workflows_on_segment_join
  AFTER INSERT ON public.subscriber_segment_members
  FOR EACH ROW EXECUTE FUNCTION public.trigger_segment_workflows();