import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Plus, Mail, GitBranch, Zap, Clock, Tag, 
  ArrowRight, ArrowDown, Trash2, Edit, 
  CheckCircle, XCircle, Target, Bell,
  ChevronRight, ChevronDown, Settings
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  step_order: number;
  step_type: 'email' | 'condition' | 'action' | 'delay';
  name: string;
  subject?: string;
  body?: string;
  delay_value?: number;
  delay_unit?: string;
  condition_field?: string;
  condition_operator?: string;
  condition_value?: string;
  true_next_step?: number;
  false_next_step?: number;
  action_type?: string;
  action_params?: any;
}

interface ConditionalWorkflowBuilderProps {
  workflowId: string;
  steps: WorkflowStep[];
  onStepsChange: (steps: WorkflowStep[]) => void;
}

const STEP_TYPES = [
  { value: 'email', label: 'Send Email', icon: Mail, color: 'bg-blue-500' },
  { value: 'condition', label: 'Condition', icon: GitBranch, color: 'bg-purple-500' },
  { value: 'action', label: 'Action', icon: Zap, color: 'bg-green-500' },
  { value: 'delay', label: 'Wait', icon: Clock, color: 'bg-orange-500' },
];

const CONDITION_FIELDS = [
  { value: 'email', label: 'Email Address' },
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
  { value: 'not_contains', label: 'Does Not Contain' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'greater_equal', label: 'Greater or Equal' },
  { value: 'less_equal', label: 'Less or Equal' },
  { value: 'exists', label: 'Exists' },
  { value: 'not_exists', label: 'Does Not Exist' },
];

const ACTION_TYPES = [
  { value: 'add_tag', label: 'Add Tag', icon: Tag },
  { value: 'update_lead_score', label: 'Update Lead Score', icon: Target },
  { value: 'update_engagement', label: 'Update Engagement', icon: CheckCircle },
  { value: 'create_task', label: 'Create Task', icon: Plus },
  { value: 'send_notification', label: 'Send Notification', icon: Bell },
];

