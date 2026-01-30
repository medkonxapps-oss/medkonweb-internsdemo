import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTable, { Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Pencil, Trash2, Users, Zap, Play } from 'lucide-react';
import { format } from 'date-fns';

interface Segment {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  subscriber_count?: number;
}

interface AutomationRule {
  id: string;
  segment_id: string;
  name: string;
  field: string;
  operator: string;
  value: string;
  is_active: boolean;
  created_at: string;
}

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6',
];

const RULE_FIELDS = [
  { value: 'email', label: 'Email' },
  { value: 'name', label: 'Name' },
  { value: 'source', label: 'Source' },
];

const RULE_OPERATORS = [
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does not contain' },
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'ends_with', label: 'Ends with' },
];

export default function Segments() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
  });
  const [ruleFormData, setRuleFormData] = useState({
    segment_id: '',
    name: '',
    field: 'email',
    operator: 'contains',
    value: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [applyingRules, setApplyingRules] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [segmentsRes, rulesRes] = await Promise.all([
        supabase.from('subscriber_segments').select('*').order('name'),
        supabase.from('segment_automation_rules').select('*').order('created_at', { ascending: false }),
      ]);

      if (segmentsRes.error) throw segmentsRes.error;
      if (rulesRes.error) throw rulesRes.error;

      // Get subscriber counts for each segment
      const segmentsWithCounts = await Promise.all(
        (segmentsRes.data || []).map(async (segment) => {
          const { count } = await supabase
            .from('subscriber_segment_members')
            .select('*', { count: 'exact', head: true })
            .eq('segment_id', segment.id);

          return { ...segment, subscriber_count: count || 0 };
        })
      );

      setSegments(segmentsWithCounts);
      setRules(rulesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingSegment(null);
    setFormData({ name: '', description: '', color: '#6366f1' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (segment: Segment) => {
    setEditingSegment(segment);
    setFormData({
      name: segment.name,
      description: segment.description || '',
      color: segment.color,
    });
    setIsDialogOpen(true);
  };

  const openRuleCreateDialog = () => {
    if (segments.length === 0) {
      toast.error('Create a segment first');
      return;
    }
    setEditingRule(null);
    setRuleFormData({
      segment_id: segments[0].id,
      name: '',
      field: 'email',
      operator: 'contains',
      value: '',
      is_active: true,
    });
    setIsRuleDialogOpen(true);
  };

  const openRuleEditDialog = (rule: AutomationRule) => {
    setEditingRule(rule);
    setRuleFormData({
      segment_id: rule.segment_id,
      name: rule.name,
      field: rule.field,
      operator: rule.operator,
      value: rule.value,
      is_active: rule.is_active,
    });
    setIsRuleDialogOpen(true);
  };

  const deleteSegment = async (id: string) => {
    if (!confirm('Are you sure? This will remove all subscribers from this segment.')) return;

    try {
      const { error } = await supabase
        .from('subscriber_segments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Segment deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting segment:', error);
      toast.error('Failed to delete segment');
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm('Delete this automation rule?')) return;

    try {
      const { error } = await supabase
        .from('segment_automation_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Rule deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete rule');
    }
  };

  const toggleRuleActive = async (rule: AutomationRule) => {
    try {
      const { error } = await supabase
        .from('segment_automation_rules')
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

  const saveSegment = async () => {
    if (!formData.name.trim()) {
      toast.error('Segment name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingSegment) {
        const { error } = await supabase
          .from('subscriber_segments')
          .update({
            name: formData.name,
            description: formData.description || null,
            color: formData.color,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingSegment.id);

        if (error) throw error;
        toast.success('Segment updated');
      } else {
        const { error } = await supabase
          .from('subscriber_segments')
          .insert({
            name: formData.name,
            description: formData.description || null,
            color: formData.color,
          });

        if (error) throw error;
        toast.success('Segment created');
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving segment:', error);
      toast.error('Failed to save segment');
    } finally {
      setSaving(false);
    }
  };

  const saveRule = async () => {
    if (!ruleFormData.name.trim() || !ruleFormData.value.trim()) {
      toast.error('Rule name and value are required');
      return;
    }

    setSaving(true);
    try {
      if (editingRule) {
        const { error } = await supabase
          .from('segment_automation_rules')
          .update({
            segment_id: ruleFormData.segment_id,
            name: ruleFormData.name,
            field: ruleFormData.field,
            operator: ruleFormData.operator,
            value: ruleFormData.value,
            is_active: ruleFormData.is_active,
          })
          .eq('id', editingRule.id);

        if (error) throw error;
        toast.success('Rule updated');
      } else {
        const { error } = await supabase
          .from('segment_automation_rules')
          .insert({
            segment_id: ruleFormData.segment_id,
            name: ruleFormData.name,
            field: ruleFormData.field,
            operator: ruleFormData.operator,
            value: ruleFormData.value,
            is_active: ruleFormData.is_active,
          });

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

  const applyRulesToExisting = async () => {
    setApplyingRules(true);
    try {
      // Get all subscribers
      const { data: subscribers, error: subError } = await supabase
        .from('newsletter_subscribers')
        .select('id, email, name, source')
        .eq('subscribed', true);

      if (subError) throw subError;

      // Get active rules
      const activeRules = rules.filter(r => r.is_active);
      
      let addedCount = 0;
      
      for (const subscriber of subscribers || []) {
        for (const rule of activeRules) {
          const fieldValue = rule.field === 'email' 
            ? subscriber.email 
            : rule.field === 'name' 
              ? subscriber.name || ''
              : subscriber.source || '';

          let matches = false;
          const val = rule.value.toLowerCase();
          const fv = fieldValue.toLowerCase();

          switch (rule.operator) {
            case 'contains': matches = fv.includes(val); break;
            case 'not_contains': matches = !fv.includes(val); break;
            case 'equals': matches = fv === val; break;
            case 'not_equals': matches = fv !== val; break;
            case 'starts_with': matches = fv.startsWith(val); break;
            case 'ends_with': matches = fv.endsWith(val); break;
          }

          if (matches) {
            const { error } = await supabase
              .from('subscriber_segment_members')
              .upsert(
                { subscriber_id: subscriber.id, segment_id: rule.segment_id },
                { onConflict: 'subscriber_id,segment_id', ignoreDuplicates: true }
              );
            if (!error) addedCount++;
          }
        }
      }

      toast.success(`Applied rules to existing subscribers (${addedCount} assignments made)`);
      fetchData();
    } catch (error) {
      console.error('Error applying rules:', error);
      toast.error('Failed to apply rules');
    } finally {
      setApplyingRules(false);
    }
  };

  const getSegmentName = (segmentId: string) => {
    return segments.find(s => s.id === segmentId)?.name || 'Unknown';
  };

  const segmentColumns: Column<Segment>[] = [
    {
      header: 'Segment',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: row.color }}
          />
          <div>
            <span className="font-medium">{row.name}</span>
            {row.description && (
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {row.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Subscribers',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{row.subscriber_count || 0}</span>
        </div>
      ),
    },
    {
      header: 'Created',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.created_at), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      header: '',
      cell: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(row)} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteSegment(row.id)}
            title="Delete"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'w-24',
    },
  ];

  const ruleColumns: Column<AutomationRule>[] = [
    {
      header: 'Rule',
      cell: (row) => (
        <div>
          <span className="font-medium">{row.name}</span>
          <p className="text-xs text-muted-foreground">
            If <strong>{row.field}</strong> {RULE_OPERATORS.find(o => o.value === row.operator)?.label.toLowerCase()} "{row.value}"
          </p>
        </div>
      ),
    },
    {
      header: 'Segment',
      cell: (row) => (
        <Badge variant="outline">{getSegmentName(row.segment_id)}</Badge>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.is_active ? 'default' : 'secondary'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: '',
      cell: (row) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleRuleActive(row)}
            title={row.is_active ? 'Deactivate' : 'Activate'}
          >
            <Switch checked={row.is_active} className="pointer-events-none" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openRuleEditDialog(row)} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteRule(row.id)}
            title="Delete"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'w-36',
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Segments & Automation</h1>
            <p className="text-muted-foreground">
              Organize subscribers and automate segment assignments
            </p>
          </div>
        </motion.div>

        <Tabs defaultValue="segments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="segments">
              <Users className="h-4 w-4 mr-2" />
              Segments
            </TabsTrigger>
            <TabsTrigger value="automation">
              <Zap className="h-4 w-4 mr-2" />
              Automation Rules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="segments" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                New Segment
              </Button>
            </div>
            <DataTable
              columns={segmentColumns}
              data={segments}
              loading={loading}
              emptyMessage="No segments yet. Create your first segment to organize subscribers."
            />
          </TabsContent>

          <TabsContent value="automation" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Rules automatically assign new subscribers to segments based on conditions.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={applyRulesToExisting}
                  disabled={applyingRules || rules.filter(r => r.is_active).length === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {applyingRules ? 'Applying...' : 'Apply to Existing'}
                </Button>
                <Button onClick={openRuleCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Rule
                </Button>
              </div>
            </div>
            <DataTable
              columns={ruleColumns}
              data={rules}
              loading={loading}
              emptyMessage="No automation rules yet. Create a rule to automatically segment subscribers."
            />
          </TabsContent>
        </Tabs>

        {/* Segment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSegment ? 'Edit Segment' : 'Create Segment'}</DialogTitle>
              <DialogDescription>
                {editingSegment ? 'Update segment details' : 'Create a new segment to group subscribers'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="segment-name">Name *</Label>
                <Input
                  id="segment-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., VIP Customers"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="segment-description">Description</Label>
                <Textarea
                  id="segment-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description for this segment"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={saveSegment} disabled={saving}>
                  {saving ? 'Saving...' : editingSegment ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Rule Dialog */}
        <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRule ? 'Edit Rule' : 'Create Automation Rule'}</DialogTitle>
              <DialogDescription>
                Automatically assign subscribers to a segment based on conditions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">Rule Name *</Label>
                <Input
                  id="rule-name"
                  value={ruleFormData.name}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, name: e.target.value })}
                  placeholder="e.g., Gmail users"
                />
              </div>
              <div className="space-y-2">
                <Label>Assign to Segment</Label>
                <Select
                  value={ruleFormData.segment_id}
                  onValueChange={(value) => setRuleFormData({ ...ruleFormData, segment_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select segment" />
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
              <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-3">
                <Label className="text-sm font-medium">Condition</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={ruleFormData.field}
                    onValueChange={(value) => setRuleFormData({ ...ruleFormData, field: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RULE_FIELDS.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={ruleFormData.operator}
                    onValueChange={(value) => setRuleFormData({ ...ruleFormData, operator: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RULE_OPERATORS.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={ruleFormData.value}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, value: e.target.value })}
                    placeholder="Value"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Example: If email contains "gmail.com", assign to segment
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="rule-active"
                  checked={ruleFormData.is_active}
                  onCheckedChange={(checked) => setRuleFormData({ ...ruleFormData, is_active: checked })}
                />
                <Label htmlFor="rule-active">Rule is active</Label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsRuleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={saveRule} disabled={saving}>
                  {saving ? 'Saving...' : editingRule ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
