import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Plus, Pencil, Trash2, Workflow, Play, Pause, 
  Clock, Mail, Users, ArrowRight, Search,
  ChevronRight, Zap, Target, Bell, CheckCircle2,
  ListTodo, FileCheck, AlertCircle, X, History,
  Sparkles, LayoutGrid, List, Filter, SlidersHorizontal,
  BarChart3, Webhook
} from 'lucide-react';
import { format } from 'date-fns';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { useAuth } from '@/hooks/useAuth';

// Import new components
import { WorkflowStats } from '@/components/admin/workflows/WorkflowStats';
import { WorkflowCard } from '@/components/admin/workflows/WorkflowCard';
import { VisualWorkflowBuilder } from '@/components/admin/workflows/VisualWorkflowBuilder';
import { WorkflowExecutionHistory } from '@/components/admin/workflows/WorkflowExecutionHistory';
import { AutomationRuleCard } from '@/components/admin/workflows/AutomationRuleCard';
import { WorkflowTemplates } from '@/components/admin/workflows/WorkflowTemplates';
import { WorkflowAnalytics } from '@/components/admin/workflows/WorkflowAnalytics';
import { WebhookConfig } from '@/components/admin/workflows/WebhookConfig';

interface EmailWorkflow {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_value: string | null;
  is_active: boolean;
  created_at: string;
  steps_count?: number;
  executions_count?: number;
}

interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  name: string;
  step_type: 'email' | 'condition' | 'action' | 'delay'; // New field
  subject: string | null; // Can be null for non-email steps
  body: string | null; // Can be null for non-email steps
  delay_value: number | null; // Can be null for non-delay steps
  delay_unit: string | null; // Can be null for non-delay steps

  // Conditional Branching fields (for step_type === 'condition')
  condition_field: string | null;
  condition_operator: string | null;
  condition_value: string | null;
  true_next_step: number | null; // Order of step to go to if true
  false_next_step: number | null; // Order of step to go to if false

  // Action fields (for step_type === 'action')
  action_type: string | null;
  action_params: Record<string, any> | null;
}

interface WorkflowRule {
  id: string;
  name: string;
  description: string | null;
  trigger_entity: string;
  trigger_event: string;
  conditions: Record<string, any>[];
  actions: Record<string, any>[];
  is_active: boolean;
  created_at: string;
}

interface Segment {
  id: string;
  name: string;
}

interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
}

interface WorkflowTag {
  id: string;
  name: string;
  color: string;
}

const TRIGGER_TYPES = [
  { value: 'manual', label: 'Manual', icon: Play, description: 'Start manually for selected subscribers' },
  { value: 'on_subscribe', label: 'On Subscribe', icon: Users, description: 'When someone subscribes to newsletter' },
  { value: 'webhook', label: 'Webhook', icon: Zap, description: 'Trigger via external API call' },
  { value: 'on_segment_join', label: 'On Segment Join', icon: Target, description: 'When subscriber joins a segment' },
];

const STEP_TYPES = [
  { value: 'email', label: 'Send Email', icon: Mail, description: 'Send an email to the subscriber' },
  { value: 'delay', label: 'Delay', icon: Clock, description: 'Wait for a specified duration' },
  { value: 'condition', label: 'Conditional Split', icon: ArrowRight, description: 'Branch workflow based on subscriber data' },
  { value: 'action', label: 'Perform Action', icon: Zap, description: 'Perform an action on the subscriber' },
];

const DELAY_UNITS = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
];

const TRIGGER_ENTITIES = [
  { value: 'lead', label: 'Lead', icon: Users },
  { value: 'task', label: 'Task', icon: ListTodo },
  { value: 'approval', label: 'Approval', icon: FileCheck },
];

const TRIGGER_EVENTS = [
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'status_changed', label: 'Status Changed' },
];

const SUBSCRIBER_FIELDS = [
  { value: 'email', label: 'Email' },
  { value: 'name', label: 'Name' },
  { value: 'lead_score', label: 'Lead Score' },
  { value: 'engagement_level', label: 'Engagement Level' },
  { value: 'total_opens', label: 'Total Opens' },
  { value: 'total_clicks', label: 'Total Clicks' },
  { value: 'purchase_count', label: 'Purchase Count' },
  { value: 'total_spent', label: 'Total Spent' },
  { value: 'has_tag', label: 'Has Tag' },
];

const CONDITION_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does not contain' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'ends_with', label: 'Ends with' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'greater_equal', label: 'Greater or equal' },
  { value: 'less_equal', label: 'Less or equal' },
  { value: 'exists', label: 'Exists' },
  { value: 'not_exists', label: 'Does not exist' },
];

const ACTION_TYPES_WORKFLOW = [
  { value: 'add_tag', label: 'Add Tag', icon: Sparkles },
  { value: 'remove_tag', label: 'Remove Tag', icon: X },
  { value: 'update_lead_score', label: 'Update Lead Score', icon: BarChart3 },
  { value: 'update_engagement', label: 'Update Engagement', icon: SlidersHorizontal },
  { value: 'create_task', label: 'Create Task', icon: ListTodo },
  { value: 'send_notification', label: 'Send Internal Notification', icon: Bell },
  { value: 'send_webhook', label: 'Send Webhook', icon: Webhook },
];

const LEAD_FIELDS = [
  { value: 'status', label: 'Status' },
  { value: 'source', label: 'Source' },
  { value: 'company', label: 'Company' },
  { value: 'email', label: 'Email' },
];

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
];

const ACTION_TYPES = [
  { value: 'create_task', label: 'Create Task', icon: ListTodo },
  { value: 'assign_lead', label: 'Auto-Assign Lead', icon: Users },
  { value: 'notify', label: 'Send Notification', icon: Bell },
  { value: 'change_status', label: 'Change Status', icon: CheckCircle2 },
];

