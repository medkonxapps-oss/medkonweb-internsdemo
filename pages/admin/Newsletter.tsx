import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTable, { Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClickHeatmap } from '@/components/admin/ClickHeatmap';
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
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Download, Mail, UserMinus, Send, Users, Loader2, CalendarIcon, Clock, X, Eye, MousePointer, MailOpen, Tags, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  subscribed: boolean;
  source: string | null;
  created_at: string;
  unsubscribed_at: string | null;
}

interface ScheduledCampaign {
  id: string;
  subject: string;
  body: string;
  scheduled_at: string;
  status: string;
  recipient_count: number;
  created_at: string;
  sent_at: string | null;
  open_count: number;
  click_count: number;
  is_recurring?: boolean;
  recurrence_pattern?: string | null;
  recurrence_end_date?: string | null;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface Segment {
  id: string;
  name: string;
  color: string;
}

interface EmailSenderSettings {
  email: string;
  name: string;
}

const RECURRENCE_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 Weeks' },
  { value: 'monthly', label: 'Monthly' },
];

export default function Newsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<ScheduledCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [subscriberSegments, setSubscriberSegments] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterSegment, setFilterSegment] = useState<string>('all');
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isSegmentDialogOpen, setIsSegmentDialogOpen] = useState(false);
  const [emailData, setEmailData] = useState({ subject: '', body: '' });
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [sending, setSending] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<ScheduledCampaign | null>(null);
  const [previewTab, setPreviewTab] = useState<'content' | 'heatmap'>('content');
  
  // Recurring campaign state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState('weekly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>();
  
  // Email sender settings
  const [emailSender, setEmailSender] = useState<EmailSenderSettings>({ email: '', name: 'Newsletter' });

  useEffect(() => {
    fetchSubscribers();
    fetchCampaigns();
    fetchTemplates();
    fetchSegments();
    fetchEmailSenderSettings();
  }, []);

  const fetchEmailSenderSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'email_sender')
        .maybeSingle();

      if (error) throw error;
      if (data?.value && typeof data.value === 'object' && !Array.isArray(data.value)) {
        const value = data.value as Record<string, unknown>;
        if (typeof value.email === 'string' && typeof value.name === 'string') {
          setEmailSender({ email: value.email, name: value.name });
        }
      }
    } catch (error) {
      console.error('Error fetching email sender settings:', error);
    }
  };

  const fetchSegments = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriber_segments')
        .select('id, name, color')
        .order('name');

      if (error) throw error;
      setSegments(data || []);

      // Fetch segment memberships
      const { data: memberships } = await supabase
        .from('subscriber_segment_members')
        .select('subscriber_id, segment_id');

      if (memberships) {
        const segmentMap: Record<string, string[]> = {};
        memberships.forEach(m => {
          if (!segmentMap[m.subscriber_id]) {
            segmentMap[m.subscriber_id] = [];
          }
          segmentMap[m.subscriber_id].push(m.segment_id);
        });
        setSubscriberSegments(segmentMap);
      }
    } catch (error) {
      console.error('Error fetching segments:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, subject, body')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_campaigns')
        .select('*')
        .order('scheduled_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setCampaignsLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscription = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ 
          subscribed: !currentStatus,
          unsubscribed_at: currentStatus ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;
      
      setSubscribers(subscribers.map(sub => 
        sub.id === id ? { 
          ...sub, 
          subscribed: !currentStatus,
          unsubscribed_at: currentStatus ? new Date().toISOString() : null
        } : sub
      ));
      toast.success(currentStatus ? 'Subscriber unsubscribed' : 'Subscriber resubscribed');
    } catch (error) {
      console.error('Error updating subscriber:', error);
      toast.error('Failed to update subscription');
    }
  };

  const exportToCSV = () => {
    const activeSubscribers = subscribers.filter(s => s.subscribed);
    const csv = [
      ['Email', 'Name', 'Source', 'Subscribed Date'],
      ...activeSubscribers.map(s => [
        s.email,
        s.name || '',
        s.source || 'website',
        format(new Date(s.created_at), 'yyyy-MM-dd')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Subscribers exported');
  };

  const toggleSelectAll = () => {
    const activeSubscribers = filteredSubscribers.filter(s => s.subscribed);
    if (selectedIds.size === activeSubscribers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(activeSubscribers.map(s => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const openBulkEmailDialog = () => {
    if (selectedIds.size === 0) {
      toast.error('Select at least one subscriber');
      return;
    }
    setEmailData({ subject: '', body: '' });
    setIsEmailDialogOpen(true);
  };

  const sendBulkEmail = async () => {
    if (!emailData.subject.trim() || !emailData.body.trim()) {
      toast.error('Subject and body are required');
      return;
    }

    setSending(true);
    try {
      const selectedEmails = subscribers
        .filter(s => selectedIds.has(s.id) && s.subscribed)
        .map(s => ({ email: s.email, name: s.name }));

      const { error } = await supabase.functions.invoke('send-bulk-email', {
        body: {
          recipients: selectedEmails,
          subject: emailData.subject,
          body: emailData.body,
          fromEmail: emailSender.email || undefined,
          fromName: emailSender.name || undefined,
        },
      });

      if (error) throw error;

      toast.success(`Email sent to ${selectedEmails.length} subscribers`);
      setIsEmailDialogOpen(false);
      setSelectedIds(new Set());
    } catch (error: any) {
      console.error('Error sending bulk email:', error);
      toast.error(error.message || 'Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  const openScheduleDialog = () => {
    if (selectedIds.size === 0) {
      toast.error('Select at least one subscriber');
      return;
    }
    setEmailData({ subject: '', body: '' });
    setScheduleDate(undefined);
    setScheduleTime('09:00');
    setIsRecurring(false);
    setRecurrencePattern('weekly');
    setRecurrenceEndDate(undefined);
    setIsScheduleDialogOpen(true);
  };

  const scheduleCampaign = async () => {
    if (!emailData.subject.trim() || !emailData.body.trim()) {
      toast.error('Subject and body are required');
      return;
    }
    if (!scheduleDate) {
      toast.error('Please select a date');
      return;
    }

    setScheduling(true);
    try {
      const [hours, minutes] = scheduleTime.split(':').map(Number);
      const scheduledAt = new Date(scheduleDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      if (scheduledAt <= new Date()) {
        toast.error('Scheduled time must be in the future');
        setScheduling(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      const campaignData: any = {
        subject: emailData.subject,
        body: emailData.body,
        scheduled_at: scheduledAt.toISOString(),
        recipient_count: selectedIds.size,
        created_by: user?.id,
        is_recurring: isRecurring,
      };

      if (isRecurring) {
        campaignData.recurrence_pattern = recurrencePattern;
        if (recurrenceEndDate) {
          campaignData.recurrence_end_date = recurrenceEndDate.toISOString();
        }
      }

      const { error } = await supabase
        .from('scheduled_campaigns')
        .insert(campaignData);

      if (error) throw error;

      toast.success(isRecurring 
        ? `Recurring ${recurrencePattern} campaign scheduled` 
        : 'Campaign scheduled successfully'
      );
      setIsScheduleDialogOpen(false);
      setSelectedIds(new Set());
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error scheduling campaign:', error);
      toast.error(error.message || 'Failed to schedule campaign');
    } finally {
      setScheduling(false);
    }
  };

  const cancelCampaign = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_campaigns')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
      toast.success('Campaign cancelled');
      fetchCampaigns();
    } catch (error) {
      console.error('Error cancelling campaign:', error);
      toast.error('Failed to cancel campaign');
    }
  };

  const assignToSegment = async (segmentId: string) => {
    if (selectedIds.size === 0) {
      toast.error('Select subscribers first');
      return;
    }

    try {
      const memberships = Array.from(selectedIds).map(subscriberId => ({
        subscriber_id: subscriberId,
        segment_id: segmentId,
      }));

      const { error } = await supabase
        .from('subscriber_segment_members')
        .upsert(memberships, { onConflict: 'subscriber_id,segment_id' });

      if (error) throw error;
      
      toast.success(`Added ${selectedIds.size} subscriber${selectedIds.size !== 1 ? 's' : ''} to segment`);
      setIsSegmentDialogOpen(false);
      setSelectedIds(new Set());
      fetchSegments();
    } catch (error) {
      console.error('Error assigning to segment:', error);
      toast.error('Failed to assign to segment');
    }
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    if (filterSegment === 'all') return matchesSearch;
    if (filterSegment === 'no-segment') {
      return matchesSearch && (!subscriberSegments[sub.id] || subscriberSegments[sub.id].length === 0);
    }
    return matchesSearch && subscriberSegments[sub.id]?.includes(filterSegment);
  });

  const activeCount = subscribers.filter(s => s.subscribed).length;
  const activeFilteredCount = filteredSubscribers.filter(s => s.subscribed).length;

  const openPreviewDialog = (campaign: ScheduledCampaign) => {
    setPreviewCampaign(campaign);
    setPreviewTab('content');
    setIsPreviewDialogOpen(true);
  };

  const getOpenRate = (campaign: ScheduledCampaign) => {
    if (campaign.recipient_count === 0) return 0;
    return Math.round((campaign.open_count / campaign.recipient_count) * 100);
  };

  const getClickRate = (campaign: ScheduledCampaign) => {
    if (campaign.recipient_count === 0) return 0;
    return Math.round((campaign.click_count / campaign.recipient_count) * 100);
  };

  const campaignColumns: Column<ScheduledCampaign>[] = [
    {
      header: 'Subject',
      accessorKey: 'subject',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => openPreviewDialog(row)}
            className="font-medium text-left hover:text-primary transition-colors"
          >
            {row.subject}
          </button>
          {row.is_recurring && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Repeat className="h-3 w-3" />
              {row.recurrence_pattern}
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Recipients',
      accessorKey: 'recipient_count',
      cell: (row) => (
        <span className="text-muted-foreground">{row.recipient_count}</span>
      ),
    },
    {
      header: 'Scheduled For',
      cell: (row) => (
        <span className="text-sm">
          {format(new Date(row.scheduled_at), 'MMM d, yyyy h:mm a')}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge
          variant="outline"
          className={cn(
            row.status === 'scheduled' && 'bg-primary/20 text-primary border-primary/30',
            row.status === 'sent' && 'bg-success/20 text-success border-success/30',
            row.status === 'cancelled' && 'bg-muted text-muted-foreground'
          )}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Opens',
      cell: (row) => row.status === 'sent' ? (
        <div className="flex items-center gap-1 text-sm">
          <MailOpen className="h-3 w-3 text-muted-foreground" />
          <span>{row.open_count}</span>
          <span className="text-muted-foreground">({getOpenRate(row)}%)</span>
        </div>
      ) : <span className="text-muted-foreground">-</span>,
    },
    {
      header: 'Clicks',
      cell: (row) => row.status === 'sent' ? (
        <div className="flex items-center gap-1 text-sm">
          <MousePointer className="h-3 w-3 text-muted-foreground" />
          <span>{row.click_count}</span>
          <span className="text-muted-foreground">({getClickRate(row)}%)</span>
        </div>
      ) : <span className="text-muted-foreground">-</span>,
    },
    {
      header: '',
      cell: (row) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openPreviewDialog(row)}
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.status === 'scheduled' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => cancelCampaign(row.id)}
              title="Cancel campaign"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
      className: 'w-24',
    },
  ];

  const columns: Column<Subscriber>[] = [
    {
      header: 'Select',
      cell: (row) => row.subscribed ? (
        <Checkbox
          checked={selectedIds.has(row.id)}
          onCheckedChange={() => toggleSelect(row.id)}
        />
      ) : null,
      className: 'w-12',
    },
    {
      header: 'Email',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (row) => row.name || '-',
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant="outline" className={row.subscribed ? 'bg-success/20 text-success border-success/30' : 'bg-muted text-muted-foreground'}>
          {row.subscribed ? 'Active' : 'Unsubscribed'}
        </Badge>
      ),
    },
    {
      header: 'Source',
      accessorKey: 'source',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{row.source || 'website'}</span>
      ),
    },
    {
      header: 'Date',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.created_at), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      header: '',
      cell: (row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleSubscription(row.id, row.subscribed)}
          title={row.subscribed ? 'Unsubscribe' : 'Resubscribe'}
        >
          <UserMinus className="h-4 w-4" />
        </Button>
      ),
      className: 'w-12',
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
            <h1 className="text-3xl font-bold tracking-tight">Newsletter</h1>
            <p className="text-muted-foreground">
              {activeCount} active subscriber{activeCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </motion.div>

        <Tabs defaultValue="subscribers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="campaigns">Scheduled Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="subscribers" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subscribers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterSegment} onValueChange={setFilterSegment}>
                <SelectTrigger className="w-48">
                  <Tags className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subscribers</SelectItem>
                  <SelectItem value="no-segment">No Segment</SelectItem>
                  {segments.map((seg) => (
                    <SelectItem key={seg.id} value={seg.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                        {seg.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedIds.size > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={openBulkEmailDialog}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Now ({selectedIds.size})
                </Button>
                <Button onClick={openScheduleDialog} variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
                {segments.length > 0 && (
                  <Button onClick={() => setIsSegmentDialogOpen(true)} variant="outline">
                    <Tags className="h-4 w-4 mr-2" />
                    Add to Segment
                  </Button>
                )}
              </div>
            )}

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  {selectedIds.size} subscriber{selectedIds.size !== 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear
                </Button>
              </div>
            )}

            <DataTable
              columns={columns}
              data={filteredSubscribers}
              loading={loading}
              emptyMessage="No subscribers yet"
            />
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <DataTable
              columns={campaignColumns}
              data={campaigns}
              loading={campaignsLoading}
              emptyMessage="No scheduled campaigns"
            />
          </TabsContent>
        </Tabs>

        {/* Bulk Email Dialog with Preview */}
        <Dialog open={isEmailDialogOpen} onOpenChange={(open) => {
          setIsEmailDialogOpen(open);
          if (!open) setPreviewMode('edit');
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Bulk Email</DialogTitle>
              <DialogDescription>
                Send an email to {selectedIds.size} selected subscriber{selectedIds.size !== 1 ? 's' : ''}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex gap-2 mb-4">
              <Button 
                variant={previewMode === 'edit' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setPreviewMode('edit')}
              >
                Edit
              </Button>
              <Button 
                variant={previewMode === 'preview' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setPreviewMode('preview')}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </div>

            {previewMode === 'edit' ? (
              <div className="space-y-4">
                {templates.length > 0 && (
                  <div className="space-y-2">
                    <Label>Load from Template</Label>
                    <Select
                      onValueChange={(value) => {
                        const template = templates.find(t => t.id === value);
                        if (template) {
                          setEmailData({ subject: template.subject, body: template.body });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email-subject">Subject *</Label>
                  <Input
                    id="email-subject"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                    placeholder="Newsletter: Weekly Update"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-body">Body *</Label>
                  <Textarea
                    id="email-body"
                    value={emailData.body}
                    onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                    placeholder="Write your email content here..."
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {"{{name}}"} to personalize with subscriber's name
                  </p>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-card">
                <div className="border-b pb-3 mb-4">
                  <p className="text-xs text-muted-foreground">Subject:</p>
                  <p className="font-medium">{emailData.subject || '(No subject)'}</p>
                </div>
                <div className="prose prose-sm max-w-none">
                  {emailData.body ? (
                    emailData.body.split('\n').map((line, i) => (
                      <p key={i} className="mb-3">{line.replace(/\{\{name\}\}/g, 'John Doe')}</p>
                    ))
                  ) : (
                    <p className="text-muted-foreground">(No content)</p>
                  )}
                </div>
                <hr className="my-4 border-border" />
                <p className="text-xs text-muted-foreground">
                  You received this email because you subscribed to our newsletter.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsEmailDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={sendBulkEmail}
                disabled={sending}
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Campaign Preview Dialog */}
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Campaign Preview
                {previewCampaign?.is_recurring && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Repeat className="h-3 w-3" />
                    {previewCampaign.recurrence_pattern}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {previewCampaign?.status === 'sent' ? 'Sent campaign' : 'Scheduled campaign'}
              </DialogDescription>
            </DialogHeader>
            
            {previewCampaign && (
              <>
                {previewCampaign.status === 'sent' && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-card rounded-lg border">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{previewCampaign.recipient_count}</p>
                      <p className="text-xs text-muted-foreground">Recipients</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{previewCampaign.open_count}</p>
                      <p className="text-xs text-muted-foreground">Opens ({getOpenRate(previewCampaign)}%)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">{previewCampaign.click_count}</p>
                      <p className="text-xs text-muted-foreground">Clicks ({getClickRate(previewCampaign)}%)</p>
                    </div>
                  </div>
                )}

                {previewCampaign.status === 'sent' ? (
                  <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as 'content' | 'heatmap')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="heatmap" className="gap-1">
                        <MousePointer className="h-3 w-3" />
                        Click Heatmap
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="content" className="mt-4">
                      <div className="border rounded-lg p-4 bg-card">
                        <div className="border-b pb-3 mb-4">
                          <p className="text-xs text-muted-foreground">Subject:</p>
                          <p className="font-medium">{previewCampaign.subject}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Sent on {format(new Date(previewCampaign.sent_at!), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: previewCampaign.body }} />
                        <hr className="my-4 border-border" />
                        <p className="text-xs text-muted-foreground">
                          You received this email because you subscribed to our newsletter.
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="heatmap" className="mt-4">
                      <ClickHeatmap 
                        campaignId={previewCampaign.id}
                        totalRecipients={previewCampaign.recipient_count}
                      />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="border rounded-lg p-4 bg-card">
                    <div className="border-b pb-3 mb-4">
                      <p className="text-xs text-muted-foreground">Subject:</p>
                      <p className="font-medium">{previewCampaign.subject}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Scheduled for {format(new Date(previewCampaign.scheduled_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: previewCampaign.body }} />
                    <hr className="my-4 border-border" />
                    <p className="text-xs text-muted-foreground">
                      You received this email because you subscribed to our newsletter.
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsPreviewDialogOpen(false)}
                >
                  Close
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Schedule Campaign Dialog */}
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule Email Campaign</DialogTitle>
              <DialogDescription>
                Schedule an email for {selectedIds.size} subscriber{selectedIds.size !== 1 ? 's' : ''}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {templates.length > 0 && (
                <div className="space-y-2">
                  <Label>Load from Template</Label>
                  <Select
                    onValueChange={(value) => {
                      const template = templates.find(t => t.id === value);
                      if (template) {
                        setEmailData({ subject: template.subject, body: template.body });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="schedule-subject">Subject *</Label>
                <Input
                  id="schedule-subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  placeholder="Newsletter: Weekly Update"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-body">Body *</Label>
                <Textarea
                  id="schedule-body"
                  value={emailData.body}
                  onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                  placeholder="Write your email content here..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{{name}}"} to personalize with subscriber's name
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !scheduleDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduleDate ? format(scheduleDate, "PPP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduleDate}
                        onSelect={setScheduleDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule-time">Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="schedule-time"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Recurring Options */}
              <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="is-recurring">Make this a recurring campaign</Label>
                  </div>
                  <Switch
                    id="is-recurring"
                    checked={isRecurring}
                    onCheckedChange={setIsRecurring}
                  />
                </div>
                
                {isRecurring && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select value={recurrencePattern} onValueChange={setRecurrencePattern}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RECURRENCE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>End Date (optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !recurrenceEndDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {recurrenceEndDate ? format(recurrenceEndDate, "PPP") : "No end"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={recurrenceEndDate}
                            onSelect={setRecurrenceEndDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsScheduleDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={scheduleCampaign}
                  disabled={scheduling}
                >
                  {scheduling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Schedule Campaign
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign to Segment Dialog */}
        <Dialog open={isSegmentDialogOpen} onOpenChange={setIsSegmentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Segment</DialogTitle>
              <DialogDescription>
                Select a segment to add {selectedIds.size} subscriber{selectedIds.size !== 1 ? 's' : ''}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {segments.map((segment) => (
                <button
                  key={segment.id}
                  onClick={() => assignToSegment(segment.id)}
                  className="flex items-center gap-3 w-full p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="font-medium">{segment.name}</span>
                </button>
              ))}
              {segments.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No segments created yet. Create segments first.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
