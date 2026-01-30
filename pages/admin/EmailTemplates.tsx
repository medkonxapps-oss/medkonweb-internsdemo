import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTable, { Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { EmailBlockBuilder, EmailBlock, blocksToHtml, htmlToBlocks } from '@/components/admin/EmailBlockBuilder';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { toast } from 'sonner';
import { Plus, FileText, Pencil, Trash2, Copy, Eye, Download, Upload, Info, Blocks, Code } from 'lucide-react';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = ['general', 'welcome', 'promotion', 'announcement', 'newsletter'];

export default function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'general',
    is_default: false,
  });
  const [saving, setSaving] = useState(false);
  const [isVariablesOpen, setIsVariablesOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'blocks' | 'code'>('blocks');
  const [emailBlocks, setEmailBlocks] = useState<EmailBlock[]>([]);

  const TEMPLATE_VARIABLES = [
    { variable: '{{name}}', description: "Subscriber's name" },
    { variable: '{{email}}', description: "Subscriber's email" },
    { variable: '{{date}}', description: 'Current date (e.g., January 15, 2024)' },
    { variable: '{{company_name}}', description: 'Your company name (set in Settings)' },
    { variable: '{{website_url}}', description: 'Your website URL (set in Settings)' },
    { variable: '{{support_email}}', description: 'Support email (set in Settings)' },
    { variable: '{{unsubscribe_link}}', description: 'Unsubscribe link (auto-added)' },
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      subject: '',
      body: '',
      category: 'general',
      is_default: false,
    });
    setEmailBlocks([]);
    setEditorMode('blocks');
    setIsDialogOpen(true);
  };

  const openEditDialog = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: template.category,
      is_default: template.is_default,
    });
    // Try to parse existing HTML into blocks
    const parsedBlocks = htmlToBlocks(template.body);
    setEmailBlocks(parsedBlocks);
    setEditorMode('code'); // Default to code mode for existing templates
    setIsDialogOpen(true);
  };

  const openPreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const duplicateTemplate = async (template: EmailTemplate) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('email_templates')
        .insert({
          name: `${template.name} (Copy)`,
          subject: template.subject,
          body: template.body,
          category: template.category,
          is_default: false,
          created_by: user?.id,
        });

      if (error) throw error;
      toast.success('Template duplicated');
      fetchTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Template deleted');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const exportTemplates = () => {
    const exportData = templates.map(t => ({
      name: t.name,
      subject: t.subject,
      body: t.body,
      category: t.category,
      is_default: t.is_default,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-templates-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Templates exported');
  };

  const importTemplates = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedTemplates = JSON.parse(text);

      if (!Array.isArray(importedTemplates)) {
        throw new Error('Invalid format: expected an array of templates');
      }

      const { data: { user } } = await supabase.auth.getUser();

      let imported = 0;
      for (const template of importedTemplates) {
        if (!template.name || !template.subject || !template.body) continue;

        const { error } = await supabase
          .from('email_templates')
          .insert({
            name: template.name,
            subject: template.subject,
            body: template.body,
            category: template.category || 'general',
            is_default: false,
            created_by: user?.id,
          });

        if (!error) imported++;
      }

      toast.success(`Imported ${imported} template${imported !== 1 ? 's' : ''}`);
      fetchTemplates();
    } catch (error: any) {
      console.error('Error importing templates:', error);
      toast.error(error.message || 'Failed to import templates');
    }

    // Reset input
    event.target.value = '';
  };

  const handleEditorModeChange = (mode: string) => {
    if (mode === 'blocks') {
      // Convert current HTML to blocks
      const blocks = htmlToBlocks(formData.body);
      setEmailBlocks(blocks.length > 0 ? blocks : []);
    } else if (mode === 'code') {
      // Convert blocks to HTML
      if (emailBlocks.length > 0) {
        const html = blocksToHtml(emailBlocks);
        setFormData(prev => ({ ...prev, body: html }));
      }
    }
    setEditorMode(mode as 'blocks' | 'code');
  };

  const saveTemplate = async () => {
    // Get the body content based on editor mode
    let bodyContent = formData.body;
    if (editorMode === 'blocks' && emailBlocks.length > 0) {
      bodyContent = blocksToHtml(emailBlocks);
    }

    if (!formData.name.trim() || !formData.subject.trim() || !bodyContent.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (editingTemplate) {
        const { error } = await supabase
          .from('email_templates')
          .update({
            name: formData.name,
            subject: formData.subject,
            body: bodyContent,
            category: formData.category,
            is_default: formData.is_default,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast.success('Template updated');
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert({
            name: formData.name,
            subject: formData.subject,
            body: bodyContent,
            category: formData.category,
            is_default: formData.is_default,
            created_by: user?.id,
          });

        if (error) throw error;
        toast.success('Template created');
      }

      setIsDialogOpen(false);
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<EmailTemplate>[] = [
    {
      header: 'Name',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.name}</span>
          {row.is_default && (
            <Badge variant="secondary" className="text-xs">Default</Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Subject',
      accessorKey: 'subject',
      cell: (row) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {row.subject}
        </span>
      ),
    },
    {
      header: 'Category',
      cell: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.category}
        </Badge>
      ),
    },
    {
      header: 'Updated',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.updated_at), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      header: '',
      cell: (row) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openPreview(row)}
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditDialog(row)}
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => duplicateTemplate(row)}
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteTemplate(row.id)}
            title="Delete"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'w-40',
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
            <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
            <p className="text-muted-foreground">
              {templates.length} template{templates.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".json"
              onChange={importTemplates}
              className="hidden"
              id="import-templates"
            />
            <Button variant="outline" onClick={() => document.getElementById('import-templates')?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" onClick={exportTemplates} disabled={templates.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </motion.div>

        {/* Available Variables Info */}
        <div className="p-4 rounded-lg border border-border bg-card/50">
          <button
            onClick={() => setIsVariablesOpen(!isVariablesOpen)}
            className="flex items-center gap-2 text-sm font-medium w-full"
          >
            <Info className="h-4 w-4 text-primary" />
            Available Template Variables
            <span className="text-muted-foreground ml-auto">{isVariablesOpen ? '−' : '+'}</span>
          </button>
          {isVariablesOpen && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
              {TEMPLATE_VARIABLES.map((v) => (
                <Tooltip key={v.variable}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm cursor-help">
                      <code className="text-primary">{v.variable}</code>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{v.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={templates}
          loading={loading}
          emptyMessage="No templates yet. Create your first template to get started."
        />

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </DialogTitle>
              <DialogDescription>
                {editingTemplate 
                  ? 'Update your email template' 
                  : 'Create a reusable email template for your campaigns'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name *</Label>
                  <Input
                    id="template-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Welcome Email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="capitalize">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-subject">Subject Line *</Label>
                <Input
                  id="template-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Welcome to our newsletter!"
                />
              </div>
              
              {/* Editor Mode Tabs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Email Body *</Label>
                  <Tabs value={editorMode} onValueChange={handleEditorModeChange}>
                    <TabsList className="h-8">
                      <TabsTrigger value="blocks" className="text-xs gap-1 h-7">
                        <Blocks className="h-3 w-3" />
                        Block Builder
                      </TabsTrigger>
                      <TabsTrigger value="code" className="text-xs gap-1 h-7">
                        <Code className="h-3 w-3" />
                        Rich Text
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                {editorMode === 'blocks' ? (
                  <EmailBlockBuilder
                    blocks={emailBlocks}
                    onBlocksChange={setEmailBlocks}
                  />
                ) : (
                  <RichTextEditor
                    content={formData.body}
                    onChange={(content) => setFormData({ ...formData, body: content })}
                    placeholder="Hi {{name}}, Thank you for subscribing..."
                  />
                )}
                
                <p className="text-xs text-muted-foreground">
                  Use template variables like {"{{name}}"}, {"{{email}}"}, {"{{company_name}}"} for personalization
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="is-default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                />
                <Label htmlFor="is-default">Set as default template</Label>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={saveTemplate}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : (editingTemplate ? 'Update Template' : 'Create Template')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Template Preview</DialogTitle>
              <DialogDescription>
                {previewTemplate?.name}
              </DialogDescription>
            </DialogHeader>
            {previewTemplate && (
              <div className="border rounded-lg p-4 bg-card">
                <div className="border-b pb-3 mb-4">
                  <p className="text-xs text-muted-foreground">Subject:</p>
                  <p className="font-medium">{previewTemplate.subject}</p>
                </div>
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ 
                    __html: previewTemplate.body
                      .replace(/\{\{name\}\}/g, 'John Doe')
                      .replace(/\{\{email\}\}/g, 'john@example.com')
                      .replace(/\{\{date\}\}/g, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
                      .replace(/\{\{company_name\}\}/g, 'Your Company')
                      .replace(/\{\{website_url\}\}/g, 'https://example.com')
                      .replace(/\{\{support_email\}\}/g, 'support@example.com')
                  }}
                />
                <hr className="my-4 border-border" />
                <p className="text-xs text-muted-foreground">
                  You received this email because you subscribed to our newsletter.
                  <br />
                  <span className="underline">Unsubscribe</span>
                </p>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsPreviewOpen(false)}
            >
              Close
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