export default function Workflows() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('email');
  const [workflows, setWorkflows] = useState<EmailWorkflow[]>([]);
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [workflowTags, setWorkflowTags] = useState<WorkflowTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Stats
  const [totalExecutions, setTotalExecutions] = useState(0);
  const [completedExecutions, setCompletedExecutions] = useState(0);
  
  // Email workflow dialogs
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<EmailWorkflow | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<EmailWorkflow | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  
  // Rule dialogs
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<WorkflowRule | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'manual',
    trigger_value: '',
  });
  
  const [stepFormData, setStepFormData] = useState({
    name: '',
    step_type: 'email' as 'email' | 'condition' | 'action' | 'delay',
    subject: '',
    body: '',
    delay_value: 0,
    delay_unit: 'hours',
    condition_field: '',
    condition_operator: '',
    condition_value: '',
    true_next_step: null as number | null,
    false_next_step: null as number | null,
    action_type: '',
    action_params: {} as Record<string, any>,
  });
  
  const [ruleFormData, setRuleFormData] = useState({
    name: '',
    description: '',
    trigger_entity: 'lead',
    trigger_event: 'created',
    conditions: [] as Record<string, any>[],
    actions: [] as Record<string, any>[],
  });
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedWorkflow) {
      fetchWorkflowDetails(selectedWorkflow.id);
    }
  }, [selectedWorkflow]);

  const fetchData = async () => {
    try {
      const [workflowsRes, segmentsRes, rulesRes, profilesRes, execRes, tagsRes] = await Promise.all([
        supabase.from('email_workflows').select('*').order('created_at', { ascending: false }),
        supabase.from('subscriber_segments').select('id, name').order('name'),
        supabase.from('workflow_rules').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, email, full_name'),
        supabase.from('workflow_executions').select('status'),
        supabase.from('workflow_tags').select('id, name, color').order('name'),
      ]);

      if (workflowsRes.error) throw workflowsRes.error;
      if (segmentsRes.error) throw segmentsRes.error;
      if (tagsRes.error) throw tagsRes.error;

      const workflowsWithCounts = await Promise.all(
        (workflowsRes.data || []).map(async (workflow) => {
          const [stepsCount, execCount, stepsData] = await Promise.all([
            supabase.from('workflow_steps').select('*', { count: 'exact', head: true }).eq('workflow_id', workflow.id),
            supabase.from('workflow_executions').select('*', { count: 'exact', head: true }).eq('workflow_id', workflow.id).eq('status', 'active'),
            supabase.from('workflow_steps').select('step_type').eq('workflow_id', workflow.id),
          ]);

          const hasAdvancedSteps = (stepsData.data || []).some(
            (step) => step.step_type !== 'email' && step.step_type !== 'delay'
          );

          return {
            ...workflow,
            steps_count: stepsCount.count || 0,
            executions_count: execCount.count || 0,
            has_advanced_steps: hasAdvancedSteps,
          };
        })
      );

      setWorkflows(workflowsWithCounts);
      setSegments(segmentsRes.data || []);
      setRules(rulesRes.data || []);
      setTeamMembers(profilesRes.data || []);
      setWorkflowTags(tagsRes.data || []);
      
      // Calculate execution stats
      const execs = execRes.data || [];
      setTotalExecutions(execs.length);
      setCompletedExecutions(execs.filter(e => e.status === 'completed').length);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowDetails = async (workflowId: string) => {
    try {
      const { data, error } = await supabase
        .from('workflow_steps')
        .select('*, action_params, condition_field, condition_operator, condition_value, true_next_step, false_next_step') // Select all columns, including new ones
        .eq('workflow_id', workflowId)
        .order('step_order');

      if (error) throw error;
      setSteps(data || []);
    } catch (error) {
      console.error('Error fetching workflow details:', error);
    }
  };

  // Email Workflow Functions
  const openCreateDialog = () => {
    setEditingWorkflow(null);
    setFormData({ name: '', description: '', trigger_type: 'manual', trigger_value: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (workflow: EmailWorkflow) => {
    setEditingWorkflow(workflow);
    setFormData({
      name: workflow.name,
      description: workflow.description || '',
      trigger_type: workflow.trigger_type,
      trigger_value: workflow.trigger_value || '',
    });
    setIsDialogOpen(true);
  };

  const openStepDialog = (step?: WorkflowStep) => {
    if (step) {
      setEditingStep(step);
      setStepFormData({
        name: step.name,
        step_type: step.step_type || 'email',
        subject: step.subject || '',
        body: step.body || '',
        delay_value: step.delay_value || 0,
        delay_unit: step.delay_unit || 'hours',
        condition_field: step.condition_field || '',
        condition_operator: step.condition_operator || '',
        condition_value: step.condition_value || '',
        true_next_step: step.true_next_step || null,
        false_next_step: step.false_next_step || null,
        action_type: step.action_type || '',
        action_params: step.action_params || {},
      });
    } else {
      setEditingStep(null);
      setStepFormData({
        name: '',
        step_type: 'email',
        subject: '',
        body: '',
        delay_value: steps.length === 0 ? 0 : 1,
        delay_unit: 'days',
        condition_field: '',
        condition_operator: '',
        condition_value: '',
        true_next_step: null,
        false_next_step: null,
        action_type: '',
        action_params: {},
      });
    }
    setIsStepDialogOpen(true);
  };

  const saveWorkflow = async () => {
    if (!formData.name.trim()) {
      toast.error('Workflow name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingWorkflow) {
        const { error } = await supabase
          .from('email_workflows')
          .update({
            name: formData.name,
            description: formData.description || null,
            trigger_type: formData.trigger_type,
            trigger_value: formData.trigger_value || null,
          })
          .eq('id', editingWorkflow.id);

        if (error) throw error;
        toast.success('Workflow updated');
      } else {
        const { error } = await supabase
          .from('email_workflows')
          .insert({
            name: formData.name,
            description: formData.description || null,
            trigger_type: formData.trigger_type,
            trigger_value: formData.trigger_value || null,
            created_by: user?.id,
          });

        if (error) throw error;
        toast.success('Workflow created');
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const saveStep = async () => {
    if (!selectedWorkflow) return;

    // Basic validation
    if (!stepFormData.name.trim()) {
      toast.error('Step name is required');
      return;
    }

    if (stepFormData.step_type === 'email') {
      if (!stepFormData.subject?.trim()) {
        toast.error('Email subject is required for email steps');
        return;
      }
      if (!stepFormData.body?.trim()) {
        toast.error('Email body is required for email steps');
        return;
      }
    } else if (stepFormData.step_type === 'delay') {
      if (stepFormData.delay_value === null || stepFormData.delay_value < 0) {
        toast.error('Delay value must be a non-negative number');
        return;
      }
      if (!stepFormData.delay_unit) {
        toast.error('Delay unit is required');
        return;
      }
    } else if (stepFormData.step_type === 'condition') {
      if (!stepFormData.condition_field || !stepFormData.condition_operator) {
        toast.error('Condition field and operator are required');
        return;
      }
      if (stepFormData.condition_operator !== 'exists' && stepFormData.condition_operator !== 'not_exists' && !stepFormData.condition_value?.trim()) {
        toast.error('Condition value is required');
        return;
      }
      if (stepFormData.true_next_step === null && stepFormData.false_next_step === null) {
        toast.error('At least one next step (True or False) must be defined for a condition');
        return;
      }
    } else if (stepFormData.step_type === 'action') {
      if (!stepFormData.action_type) {
        toast.error('Action type is required');
        return;
      }
      // Add specific action param validation here if needed
      if (stepFormData.action_type === 'add_tag' && !stepFormData.action_params?.tag_name) {
        toast.error('Tag name is required for "Add Tag" action');
        return;
      }
      if (stepFormData.action_type === 'remove_tag' && !stepFormData.action_params?.tag_name) {
        toast.error('Tag name is required for "Remove Tag" action');
        return;
      }
      if (stepFormData.action_type === 'update_lead_score' && (stepFormData.action_params?.score_change === null || isNaN(stepFormData.action_params?.score_change))) {
        toast.error('Score change must be a number for "Update Lead Score" action');
        return;
      }
      if (stepFormData.action_type === 'update_engagement' && !stepFormData.action_params?.engagement_level) {
        toast.error('Engagement level is required for "Update Engagement" action');
        return;
      }
      if (stepFormData.action_type === 'create_task' && !stepFormData.action_params?.title) {
        toast.error('Task title is required for "Create Task" action');
        return;
      }
      if (stepFormData.action_type === 'send_notification' && !stepFormData.action_params?.title) {
        toast.error('Notification title is required for "Send Internal Notification" action');
        return;
      }
    }

    setSaving(true);
    try {
      const baseStepData = {
        name: stepFormData.name,
        step_type: stepFormData.step_type,
        workflow_id: selectedWorkflow.id,
        step_order: editingStep ? editingStep.step_order : steps.length + 1,
        // Reset all optional fields that are not relevant to the current step type
        subject: null,
        body: null,
        delay_value: null,
        delay_unit: null,
        condition_field: null,
        condition_operator: null,
        condition_value: null,
        true_next_step: null,
        false_next_step: null,
        action_type: null,
        action_params: null,
      };

      let finalStepData: any = { ...baseStepData };

      if (stepFormData.step_type === 'email') {
        finalStepData = {
          ...finalStepData,
          subject: stepFormData.subject,
          body: stepFormData.body,
        };
      } else if (stepFormData.step_type === 'delay') {
        finalStepData = {
          ...finalStepData,
          delay_value: stepFormData.delay_value,
          delay_unit: stepFormData.delay_unit,
        };
      } else if (stepFormData.step_type === 'condition') {
        finalStepData = {
          ...finalStepData,
          condition_field: stepFormData.condition_field,
          condition_operator: stepFormData.condition_operator,
          condition_value: stepFormData.condition_value,
          true_next_step: stepFormData.true_next_step,
          false_next_step: stepFormData.false_next_step,
        };
      } else if (stepFormData.step_type === 'action') {
        finalStepData = {
          ...finalStepData,
          action_type: stepFormData.action_type,
          action_params: stepFormData.action_params,
        };
      }
      
      if (editingStep) {
        const { error } = await supabase
          .from('workflow_steps')
          .update(finalStepData)
          .eq('id', editingStep.id);

        if (error) throw error;
        toast.success('Step updated');
      } else {
        const { error } = await supabase
          .from('workflow_steps')
          .insert(finalStepData);

        if (error) throw error;
        toast.success('Step added');
      }

      setIsStepDialogOpen(false);
      fetchWorkflowDetails(selectedWorkflow.id);
      fetchData();
    } catch (error) {
      console.error('Error saving step:', error);
      toast.error('Failed to save step');
    } finally {
      setSaving(false);
    }
  };

  const deleteWorkflow = async (id: string) => {
    if (!confirm('Delete this workflow and all its steps?')) return;

    try {
      const { error } = await supabase.from('email_workflows').delete().eq('id', id);
      if (error) throw error;
      toast.success('Workflow deleted');
      if (selectedWorkflow?.id === id) {
        setSelectedWorkflow(null);
        setSteps([]);
      }
      fetchData();
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Failed to delete workflow');
    }
  };

  const deleteStep = async (id: string) => {
    if (!confirm('Delete this step?')) return;

    try {
      const { error } = await supabase.from('workflow_steps').delete().eq('id', id);
      if (error) throw error;
      toast.success('Step deleted');
      if (selectedWorkflow) {
        fetchWorkflowDetails(selectedWorkflow.id);
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting step:', error);
      toast.error('Failed to delete step');
    }
  };

  const toggleWorkflowActive = async (workflow: EmailWorkflow) => {
    if (!workflow.is_active && (workflow.steps_count || 0) === 0) {
      toast.error('Add at least one step before activating');
      return;
    }

    try {
      const { error } = await supabase
        .from('email_workflows')
        .update({ is_active: !workflow.is_active })
        .eq('id', workflow.id);

      if (error) throw error;
      toast.success(workflow.is_active ? 'Workflow paused' : 'Workflow activated');
      fetchData();
    } catch (error) {
      console.error('Error toggling workflow:', error);
      toast.error('Failed to update workflow');
    }
  };

  const duplicateWorkflow = async (workflow: EmailWorkflow) => {
    try {
      // Create new workflow
      const { data: newWorkflow, error: wfError } = await supabase
        .from('email_workflows')
        .insert({
          name: `${workflow.name} (Copy)`,
          description: workflow.description,
          trigger_type: workflow.trigger_type,
          trigger_value: workflow.trigger_value,
          is_active: false,
          created_by: user?.id,
        })
        .select()
        .single();

      if (wfError) throw wfError;

      // Copy steps
      const { data: existingSteps } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', workflow.id);

      if (existingSteps && existingSteps.length > 0) {
        const newSteps = existingSteps.map(step => ({
          workflow_id: newWorkflow.id,
          step_order: step.step_order,
          name: step.name,
          subject: step.subject,
          body: step.body,
          delay_value: step.delay_value,
          delay_unit: step.delay_unit,
        }));

        await supabase.from('workflow_steps').insert(newSteps);
      }

      toast.success('Workflow duplicated');
      fetchData();
    } catch (error) {
      console.error('Error duplicating workflow:', error);
      toast.error('Failed to duplicate workflow');
    }
  };

  const handleStepsReorder = async (reorderedSteps: WorkflowStep[]) => {
    setSteps(reorderedSteps);
    
    // Update step orders in database
    try {
      await Promise.all(
        reorderedSteps.map((step, index) =>
          supabase
            .from('workflow_steps')
            .update({ step_order: index + 1 })
            .eq('id', step.id)
        )
      );
    } catch (error) {
      console.error('Error reordering steps:', error);
    }
  };

  // Rule Functions
  const openRuleCreateDialog = () => {
    setEditingRule(null);
    setRuleFormData({
      name: '',
      description: '',
      trigger_entity: 'lead',
      trigger_event: 'created',
      conditions: [],
      actions: [],
    });
    setIsRuleDialogOpen(true);
  };

  const openRuleEditDialog = (rule: WorkflowRule) => {
    setEditingRule(rule);
    setRuleFormData({
      name: rule.name,
      description: rule.description || '',
      trigger_entity: rule.trigger_entity,
      trigger_event: rule.trigger_event,
      conditions: rule.conditions || [],
      actions: rule.actions || [],
    });
    setIsRuleDialogOpen(true);
  };

  const addCondition = () => {
    setRuleFormData({
      ...ruleFormData,
      conditions: [...ruleFormData.conditions, { field: 'status', operator: 'equals', value: '' }],
    });
  };

  const removeCondition = (index: number) => {
    setRuleFormData({
      ...ruleFormData,
      conditions: ruleFormData.conditions.filter((_, i) => i !== index),
    });
  };

  const updateCondition = (index: number, key: string, value: string) => {
    const updated = [...ruleFormData.conditions];
    updated[index] = { ...updated[index], [key]: value };
    setRuleFormData({ ...ruleFormData, conditions: updated });
  };

  const addAction = () => {
    setRuleFormData({
      ...ruleFormData,
      actions: [...ruleFormData.actions, { type: 'create_task', title: '', priority: 'medium' }],
    });
  };

  const removeAction = (index: number) => {
    setRuleFormData({
      ...ruleFormData,
      actions: ruleFormData.actions.filter((_, i) => i !== index),
    });
  };

  const updateAction = (index: number, key: string, value: string) => {
    const updated = [...ruleFormData.actions];
    updated[index] = { ...updated[index], [key]: value };
    setRuleFormData({ ...ruleFormData, actions: updated });
  };

  const saveRule = async () => {
    if (!ruleFormData.name.trim()) {
      toast.error('Rule name is required');
      return;
    }

    if (ruleFormData.actions.length === 0) {
      toast.error('Add at least one action');
      return;
    }

    setSaving(true);
    try {
      const ruleData = {
        name: ruleFormData.name,
        description: ruleFormData.description || null,
        trigger_entity: ruleFormData.trigger_entity,
        trigger_event: ruleFormData.trigger_event,
        conditions: ruleFormData.conditions,
        actions: ruleFormData.actions,
        created_by: user?.id,
      };

      if (editingRule) {
        const { error } = await supabase
          .from('workflow_rules')
          .update(ruleData)
          .eq('id', editingRule.id);

        if (error) throw error;
        toast.success('Rule updated');
      } else {
        const { error } = await supabase
          .from('workflow_rules')
          .insert(ruleData);

        if (error) throw error;
        toast.success('Rule created');
      }

      setIsRuleDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving rule:', error);
      toast.error('Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm('Delete this automation rule?')) return;

    try {
      const { error } = await supabase.from('workflow_rules').delete().eq('id', id);
      if (error) throw error;
      toast.success('Rule deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete rule');
    }
  };

  const toggleRuleActive = async (rule: WorkflowRule) => {
    try {
      const { error } = await supabase
        .from('workflow_rules')
        .update({ is_active: !rule.is_active })
        .eq('id', rule.id);

      if (error) throw error;
      toast.success(rule.is_active ? 'Rule deactivated' : 'Rule activated');
      fetchData();
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast.error('Failed to update rule');
    }
  };

  const duplicateRule = async (rule: WorkflowRule) => {
    try {
      const { error } = await supabase
        .from('workflow_rules')
        .insert({
          name: `${rule.name} (Copy)`,
          description: rule.description,
          trigger_entity: rule.trigger_entity,
          trigger_event: rule.trigger_event,
          conditions: rule.conditions,
          actions: rule.actions,
          is_active: false,
          created_by: user?.id,
        });

      if (error) throw error;
      toast.success('Rule duplicated');
      fetchData();
    } catch (error) {
      console.error('Error duplicating rule:', error);
      toast.error('Failed to duplicate rule');
    }
  };

  const getTriggerLabel = (type: string, value: string | null) => {
    if (type === 'on_segment_join' && value) {
      const segment = segments.find(s => s.id === value);
      return `Joins "${segment?.name || 'Unknown'}"`;
    }
    return TRIGGER_TYPES.find(t => t.value === type)?.label || type;
  };

  // Filter workflows based on search
  const filteredWorkflows = workflows.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRules = rules.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeWorkflowsCount = workflows.filter(w => w.is_active).length;
  const activeRulesCount = rules.filter(r => r.is_active).length;

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Workflow Automation
            </h1>
            <p className="text-muted-foreground mt-1">
              Automate your business processes with intelligent triggers, conditions & actions
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsAnalyticsOpen(true)}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowTemplates(!showTemplates)}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Templates
            </Button>
          </div>
        </div>

        {/* Stats */}
        <WorkflowStats
          totalWorkflows={workflows.length}
          activeWorkflows={activeWorkflowsCount}
          totalRules={rules.length}
          activeRules={activeRulesCount}
          totalExecutions={totalExecutions}
          completedExecutions={completedExecutions}
        />

        {/* Templates Section */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <WorkflowTemplates
                    onSelectTemplate={(template) => {
                      setFormData({
                        name: template.name,
                        description: template.description,
                        trigger_type: template.trigger === 'On Subscribe' ? 'on_subscribe' : 
                                     template.trigger === 'On Segment Join' ? 'on_segment_join' : 'manual',
                        trigger_value: '',
                      });
                      setShowTemplates(false);
                      setIsDialogOpen(true);
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <TabsList className="grid w-full max-w-md grid-cols-2 p-1">
              <TabsTrigger value="email" className="gap-2 data-[state=active]:shadow-lg">
                <Mail className="h-4 w-4" />
                Email Drip Campaigns
                {activeWorkflowsCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {activeWorkflowsCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="rules" className="gap-2 data-[state=active]:shadow-lg">
                <Zap className="h-4 w-4" />
                Automation Rules
                {activeRulesCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {activeRulesCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Search & Actions */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              
              <Button 
                onClick={activeTab === 'email' ? openCreateDialog : openRuleCreateDialog}
                className="gap-2 shadow-lg"
              >
                <Plus className="h-4 w-4" />
                {activeTab === 'email' ? 'New Workflow' : 'New Rule'}
              </Button>
            </div>
          </div>

          {/* Email Drip Campaigns Tab */}
          <TabsContent value="email" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Workflows List */}
              <div className="lg:col-span-5">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Workflow className="h-5 w-5" />
                        Workflows
                      </CardTitle>
                      <Badge variant="outline">{filteredWorkflows.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-3">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                      ) : filteredWorkflows.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                            <Mail className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h4 className="font-semibold mb-2">No workflows yet</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Create your first email drip campaign
                          </p>
                          <Button onClick={openCreateDialog} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Workflow
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <AnimatePresence mode="popLayout">
                            {filteredWorkflows.map((workflow) => (
                              <WorkflowCard
                                key={workflow.id}
                                workflow={workflow}
                                isSelected={selectedWorkflow?.id === workflow.id}
                                triggerLabel={getTriggerLabel(workflow.trigger_type, workflow.trigger_value)}
                                onSelect={() => setSelectedWorkflow(workflow)}
                                onToggleActive={() => toggleWorkflowActive(workflow)}
                                onEdit={() => openEditDialog(workflow)}
                                onDelete={() => deleteWorkflow(workflow.id)}
                                onDuplicate={() => duplicateWorkflow(workflow)}
                                hasAdvancedSteps={workflow.has_advanced_steps}
                              />
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Workflow Builder */}
              <div className="lg:col-span-7">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {selectedWorkflow ? (
                            <>
                              <div className={`h-2.5 w-2.5 rounded-full ${
                                selectedWorkflow.is_active 
                                  ? 'bg-emerald-500 animate-pulse' 
                                  : 'bg-muted-foreground/30'
                              }`} />
                              {selectedWorkflow.name}
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-5 w-5" />
                              Workflow Builder
                            </>
                          )}
                        </CardTitle>
                        {selectedWorkflow && (
                          <CardDescription className="mt-1">
                            {getTriggerLabel(selectedWorkflow.trigger_type, selectedWorkflow.trigger_value)}
                          </CardDescription>
                        )}
                      </div>
                      
                      {selectedWorkflow && (
                        <div className="flex items-center gap-2">
                          <WebhookConfig
                            workflowId={selectedWorkflow.id}
                            workflowName={selectedWorkflow.name}
                            isActive={selectedWorkflow.is_active}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsHistoryOpen(true)}
                            className="gap-1.5"
                          >
                            <History className="h-4 w-4" />
                            History
                          </Button>
                          <Button
                            variant={selectedWorkflow.is_active ? 'secondary' : 'default'}
                            size="sm"
                            onClick={() => toggleWorkflowActive(selectedWorkflow)}
                            className="gap-1.5"
                          >
                            {selectedWorkflow.is_active ? (
                              <>
                                <Pause className="h-4 w-4" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4" />
                                Activate
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedWorkflow ? (
                      <VisualWorkflowBuilder
                        steps={steps}
                        onStepsReorder={handleStepsReorder}
                        onAddStep={() => openStepDialog()}
                        onEditStep={openStepDialog}
                        onDeleteStep={deleteStep}
                        isActive={selectedWorkflow.is_active}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                          <Workflow className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Select a Workflow</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                          Choose a workflow from the list to view and edit its email sequence
                        </p>
                        <Button variant="outline" onClick={openCreateDialog} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Or Create New
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Automation Rules Tab */}
          <TabsContent value="rules" className="space-y-6 mt-6">
            {filteredRules.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-8 w-8 text-violet-500" />
                    </div>
                    <h4 className="text-xl font-semibold mb-2">No automation rules yet</h4>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Create rules to automatically assign leads, create tasks, send notifications, and more
                    </p>
                    <Button onClick={openRuleCreateDialog} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create First Rule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredRules.map((rule) => (
                    <AutomationRuleCard
                      key={rule.id}
                      rule={rule}
                      onToggleActive={() => toggleRuleActive(rule)}
                      onEdit={() => openRuleEditDialog(rule)}
                      onDelete={() => deleteRule(rule.id)}
                      onDuplicate={() => duplicateRule(rule)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Quick Templates */}
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Quick Start Templates</CardTitle>
                <CardDescription>Click to create a pre-configured automation rule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    className="p-4 rounded-xl border-2 border-dashed cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
                    onClick={() => {
                      setRuleFormData({
                        name: 'New Lead Notification',
                        description: 'Notify sales team when a new lead is created',
                        trigger_entity: 'lead',
                        trigger_event: 'created',
                        conditions: [],
                        actions: [{ type: 'notify', title: 'New Lead Alert', user_id: user?.id }],
                      });
                      setEditingRule(null);
                      setIsRuleDialogOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                        <Bell className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Lead Notification</h4>
                        <p className="text-xs text-muted-foreground">Notify on new lead</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="p-4 rounded-xl border-2 border-dashed cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
                    onClick={() => {
                      setRuleFormData({
                        name: 'Auto Follow-up Task',
                        description: 'Create follow-up task for new leads',
                        trigger_entity: 'lead',
                        trigger_event: 'created',
                        conditions: [],
                        actions: [{ type: 'create_task', title: 'Follow up with lead', priority: 'high', due_days: '2' }],
                      });
                      setEditingRule(null);
                      setIsRuleDialogOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                        <ListTodo className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Auto Task Creation</h4>
                        <p className="text-xs text-muted-foreground">Create follow-up tasks</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="p-4 rounded-xl border-2 border-dashed cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
                    onClick={() => {
                      setRuleFormData({
                        name: 'Lead Auto-Assignment',
                        description: 'Auto-assign leads to team members',
                        trigger_entity: 'lead',
                        trigger_event: 'created',
                        conditions: [],
                        actions: [{ type: 'assign_lead' }],
                      });
                      setEditingRule(null);
                      setIsRuleDialogOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors">
                        <Users className="h-5 w-5 text-violet-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Lead Assignment</h4>
                        <p className="text-xs text-muted-foreground">Auto-assign to team</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Workflow Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingWorkflow ? 'Edit Workflow' : 'Create Email Workflow'}</DialogTitle>
              <DialogDescription>
                Set up your automated email sequence
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Workflow Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Welcome Series"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this workflow does..."
                  rows={2}
                />
              </div>
              <div>
                <Label>Trigger</Label>
                <Select
                  value={formData.trigger_type}
                  onValueChange={(value) => setFormData({ ...formData, trigger_type: value, trigger_value: '' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map((trigger) => (
                      <SelectItem key={trigger.value} value={trigger.value}>
                        <div className="flex items-center gap-2">
                          <trigger.icon className="h-4 w-4" />
                          <div>
                            <span>{trigger.label}</span>
                            <p className="text-xs text-muted-foreground">{trigger.description}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.trigger_type === 'on_segment_join' && (
                <div>
                  <Label>Select Segment</Label>
                  <Select
                    value={formData.trigger_value}
                    onValueChange={(value) => setFormData({ ...formData, trigger_value: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose segment..." />
                    </SelectTrigger>
                    <SelectContent>
                      {segments.map((segment) => (
                        <SelectItem key={segment.id} value={segment.id}>
                          {segment.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={saveWorkflow} disabled={saving}>
                  {saving ? 'Saving...' : editingWorkflow ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create/Edit Step Dialog */}
        <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStep ? 'Edit Email Step' : 'Add Email Step'}</DialogTitle>
              <DialogDescription>
                Configure the email content and timing
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Step Name</Label>
                  <Input
                    value={stepFormData.name}
                    onChange={(e) => setStepFormData({ ...stepFormData, name: e.target.value })}
                    placeholder="Welcome Email"
                  />
                </div>
                <div>
                  <Label>Step Type</Label>
                  <Select
                    value={stepFormData.step_type}
                    onValueChange={(value: 'email' | 'condition' | 'action' | 'delay') => setStepFormData({ 
                      ...stepFormData, 
                      step_type: value,
                      // Reset relevant fields when changing step type
                      subject: value === 'email' ? stepFormData.subject : '',
                      body: value === 'email' ? stepFormData.body : '',
                      delay_value: value === 'delay' ? stepFormData.delay_value : 0,
                      delay_unit: value === 'delay' ? stepFormData.delay_unit : 'hours',
                      condition_field: value === 'condition' ? stepFormData.condition_field : '',
                      condition_operator: value === 'condition' ? stepFormData.condition_operator : '',
                      condition_value: value === 'condition' ? stepFormData.condition_value : '',
                      true_next_step: value === 'condition' ? stepFormData.true_next_step : null,
                      false_next_step: value === 'condition' ? stepFormData.false_next_step : null,
                      action_type: value === 'action' ? stepFormData.action_type : '',
                      action_params: value === 'action' ? stepFormData.action_params : {},
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STEP_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {stepFormData.step_type === 'delay' && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label>Delay</Label>
                    <Input
                      type="number"
                      min="0"
                      value={stepFormData.delay_value || 0}
                      onChange={(e) => setStepFormData({ ...stepFormData, delay_value: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Unit</Label>
                    <Select
                      value={stepFormData.delay_unit || 'hours'}
                      onValueChange={(value) => setStepFormData({ ...stepFormData, delay_unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DELAY_UNITS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {stepFormData.step_type === 'email' && (
                <>
                  <div>
                    <Label>Email Subject</Label>
                    <Input
                      value={stepFormData.subject || ''}
                      onChange={(e) => setStepFormData({ ...stepFormData, subject: e.target.value })}
                      placeholder="Welcome to our newsletter!"
                    />
                  </div>
                  <div>
                    <Label>Email Body</Label>
                    <RichTextEditor
                      content={stepFormData.body || ''}
                      onChange={(value) => setStepFormData({ ...stepFormData, body: value })}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Use <code className="px-1 py-0.5 bg-muted rounded">{'{{name}}'}</code>, <code className="px-1 py-0.5 bg-muted rounded">{'{{email}}'}</code> for personalization
                    </p>
                  </div>
                </>
              )}

              {stepFormData.step_type === 'condition' && (
                <div className="space-y-4 p-4 border rounded-xl bg-muted/30">
                  <h4 className="font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Condition
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={stepFormData.condition_field || ''}
                      onValueChange={(value) => setStepFormData({ ...stepFormData, condition_field: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBSCRIBER_FIELDS.map((field) => (
                          <SelectItem key={field.value} value={field.value}>{field.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={stepFormData.condition_operator || ''}
                      onValueChange={(value) => setStepFormData({ ...stepFormData, condition_operator: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select operator..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_OPERATORS.map((op) => (
                          <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={stepFormData.condition_value || ''}
                      onChange={(e) => setStepFormData({ ...stepFormData, condition_value: e.target.value })}
                      placeholder="Value"
                      disabled={stepFormData.condition_operator === 'exists' || stepFormData.condition_operator === 'not_exists'}
                    />
                  </div>
                  {stepFormData.condition_field === 'has_tag' && (
                     <Select
                       value={stepFormData.condition_value || ''}
                       onValueChange={(value) => setStepFormData({ ...stepFormData, condition_value: value })}
                     >
                       <SelectTrigger className="w-full">
                         <SelectValue placeholder="Select tag..." />
                       </SelectTrigger>
                       <SelectContent>
                         {workflowTags.map((tag) => (
                           <SelectItem key={tag.id} value={tag.name}>{tag.name}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                  )}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div>
                      <Label>Next Step if True (Order)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={stepFormData.true_next_step || ''}
                        onChange={(e) => setStepFormData({ ...stepFormData, true_next_step: parseInt(e.target.value) || null })}
                        placeholder="e.g., 2"
                      />
                    </div>
                    <div>
                      <Label>Next Step if False (Order)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={stepFormData.false_next_step || ''}
                        onChange={(e) => setStepFormData({ ...stepFormData, false_next_step: parseInt(e.target.value) || null })}
                        placeholder="e.g., 3"
                      />
                    </div>
                  </div>
                </div>
              )}

              {stepFormData.step_type === 'action' && (
                <div className="space-y-4 p-4 border rounded-xl bg-muted/30">
                  <h4 className="font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Action
                  </h4>
                  <div>
                    <Label>Action Type</Label>
                    <Select
                      value={stepFormData.action_type || ''}
                      onValueChange={(value) => setStepFormData({ ...stepFormData, action_type: value, action_params: {} })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select action..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTION_TYPES_WORKFLOW.map((action) => (
                          <SelectItem key={action.value} value={action.value}>
                            <div className="flex items-center gap-2">
                              <action.icon className="h-4 w-4" />
                              {action.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {stepFormData.action_type === 'add_tag' && (
                    <div>
                      <Label>Tag Name</Label>
                      <Select
                        value={stepFormData.action_params?.tag_name || ''}
                        onValueChange={(value) => setStepFormData({ ...stepFormData, action_params: { tag_name: value } })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select tag to add..." />
                        </SelectTrigger>
                        <SelectContent>
                          {workflowTags.map((tag) => (
                            <SelectItem key={tag.id} value={tag.name}>{tag.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {stepFormData.action_type === 'remove_tag' && (
                    <div>
                      <Label>Tag Name</Label>
                      <Select
                        value={stepFormData.action_params?.tag_name || ''}
                        onValueChange={(value) => setStepFormData({ ...stepFormData, action_params: { tag_name: value } })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select tag to remove..." />
                        </SelectTrigger>
                        <SelectContent>
                          {workflowTags.map((tag) => (
                            <SelectItem key={tag.id} value={tag.name}>{tag.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {stepFormData.action_type === 'update_lead_score' && (
                    <div>
                      <Label>Score Change</Label>
                      <Input
                        type="number"
                        value={stepFormData.action_params?.score_change || ''}
                        onChange={(e) => setStepFormData({ ...stepFormData, action_params: { score_change: parseInt(e.target.value) || 0 } })}
                        placeholder="e.g., 10 or -5"
                      />
                    </div>
                  )}
                  {stepFormData.action_type === 'update_engagement' && (
                    <div>
                      <Label>Engagement Level</Label>
                      <Select
                        value={stepFormData.action_params?.engagement_level || ''}
                        onValueChange={(value) => setStepFormData({ ...stepFormData, action_params: { engagement_level: value } })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select engagement level..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="engaged">Engaged</SelectItem>
                          <SelectItem value="highly_engaged">Highly Engaged</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {stepFormData.action_type === 'create_task' && (
                    <div className="space-y-2">
                      <div>
                        <Label>Task Title</Label>
                        <Input
                          value={stepFormData.action_params?.title || ''}
                          onChange={(e) => setStepFormData({ ...stepFormData, action_params: { ...stepFormData.action_params, title: e.target.value } })}
                          placeholder="Follow up with subscriber"
                        />
                      </div>
                      <div>
                        <Label>Task Description (Optional)</Label>
                        <Textarea
                          value={stepFormData.action_params?.description || ''}
                          onChange={(e) => setStepFormData({ ...stepFormData, action_params: { ...stepFormData.action_params, description: e.target.value } })}
                          placeholder="Details about the task"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Priority</Label>
                          <Select
                            value={stepFormData.action_params?.priority || 'medium'}
                            onValueChange={(value) => setStepFormData({ ...stepFormData, action_params: { ...stepFormData.action_params, priority: value } })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Due In Days (Optional)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={stepFormData.action_params?.due_days || ''}
                            onChange={(e) => setStepFormData({ ...stepFormData, action_params: { ...stepFormData.action_params, due_days: parseInt(e.target.value) || null } })}
                            placeholder="e.g., 3"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                   {stepFormData.action_type === 'send_notification' && (
                    <div className="space-y-2">
                      <div>
                        <Label>Notification Title</Label>
                        <Input
                          value={stepFormData.action_params?.title || ''}
                          onChange={(e) => setStepFormData({ ...stepFormData, action_params: { ...stepFormData.action_params, title: e.target.value } })}
                          placeholder="Important Update!"
                        />
                      </div>
                      <div>
                        <Label>Notification Message</Label>
                        <Textarea
                          value={stepFormData.action_params?.message || ''}
                          onChange={(e) => setStepFormData({ ...stepFormData, action_params: { ...stepFormData.action_params, message: e.target.value } })}
                          placeholder="Your subscriber has reached VIP status."
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Link (Optional)</Label>
                        <Input
                          value={stepFormData.action_params?.link || ''}
                          onChange={(e) => setStepFormData({ ...stepFormData, action_params: { ...stepFormData.action_params, link: e.target.value } })}
                          placeholder="/admin/subscribers/123"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsStepDialogOpen(false)}>Cancel</Button>
                <Button onClick={saveStep} disabled={saving}>
                  {saving ? 'Saving...' : editingStep ? 'Update' : 'Add Step'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Execution History Dialog */}
        <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Execution History</DialogTitle>
              <DialogDescription>
                View all subscribers who are in this workflow
              </DialogDescription>
            </DialogHeader>
            {selectedWorkflow && (
              <WorkflowExecutionHistory
                workflowId={selectedWorkflow.id}
                workflowName={selectedWorkflow.name}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Workflow Analytics
              </DialogTitle>
              <DialogDescription>
                Track email performance across all workflows
              </DialogDescription>
            </DialogHeader>
            <WorkflowAnalytics />
          </DialogContent>
        </Dialog>

        {/* Create/Edit Rule Dialog */}
        <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRule ? 'Edit Automation Rule' : 'Create Automation Rule'}</DialogTitle>
              <DialogDescription>
                Define conditions and actions for automatic processing
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Rule Name</Label>
                  <Input
                    value={ruleFormData.name}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, name: e.target.value })}
                    placeholder="New Lead Follow-up"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={ruleFormData.description}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, description: e.target.value })}
                    placeholder="Describe what this rule does..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Trigger */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Trigger
                </h4>
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border bg-muted/30">
                  <div>
                    <Label>When</Label>
                    <Select
                      value={ruleFormData.trigger_entity}
                      onValueChange={(value) => setRuleFormData({ ...ruleFormData, trigger_entity: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRIGGER_ENTITIES.map((entity) => (
                          <SelectItem key={entity.value} value={entity.value}>
                            <div className="flex items-center gap-2">
                              <entity.icon className="h-4 w-4" />
                              {entity.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Event</Label>
                    <Select
                      value={ruleFormData.trigger_event}
                      onValueChange={(value) => setRuleFormData({ ...ruleFormData, trigger_event: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRIGGER_EVENTS.map((event) => (
                          <SelectItem key={event.value} value={event.value}>{event.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Conditions (Optional)
                  </h4>
                  <Button variant="outline" size="sm" onClick={addCondition}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Condition
                  </Button>
                </div>
                {ruleFormData.conditions.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 border rounded-xl bg-muted/30">
                    No conditions - rule will trigger for all events
                  </p>
                ) : (
                  <div className="space-y-2">
                    {ruleFormData.conditions.map((condition, index) => (
                      <div key={index} className="flex gap-2 items-center p-3 border rounded-xl bg-card">
                        <Select
                          value={condition.field}
                          onValueChange={(value) => updateCondition(index, 'field', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LEAD_FIELDS.map((field) => (
                              <SelectItem key={field.value} value={field.value}>{field.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(index, 'operator', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {OPERATORS.map((op) => (
                              <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          value={condition.value}
                          onChange={(e) => updateCondition(index, 'value', e.target.value)}
                          placeholder="Value"
                          className="flex-1"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeCondition(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Actions
                  </h4>
                  <Button variant="outline" size="sm" onClick={addAction}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Action
                  </Button>
                </div>
                {ruleFormData.actions.length === 0 ? (
                  <div className="flex items-center gap-2 p-4 border rounded-xl bg-destructive/10 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Add at least one action</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ruleFormData.actions.map((action, index) => (
                      <div key={index} className="p-4 border rounded-xl bg-card space-y-3">
                        <div className="flex gap-2 items-center">
                          <Select
                            value={action.type}
                            onValueChange={(value) => updateAction(index, 'type', value)}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ACTION_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center gap-2">
                                    <type.icon className="h-4 w-4" />
                                    {type.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" onClick={() => removeAction(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {action.type === 'create_task' && (
                          <div className="grid grid-cols-3 gap-2">
                            <Input
                              value={action.title || ''}
                              onChange={(e) => updateAction(index, 'title', e.target.value)}
                              placeholder="Task title"
                              className="col-span-2"
                            />
                            <Select
                              value={action.priority || 'medium'}
                              onValueChange={(value) => updateAction(index, 'priority', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        {action.type === 'notify' && (
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={action.title || ''}
                              onChange={(e) => updateAction(index, 'title', e.target.value)}
                              placeholder="Notification title"
                            />
                            <Select
                              value={action.user_id || ''}
                              onValueChange={(value) => updateAction(index, 'user_id', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Notify user..." />
                              </SelectTrigger>
                              <SelectContent>
                                {teamMembers.map((member) => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.full_name || member.email}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {action.type === 'change_status' && (
                          <Select
                            value={action.new_status || ''}
                            onValueChange={(value) => updateAction(index, 'new_status', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select new status..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="qualified">Qualified</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                              <SelectItem value="lost">Lost</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>Cancel</Button>
                <Button onClick={saveRule} disabled={saving}>
                  {saving ? 'Saving...' : editingRule ? 'Update Rule' : 'Create Rule'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AdminLayout>
  );
}