export function ConditionalWorkflowBuilder({ workflowId, steps, onStepsChange }: ConditionalWorkflowBuilderProps) {
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const addStep = (type: string, afterStep?: number) => {
    const newStep: WorkflowStep = {
      id: `temp-${Date.now()}`,
      step_order: afterStep ? afterStep + 1 : steps.length + 1,
      step_type: type as any,
      name: `New ${type} step`,
    };

    // Adjust order of existing steps
    const updatedSteps = steps.map(step => 
      step.step_order > (afterStep || steps.length) 
        ? { ...step, step_order: step.step_order + 1 }
        : step
    );

    onStepsChange([...updatedSteps, newStep]);
    setEditingStep(newStep);
    setIsDialogOpen(true);
  };

  const editStep = (step: WorkflowStep) => {
    setEditingStep(step);
    setIsDialogOpen(true);
  };

  const deleteStep = (stepId: string) => {
    const updatedSteps = steps
      .filter(step => step.id !== stepId)
      .map((step, index) => ({ ...step, step_order: index + 1 }));
    onStepsChange(updatedSteps);
  };

  const saveStep = (stepData: Partial<WorkflowStep>) => {
    if (!editingStep) return;

    const updatedSteps = steps.map(step =>
      step.id === editingStep.id ? { ...step, ...stepData } : step
    );
    onStepsChange(updatedSteps);
    setIsDialogOpen(false);
    setEditingStep(null);
  };

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStepIcon = (type: string) => {
    const stepType = STEP_TYPES.find(t => t.value === type);
    return stepType ? stepType.icon : Mail;
  };

  const getStepColor = (type: string) => {
    const stepType = STEP_TYPES.find(t => t.value === type);
    return stepType ? stepType.color : 'bg-gray-500';
  };

  const renderStepContent = (step: WorkflowStep) => {
    switch (step.step_type) {
      case 'email':
        return (
          <div className="text-sm text-muted-foreground">
            <p><strong>Subject:</strong> {step.subject || 'No subject'}</p>
            {step.body && (
              <p className="mt-1 line-clamp-2"><strong>Body:</strong> {step.body.substring(0, 100)}...</p>
            )}
          </div>
        );
      
      case 'condition':
        return (
          <div className="text-sm text-muted-foreground">
            <p><strong>If:</strong> {step.condition_field} {step.condition_operator} {step.condition_value}</p>
            <div className="flex gap-4 mt-2">
              <span className="text-green-600">✓ True → Step {step.true_next_step}</span>
              <span className="text-red-600">✗ False → Step {step.false_next_step}</span>
            </div>
          </div>
        );
      
      case 'action':
        return (
          <div className="text-sm text-muted-foreground">
            <p><strong>Action:</strong> {step.action_type}</p>
            {step.action_params && (
              <p className="mt-1"><strong>Params:</strong> {JSON.stringify(step.action_params)}</p>
            )}
          </div>
        );
      
      case 'delay':
        return (
          <div className="text-sm text-muted-foreground">
            <p><strong>Wait:</strong> {step.delay_value} {step.delay_unit}</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Step Buttons */}
      <div className="flex flex-wrap gap-2">
        {STEP_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <Button
              key={type.value}
              variant="outline"
              size="sm"
              onClick={() => addStep(type.value)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              Add {type.label}
            </Button>
          );
        })}
      </div>

      {/* Workflow Steps */}
      <div className="space-y-3">
        {steps
          .sort((a, b) => a.step_order - b.step_order)
          .map((step, index) => {
            const Icon = getStepIcon(step.step_type);
            const isExpanded = expandedSteps.has(step.id);
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getStepColor(step.step_type)} text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{step.name}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            Step {step.step_order} • {step.step_type}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStepExpansion(step.id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editStep(step)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteStep(step.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CardContent className="pt-0">
                          {renderStepContent(step)}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>

                {/* Connection Arrow */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowDown className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}

                {/* Add Step Between */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addStep('email', step.step_order)}
                    className="rounded-full w-8 h-8 p-0 bg-background border-2"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
      </div>

      {/* Step Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStep?.step_type === 'email' && 'Edit Email Step'}
              {editingStep?.step_type === 'condition' && 'Edit Condition Step'}
              {editingStep?.step_type === 'action' && 'Edit Action Step'}
              {editingStep?.step_type === 'delay' && 'Edit Delay Step'}
            </DialogTitle>
          </DialogHeader>
          
          {editingStep && (
            <StepEditor
              step={editingStep}
              onSave={saveStep}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Step Editor Component
function StepEditor({ 
  step, 
  onSave, 
  onCancel 
}: { 
  step: WorkflowStep; 
  onSave: (data: Partial<WorkflowStep>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState(step);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Step Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter step name"
        />
      </div>

      {formData.step_type === 'email' && (
        <>
          <div>
            <Label>Email Subject</Label>
            <Input
              value={formData.subject || ''}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Enter email subject"
            />
          </div>
          <div>
            <Label>Email Body</Label>
            <Textarea
              value={formData.body || ''}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Enter email content"
              rows={6}
            />
          </div>
        </>
      )}

      {formData.step_type === 'condition' && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Field</Label>
              <Select
                value={formData.condition_field}
                onValueChange={(value) => setFormData({ ...formData, condition_field: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION_FIELDS.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Operator</Label>
              <Select
                value={formData.condition_operator}
                onValueChange={(value) => setFormData({ ...formData, condition_operator: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION_OPERATORS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input
                value={formData.condition_value || ''}
                onChange={(e) => setFormData({ ...formData, condition_value: e.target.value })}
                placeholder="Enter value"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>If True, Go to Step</Label>
              <Input
                type="number"
                value={formData.true_next_step || ''}
                onChange={(e) => setFormData({ ...formData, true_next_step: parseInt(e.target.value) })}
                placeholder="Step number"
              />
            </div>
            <div>
              <Label>If False, Go to Step</Label>
              <Input
                type="number"
                value={formData.false_next_step || ''}
                onChange={(e) => setFormData({ ...formData, false_next_step: parseInt(e.target.value) })}
                placeholder="Step number"
              />
            </div>
          </div>
        </>
      )}

      {formData.step_type === 'action' && (
        <>
          <div>
            <Label>Action Type</Label>
            <Select
              value={formData.action_type}
              onValueChange={(value) => setFormData({ ...formData, action_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Action Parameters (JSON)</Label>
            <Textarea
              value={JSON.stringify(formData.action_params || {}, null, 2)}
              onChange={(e) => {
                try {
                  const params = JSON.parse(e.target.value);
                  setFormData({ ...formData, action_params: params });
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              placeholder='{"key": "value"}'
              rows={4}
            />
          </div>
        </>
      )}

      {formData.step_type === 'delay' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Delay Value</Label>
            <Input
              type="number"
              value={formData.delay_value || ''}
              onChange={(e) => setFormData({ ...formData, delay_value: parseInt(e.target.value) })}
              placeholder="Enter delay"
            />
          </div>
          <div>
            <Label>Delay Unit</Label>
            <Select
              value={formData.delay_unit}
              onValueChange={(value) => setFormData({ ...formData, delay_unit: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Step
        </Button>
      </div>
    </div>
  );
}