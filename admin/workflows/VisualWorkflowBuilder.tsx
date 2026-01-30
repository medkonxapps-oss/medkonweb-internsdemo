import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Mail, Clock, Trash2, Pencil, GripVertical,
  ArrowDown, Sparkles, Send, Timer, Check, AlertCircle,
  Code, Zap, ArrowRight, GitBranch, Target, ListTodo, Bell, Webhook
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  name: string;
  step_type: 'email' | 'condition' | 'action' | 'delay';
  subject: string | null;
  body: string | null;
  delay_value: number | null;
  delay_unit: string | null;

  condition_field: string | null;
  condition_operator: string | null;
  condition_value: string | null;
  true_next_step: number | null;
  false_next_step: number | null;

  action_type: string | null;
  action_params: Record<string, any> | null;
}

interface VisualWorkflowBuilderProps {
  steps: WorkflowStep[];
  onStepsReorder: (steps: WorkflowStep[]) => void;
  onAddStep: () => void;
  onEditStep: (step: WorkflowStep) => void;
  onDeleteStep: (id: string) => void;
  isActive: boolean;
}

const STEP_TYPE_ICONS = {
  email: Mail,
  delay: Clock,
  condition: GitBranch,
  action: Zap,
};

const ACTION_TYPE_ICONS = {
  add_tag: Sparkles,
  remove_tag: Trash2,
  update_lead_score: Target,
  update_engagement: Sparkles,
  create_task: ListTodo,
  send_notification: Bell,
  send_webhook: Webhook,
};

export function VisualWorkflowBuilder({
  steps,
  onStepsReorder,
  onAddStep,
  onEditStep,
  onDeleteStep,
  isActive,
}: VisualWorkflowBuilderProps) {
  const getDelayText = (value: number | null, unit: string | null) => {
    if (value === 0 || value === null || unit === null) return 'Immediately';
    return `Wait ${value} ${unit}`;
  };

  const getConditionText = (field: string | null, operator: string | null, value: string | null) => {
    if (!field || !operator) return 'Invalid Condition';
    if (operator === 'exists' || operator === 'not_exists') {
      return `${field} ${operator}`;
    }
    return `${field} ${operator} ${value}`;
  };

  const getActionText = (type: string | null, params: any | null) => {
    if (!type) return 'Invalid Action';
    switch (type) {
      case 'add_tag': return `Add Tag: ${params?.tag_name || ''}`;
      case 'remove_tag': return `Remove Tag: ${params?.tag_name || ''}`;
      case 'update_lead_score': return `Update Lead Score: ${params?.score_change > 0 ? '+' : ''}${params?.score_change || 0}`;
      case 'update_engagement': return `Update Engagement: ${params?.engagement_level || ''}`;
      case 'create_task': return `Create Task: ${params?.title || ''}`;
      case 'send_notification': return `Send Notification: ${params?.title || ''}`;
      case 'send_webhook': return `Send Webhook`;
      default: return type;
    }
  };
  
  return (
    <div className="relative">
      {/* Workflow Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/30">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-semibold">Workflow Start</h4>
          <p className="text-xs text-muted-foreground">Trigger activates the sequence</p>
        </div>
      </div>

      {/* Steps */}
      <Reorder.Group 
        axis="y" 
        values={steps} 
        onReorder={onStepsReorder}
        className="space-y-1 relative"
      >
        <AnimatePresence mode="popLayout">
          {steps.map((step, index) => {
            const StepIconComponent = STEP_TYPE_ICONS[step.step_type] || Mail;
            const ActionIconComponent = step.step_type === 'action' ? ACTION_TYPE_ICONS[step.action_type || ''] || Zap : null;

            return (
              <Reorder.Item
                key={step.id}
                value={step}
                className="relative"
              >
                {/* Vertical connector line between steps */}
                {index < steps.length - 1 && (
                  <div className="absolute left-5 top-[calc(100%+8px)] h-8 w-0.5 bg-border z-0" />
                )}

                {/* Delay indicator (only for email/action/condition steps that follow a delay or implicitly have one) */}
                {step.delay_value !== null && step.delay_value > 0 && step.step_type !== 'delay' && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 ml-2 mb-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <Timer className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {getDelayText(step.delay_value, step.delay_unit)}
                    </span>
                    <ArrowDown className="h-3 w-3 text-muted-foreground" />
                  </motion.div>
                )}
                 


                {/* Step Card */}
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative ml-0 p-4 rounded-xl border-2 border-border/50 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing p-1 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {/* Step Number */}
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg ${
                        isActive 
                          ? 'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-primary/30' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {step.step_order}
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <StepIconComponent className="h-4 w-4 text-primary" />
                        <h5 className="font-semibold truncate">{step.name}</h5>
                      </div>

                      {step.step_type === 'email' && (
                        <>
                          <p className="text-sm text-muted-foreground truncate">
                            Subject: {step.subject}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </Badge>
                        </>
                      )}

                      {step.step_type === 'delay' && (
                        <>
                          <p className="text-sm text-muted-foreground">
                            {getDelayText(step.delay_value, step.delay_unit)}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Delay
                          </Badge>
                        </>
                      )}

                      {step.step_type === 'condition' && (
                        <>
                          <p className="text-sm text-muted-foreground">
                            IF: {getConditionText(step.condition_field, step.condition_operator, step.condition_value)}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary">
                              <GitBranch className="h-3 w-3 mr-1" />
                              Condition
                            </Badge>
                            {step.true_next_step && <Badge variant="outline">True: Step {step.true_next_step}</Badge>}
                            {step.false_next_step && <Badge variant="outline">False: Step {step.false_next_step}</Badge>}
                          </div>
                        </>
                      )}

                      {step.step_type === 'action' && (
                        <>
                          <p className="text-sm text-muted-foreground truncate">
                            {getActionText(step.action_type, step.action_params)}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {ActionIconComponent && <ActionIconComponent className="h-3 w-3 mr-1" />}
                            Action
                          </Badge>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => onEditStep(step)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDeleteStep(step.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
      </Reorder.Group>

      {/* Add Step Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 ml-2"
      >
        {steps.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="h-px flex-1 bg-border" />
          </div>
        )}
        
        <Button
          variant="outline"
          onClick={onAddStep}
          className="w-full h-16 border-dashed border-2 hover:border-primary hover:bg-primary/5 group transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="text-left">
              <p className="font-medium">Add Step</p>
              <p className="text-xs text-muted-foreground">Add a new email, delay, condition or action step</p>
            </div>
          </div>
        </Button>
      </motion.div>

      {/* Empty State */}
      {steps.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 px-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-muted-foreground" />
          </div>
          <h4 className="font-semibold mb-2">No steps yet</h4>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Start building your workflow by adding the first step
          </p>
          <Button onClick={onAddStep} className="gap-2">
            <Plus className="h-4 w-4" />
            Add First Step
          </Button>
        </motion.div>
      )}
    </div>
  );
}
