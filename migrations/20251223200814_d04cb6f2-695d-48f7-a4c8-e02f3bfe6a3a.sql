-- Create tasks table for auto-created and manual tasks
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  related_type TEXT, -- lead, deal, project, etc.
  related_id UUID,
  is_automated BOOLEAN DEFAULT false,
  workflow_id UUID REFERENCES public.email_workflows(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create approval requests table
CREATE TABLE public.approval_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  request_type TEXT NOT NULL, -- leave, discount, expense, custom
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table for in-app notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow rules table for general automation
CREATE TABLE public.workflow_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_entity TEXT NOT NULL, -- lead, task, approval, deal
  trigger_event TEXT NOT NULL, -- created, updated, status_changed
  conditions JSONB NOT NULL DEFAULT '[]', -- [{field, operator, value}]
  actions JSONB NOT NULL DEFAULT '[]', -- [{type, params}]
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow rule logs
CREATE TABLE public.workflow_rule_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES public.workflow_rules(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'success', -- success, failed
  actions_executed JSONB DEFAULT '[]',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_rule_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Admins can manage all tasks" ON public.tasks
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Team members can view assigned tasks" ON public.tasks
  FOR SELECT TO authenticated USING (assigned_to = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Team members can update assigned tasks" ON public.tasks
  FOR UPDATE TO authenticated USING (assigned_to = auth.uid());

-- RLS Policies for approval_requests
CREATE POLICY "Admins can manage approvals" ON public.approval_requests
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own requests" ON public.approval_requests
  FOR SELECT TO authenticated USING (requested_by = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "Users can create own requests" ON public.approval_requests
  FOR INSERT TO authenticated WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Approvers can update assigned requests" ON public.approval_requests
  FOR UPDATE TO authenticated USING (assigned_to = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for workflow_rules
CREATE POLICY "Admins can manage workflow rules" ON public.workflow_rules
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view workflow rule logs" ON public.workflow_rule_logs
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_approval_requests_updated_at
  BEFORE UPDATE ON public.approval_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_rules_updated_at
  BEFORE UPDATE ON public.workflow_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_link TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, link)
  VALUES (p_user_id, p_title, p_message, p_type, p_link)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Function to auto-create task
CREATE OR REPLACE FUNCTION public.create_automated_task(
  p_title TEXT,
  p_description TEXT,
  p_assigned_to UUID,
  p_due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_priority TEXT DEFAULT 'medium',
  p_related_type TEXT DEFAULT NULL,
  p_related_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO tasks (title, description, assigned_to, due_date, priority, related_type, related_id, is_automated)
  VALUES (p_title, p_description, p_assigned_to, p_due_date, p_priority, p_related_type, p_related_id, true)
  RETURNING id INTO v_id;
  
  -- Also notify the assigned user
  IF p_assigned_to IS NOT NULL THEN
    PERFORM create_notification(
      p_assigned_to,
      'New Task Assigned',
      p_title,
      'info',
      '/admin/tasks'
    );
  END IF;
  
  RETURN v_id;
END;
$$;

-- Trigger function for lead automation
CREATE OR REPLACE FUNCTION public.handle_lead_automation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rule RECORD;
  field_value TEXT;
  should_execute BOOLEAN;
  condition JSONB;
  action JSONB;
  team_member RECORD;
BEGIN
  -- Get all active rules for lead entity
  FOR rule IN 
    SELECT * FROM workflow_rules 
    WHERE trigger_entity = 'lead' 
    AND is_active = true
    AND (
      (TG_OP = 'INSERT' AND trigger_event = 'created') OR
      (TG_OP = 'UPDATE' AND trigger_event = 'updated') OR
      (TG_OP = 'UPDATE' AND trigger_event = 'status_changed' AND OLD.status != NEW.status)
    )
  LOOP
    should_execute := true;
    
    -- Check all conditions
    FOR condition IN SELECT * FROM jsonb_array_elements(rule.conditions)
    LOOP
      -- Get field value
      CASE condition->>'field'
        WHEN 'status' THEN field_value := NEW.status::TEXT;
        WHEN 'source' THEN field_value := COALESCE(NEW.source, '');
        WHEN 'company' THEN field_value := COALESCE(NEW.company, '');
        WHEN 'email' THEN field_value := NEW.email;
        ELSE field_value := '';
      END CASE;
      
      -- Check operator
      CASE condition->>'operator'
        WHEN 'equals' THEN 
          IF LOWER(field_value) != LOWER(condition->>'value') THEN should_execute := false; END IF;
        WHEN 'not_equals' THEN 
          IF LOWER(field_value) = LOWER(condition->>'value') THEN should_execute := false; END IF;
        WHEN 'contains' THEN 
          IF field_value NOT ILIKE '%' || (condition->>'value') || '%' THEN should_execute := false; END IF;
        ELSE should_execute := false;
      END CASE;
      
      EXIT WHEN NOT should_execute;
    END LOOP;
    
    -- Execute actions if conditions met
    IF should_execute THEN
      FOR action IN SELECT * FROM jsonb_array_elements(rule.actions)
      LOOP
        CASE action->>'type'
          WHEN 'create_task' THEN
            PERFORM create_automated_task(
              COALESCE(action->>'title', 'Follow up with ' || NEW.name),
              COALESCE(action->>'description', 'Auto-created task for lead: ' || NEW.email),
              (action->>'assigned_to')::UUID,
              CASE WHEN action->>'due_days' IS NOT NULL 
                THEN now() + ((action->>'due_days')::INTEGER || ' days')::INTERVAL 
                ELSE now() + '2 days'::INTERVAL 
              END,
              COALESCE(action->>'priority', 'medium'),
              'lead',
              NEW.id
            );
          WHEN 'assign_lead' THEN
            -- Round-robin assignment
            SELECT id INTO team_member FROM profiles 
            WHERE id IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'team_member'))
            ORDER BY random() LIMIT 1;
            
            IF team_member.id IS NOT NULL THEN
              UPDATE leads SET assigned_to = team_member.id WHERE id = NEW.id;
            END IF;
          WHEN 'notify' THEN
            IF (action->>'user_id') IS NOT NULL THEN
              PERFORM create_notification(
                (action->>'user_id')::UUID,
                COALESCE(action->>'title', 'New Lead Alert'),
                'New lead from ' || NEW.name || ' (' || NEW.email || ')',
                'info',
                '/admin/leads'
              );
            END IF;
          WHEN 'change_status' THEN
            IF action->>'new_status' IS NOT NULL THEN
              UPDATE leads SET status = (action->>'new_status')::lead_status WHERE id = NEW.id;
            END IF;
          ELSE NULL;
        END CASE;
      END LOOP;
      
      -- Log execution
      INSERT INTO workflow_rule_logs (rule_id, entity_type, entity_id, status, actions_executed)
      VALUES (rule.id, 'lead', NEW.id, 'success', rule.actions);
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for lead automation
CREATE TRIGGER lead_workflow_automation
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_lead_automation();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;