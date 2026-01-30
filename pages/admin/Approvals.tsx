import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Plus, Check, X, Clock, FileCheck, 
  Calendar, DollarSign, Receipt, User,
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { findUserById, getUserDisplayName } from '@/lib/userUtils';
import UserDebugInfo from '@/components/admin/UserDebugInfo';

interface ApprovalRequest {
  id: string;
  title: string;
  description: string | null;
  request_type: string;
  status: string;
  requested_by: string;
  assigned_to: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  metadata: any;
  created_at: string;
  requester?: { email: string; full_name: string | null };
  approver?: { email: string; full_name: string | null };
}

interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
}

const REQUEST_TYPES = [
  { value: 'leave', label: 'Leave Request', icon: Calendar, color: 'bg-blue-500' },
  { value: 'discount', label: 'Discount Approval', icon: DollarSign, color: 'bg-green-500' },
  { value: 'expense', label: 'Expense Claim', icon: Receipt, color: 'bg-orange-500' },
  { value: 'custom', label: 'Other', icon: FileCheck, color: 'bg-purple-500' },
];

export default function Approvals() {
  const { user, userRole } = useAuth();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    request_type: 'leave',
    assigned_to: '',
    // Leave specific
    leave_start: '',
    leave_end: '',
    leave_type: 'annual',
    // Discount specific
    discount_amount: '',
    discount_reason: '',
    // Expense specific
    expense_amount: '',
    expense_category: '',
  });
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, profilesRes] = await Promise.all([
        supabase
          .from('approval_requests')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, email, full_name'),
      ]);

      if (requestsRes.error) throw requestsRes.error;
      
      setRequests(requestsRes.data || []);
      setTeamMembers(profilesRes.data || []);
    } catch (error) {
      console.error('Error fetching approvals:', error);
      toast.error('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (activeTab === 'pending') return r.status === 'pending';
    if (activeTab === 'approved') return r.status === 'approved';
    if (activeTab === 'rejected') return r.status === 'rejected';
    if (activeTab === 'my') return r.requested_by === user?.id;
    return true;
  });

  const openCreateDialog = () => {
    setFormData({
      title: '',
      description: '',
      request_type: 'leave',
      assigned_to: '',
      leave_start: '',
      leave_end: '',
      leave_type: 'annual',
      discount_amount: '',
      discount_reason: '',
      expense_amount: '',
      expense_category: '',
    });
    setIsDialogOpen(true);
  };

  const saveRequest = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    try {
      let metadata: any = {};
      
      if (formData.request_type === 'leave') {
        metadata = {
          leave_start: formData.leave_start,
          leave_end: formData.leave_end,
          leave_type: formData.leave_type,
        };
      } else if (formData.request_type === 'discount') {
        metadata = {
          discount_amount: formData.discount_amount,
          discount_reason: formData.discount_reason,
        };
      } else if (formData.request_type === 'expense') {
        metadata = {
          expense_amount: formData.expense_amount,
          expense_category: formData.expense_category,
        };
      }

      const { error } = await supabase.from('approval_requests').insert({
        title: formData.title,
        description: formData.description || null,
        request_type: formData.request_type,
        requested_by: user?.id,
        assigned_to: formData.assigned_to || null,
        metadata,
      });

      if (error) throw error;
      toast.success('Request submitted');
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving request:', error);
      toast.error('Failed to submit request');
    } finally {
      setSaving(false);
    }
  };

  const approveRequest = async (request: ApprovalRequest) => {
    try {
      const { error } = await supabase
        .from('approval_requests')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      if (error) throw error;

      // Create notification for requester
      await supabase.rpc('create_notification', {
        p_user_id: request.requested_by,
        p_title: 'Request Approved',
        p_message: `Your request "${request.title}" has been approved`,
        p_type: 'success',
        p_link: '/admin/approvals',
      });

      toast.success('Request approved');
      fetchData();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const openRejectDialog = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setIsRejectDialogOpen(true);
  };

  const rejectRequest = async () => {
    if (!selectedRequest) return;

    try {
      const { error } = await supabase
        .from('approval_requests')
        .update({
          status: 'rejected',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          rejection_reason: rejectionReason || null,
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      // Create notification for requester
      await supabase.rpc('create_notification', {
        p_user_id: selectedRequest.requested_by,
        p_title: 'Request Rejected',
        p_message: `Your request "${selectedRequest.title}" has been rejected`,
        p_type: 'error',
        p_link: '/admin/approvals',
      });

      toast.success('Request rejected');
      setIsRejectDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const getTypeInfo = (type: string) => {
    return REQUEST_TYPES.find(t => t.value === type) || REQUEST_TYPES[3];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 gap-1"><CheckCircle2 className="h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    }
  };

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Approvals</h1>
            <p className="text-muted-foreground">Manage approval requests and workflows</p>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.approved}</div>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-500/10">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.rejected}</div>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending" className="gap-1">
              <Clock className="h-4 w-4" />
              Pending ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="my">My Requests</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 space-y-4">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No {activeTab} requests</p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map((request) => {
                const typeInfo = getTypeInfo(request.request_type);
                const TypeIcon = typeInfo.icon;
                
                return (
                  <Card key={request.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${typeInfo.color}/10`}>
                          <TypeIcon className={`h-5 w-5 ${typeInfo.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{request.title}</span>
                            <Badge variant="outline">{typeInfo.label}</Badge>
                            {getStatusBadge(request.status)}
                          </div>
                          {request.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {request.description}
                            </p>
                          )}
                          
                          {/* Metadata display */}
                          {request.metadata && (
                            <div className="flex flex-wrap gap-3 mt-2 text-xs">
                              {request.request_type === 'leave' && request.metadata.leave_start && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {request.metadata.leave_start} to {request.metadata.leave_end}
                                </span>
                              )}
                              {request.request_type === 'discount' && request.metadata.discount_amount && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <DollarSign className="h-3 w-3" />
                                  {request.metadata.discount_amount}% discount
                                </span>
                              )}
                              {request.request_type === 'expense' && request.metadata.expense_amount && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Receipt className="h-3 w-3" />
                                  ₹{request.metadata.expense_amount}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {getUserDisplayName(findUserById(teamMembers, request.requested_by))}
                            </span>
                            <span>{format(new Date(request.created_at), 'MMM d, yyyy')}</span>
                            {request.rejection_reason && (
                              <span className="text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {request.rejection_reason}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Debug info - temporary */}
                        <div className="text-xs text-muted-foreground mb-2">
                          Status: {request.status} | IsAdmin: {isAdmin ? 'Yes' : 'No'} | 
                          Requested by: {request.requested_by} | Current user: {user?.id}
                        </div>
                        
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="gap-1 bg-green-500 hover:bg-green-600"
                              onClick={() => approveRequest(request)}
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              className="gap-1"
                              onClick={() => openRejectDialog(request)}
                            >
                              <X className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Create Request Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Approval Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Request Type</Label>
                <Select 
                  value={formData.request_type} 
                  onValueChange={(v) => setFormData({ ...formData, request_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUEST_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          <t.icon className="h-4 w-4" />
                          {t.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Request title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide details..."
                  rows={3}
                />
              </div>

              {/* Leave specific fields */}
              {formData.request_type === 'leave' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={formData.leave_start}
                        onChange={(e) => setFormData({ ...formData, leave_start: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={formData.leave_end}
                        onChange={(e) => setFormData({ ...formData, leave_end: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Leave Type</Label>
                    <Select 
                      value={formData.leave_type} 
                      onValueChange={(v) => setFormData({ ...formData, leave_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual">Annual Leave</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="personal">Personal Leave</SelectItem>
                        <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Discount specific fields */}
              {formData.request_type === 'discount' && (
                <>
                  <div>
                    <Label>Discount Percentage</Label>
                    <Input
                      type="number"
                      value={formData.discount_amount}
                      onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                      placeholder="e.g., 15"
                    />
                  </div>
                  <div>
                    <Label>Reason for Discount</Label>
                    <Input
                      value={formData.discount_reason}
                      onChange={(e) => setFormData({ ...formData, discount_reason: e.target.value })}
                      placeholder="Customer loyalty, bulk order, etc."
                    />
                  </div>
                </>
              )}

              {/* Expense specific fields */}
              {formData.request_type === 'expense' && (
                <>
                  <div>
                    <Label>Amount (₹)</Label>
                    <Input
                      type="number"
                      value={formData.expense_amount}
                      onChange={(e) => setFormData({ ...formData, expense_amount: e.target.value })}
                      placeholder="e.g., 5000"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select 
                      value={formData.expense_category} 
                      onValueChange={(v) => setFormData({ ...formData, expense_category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="meals">Meals</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div>
                <Label>Assign Approver (Optional)</Label>
                <Select 
                  value={formData.assigned_to} 
                  onValueChange={(v) => setFormData({ ...formData, assigned_to: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-assign to admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.full_name || m.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={saveRequest} disabled={saving}>
                  {saving ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to reject "{selectedRequest?.title}"?
              </p>
              <div>
                <Label>Reason (Optional)</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={rejectRequest}>Reject Request</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
      <UserDebugInfo />
    </AdminLayout>
  );
}
