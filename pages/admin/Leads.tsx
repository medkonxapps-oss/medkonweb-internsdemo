import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTable, { Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Search, Filter, Eye, Download, MessageCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  source: string | null;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
}

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-info/20 text-info border-info/30',
  contacted: 'bg-warning/20 text-warning border-warning/30',
  qualified: 'bg-primary/20 text-primary border-primary/30',
  converted: 'bg-success/20 text-success border-success/30',
  lost: 'bg-destructive/20 text-destructive border-destructive/30',
};

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState('');
  const [whatsappDialog, setWhatsappDialog] = useState<Lead | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (id: string, status: LeadStatus) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setLeads(leads.map(lead => 
        lead.id === id ? { ...lead, status } : lead
      ));
      toast.success('Status updated');
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update status');
    }
  };

  const updateLeadNotes = async () => {
    if (!selectedLead) return;
    
    try {
      const { error } = await supabase
        .from('leads')
        .update({ notes })
        .eq('id', selectedLead.id);

      if (error) throw error;
      
      setLeads(leads.map(lead => 
        lead.id === selectedLead.id ? { ...lead, notes } : lead
      ));
      toast.success('Notes saved');
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to save notes');
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Company', 'Status', 'Source', 'Message', 'Date'],
      ...leads.map(l => [
        l.name,
        l.email,
        l.phone || '',
        l.company || '',
        l.status,
        l.source || 'website',
        (l.message || '').replace(/[\n,]/g, ' '),
        format(new Date(l.created_at), 'yyyy-MM-dd')
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Leads exported');
  };

  const sendWhatsApp = async () => {
    if (!whatsappDialog?.phone || !whatsappMessage) {
      toast.error('Phone number and message are required');
      return;
    }

    setSendingWhatsapp(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: whatsappDialog.phone,
          message: whatsappMessage,
          leadId: whatsappDialog.id
        }
      });

      if (error) throw error;
      
      toast.success('WhatsApp message sent successfully');
      setWhatsappDialog(null);
      setWhatsappMessage('');
      fetchLeads(); // Refresh to see updated notes
    } catch (error: any) {
      console.error('Error sending WhatsApp:', error);
      toast.error(error.message || 'Failed to send WhatsApp message');
    } finally {
      setSendingWhatsapp(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Lead>[] = [
    {
      header: 'Name',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-sm text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Company',
      accessorKey: 'company',
      cell: (row) => row.company || '-',
    },
    {
      header: 'Status',
      cell: (row) => (
        <Select
          value={row.status}
          onValueChange={(value) => updateLeadStatus(row.id, value as LeadStatus)}
        >
          <SelectTrigger className="w-32 h-8">
            <Badge variant="outline" className={statusColors[row.status]}>
              {row.status}
            </Badge>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
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
        <div className="flex gap-1">
          {row.phone && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setWhatsappDialog(row);
                setWhatsappMessage(`Hi ${row.name}, thank you for your interest. `);
              }}
              title="Send WhatsApp"
            >
              <MessageCircle className="h-4 w-4 text-chart-2" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedLead(row);
              setNotes(row.notes || '');
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'w-24',
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
            <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
            <p className="text-muted-foreground">Manage your incoming leads</p>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={filteredLeads}
          loading={loading}
          emptyMessage="No leads found"
        />

        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Lead Details</DialogTitle>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedLead.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedLead.email}</p>
                  </div>
                  {selectedLead.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedLead.phone}</p>
                    </div>
                  )}
                  {selectedLead.company && (
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium">{selectedLead.company}</p>
                    </div>
                  )}
                </div>
                {selectedLead.message && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Message</p>
                    <p className="text-sm bg-secondary/50 p-3 rounded-lg">{selectedLead.message}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Notes</p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this lead..."
                    rows={4}
                  />
                </div>
                <Button onClick={updateLeadNotes} className="w-full">
                  Save Notes
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* WhatsApp Dialog */}
        <Dialog open={!!whatsappDialog} onOpenChange={() => setWhatsappDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-chart-2" />
                Send WhatsApp Message
              </DialogTitle>
            </DialogHeader>
            {whatsappDialog && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">To</p>
                  <p className="font-medium">{whatsappDialog.name} ({whatsappDialog.phone})</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Message</p>
                  <Textarea
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={sendWhatsApp} 
                  className="w-full"
                  disabled={sendingWhatsapp || !whatsappMessage}
                >
                  {sendingWhatsapp ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send WhatsApp
                    </>
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
