import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTable, { Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Search, Package, Download, Edit, Trash2, Upload, X, FileArchive } from 'lucide-react';

type PluginType = 'wordpress' | 'chrome' | 'figma';

interface Plugin {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  features: string[] | null;
  tech_stack: string[] | null;
  type: PluginType;
  version: string | null;
  file_url: string | null;
  thumbnail_url: string | null;
  auto_send: boolean;
  download_count: number;
  is_active: boolean;
  created_at: string;
}

const typeColors: Record<PluginType, string> = {
  wordpress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  chrome: 'bg-green-500/20 text-green-400 border-green-500/30',
  figma: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const defaultPlugin = {
  name: '',
  slug: '',
  description: '',
  features: '',
  tech_stack: '',
  type: 'wordpress' as PluginType,
  version: '1.0.0',
  file_url: '',
  thumbnail_url: '',
  auto_send: false,
  is_active: true,
};

export default function Plugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlugin, setEditingPlugin] = useState<Plugin | null>(null);
  const [formData, setFormData] = useState(defaultPlugin);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      const { data, error } = await supabase
        .from('plugins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlugins(data || []);
    } catch (error) {
      console.error('Error fetching plugins:', error);
      toast.error('Failed to load plugins');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (plugin: Plugin) => {
    setEditingPlugin(plugin);
    setFormData({
      name: plugin.name,
      slug: plugin.slug,
      description: plugin.description || '',
      features: plugin.features?.join('\n') || '',
      tech_stack: plugin.tech_stack?.join(', ') || '',
      type: plugin.type,
      version: plugin.version || '1.0.0',
      file_url: plugin.file_url || '',
      thumbnail_url: plugin.thumbnail_url || '',
      auto_send: plugin.auto_send,
      is_active: plugin.is_active,
    });
    setUploadedFileName(plugin.file_url ? plugin.file_url.split('/').pop() || null : null);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingPlugin(null);
    setFormData(defaultPlugin);
    setUploadedFileName(null);
    setIsDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${formData.slug || generateSlug(formData.name)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('plugins')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('plugins')
        .getPublicUrl(filePath);

      setFormData({ ...formData, file_url: publicUrl });
      setUploadedFileName(file.name);
      toast.success('File uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async () => {
    if (formData.file_url) {
      try {
        const fileName = formData.file_url.split('/').pop();
        if (fileName) {
          await supabase.storage.from('plugins').remove([fileName]);
        }
      } catch (error) {
        console.error('Error removing file:', error);
      }
    }
    setFormData({ ...formData, file_url: '' });
    setUploadedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const pluginData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description || null,
        features: formData.features ? formData.features.split('\n').filter(f => f.trim()) : null,
        tech_stack: formData.tech_stack ? formData.tech_stack.split(',').map(t => t.trim()).filter(t => t) : null,
        type: formData.type,
        version: formData.version,
        file_url: formData.file_url || null,
        thumbnail_url: formData.thumbnail_url || null,
        auto_send: formData.auto_send,
        is_active: formData.is_active,
      };

      if (editingPlugin) {
        const { error } = await supabase
          .from('plugins')
          .update(pluginData)
          .eq('id', editingPlugin.id);

        if (error) throw error;
        toast.success('Plugin updated');
      } else {
        const { error } = await supabase
          .from('plugins')
          .insert(pluginData);

        if (error) throw error;
        toast.success('Plugin created');
      }

      setIsDialogOpen(false);
      fetchPlugins();
    } catch (error: any) {
      console.error('Error saving plugin:', error);
      toast.error(error.message || 'Failed to save plugin');
    } finally {
      setSaving(false);
    }
  };

  const deletePlugin = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plugin?')) return;

    try {
      const { error } = await supabase.from('plugins').delete().eq('id', id);
      if (error) throw error;
      
      setPlugins(plugins.filter(p => p.id !== id));
      toast.success('Plugin deleted');
    } catch (error) {
      console.error('Error deleting plugin:', error);
      toast.error('Failed to delete plugin');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('plugins')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      
      setPlugins(plugins.map(p => 
        p.id === id ? { ...p, is_active: !isActive } : p
      ));
    } catch (error) {
      console.error('Error toggling plugin:', error);
      toast.error('Failed to update plugin');
    }
  };

  const filteredPlugins = plugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Plugin>[] = [
    {
      header: 'Plugin',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-sm text-muted-foreground">v{row.version}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (row) => (
        <Badge variant="outline" className={typeColors[row.type]}>
          {row.type}
        </Badge>
      ),
    },
    {
      header: 'File',
      cell: (row) => (
        row.file_url ? (
          <Badge variant="outline" className="bg-success/20 text-success">
            <FileArchive className="h-3 w-3 mr-1" />
            Uploaded
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            No file
          </Badge>
        )
      ),
    },
    {
      header: 'Downloads',
      cell: (row) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Download className="h-4 w-4" />
          {row.download_count}
        </div>
      ),
    },
    {
      header: 'Active',
      cell: (row) => (
        <Switch
          checked={row.is_active}
          onCheckedChange={() => toggleActive(row.id, row.is_active)}
        />
      ),
    },
    {
      header: '',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => deletePlugin(row.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
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
            <h1 className="text-3xl font-bold tracking-tight">Plugins</h1>
            <p className="text-muted-foreground">Manage your plugins and extensions</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Plugin
          </Button>
        </motion.div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plugins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredPlugins}
          loading={loading}
          emptyMessage="No plugins yet"
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlugin ? 'Edit Plugin' : 'Add Plugin'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated-from-name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as PluginType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wordpress">WordPress</SelectItem>
                      <SelectItem value="chrome">Chrome</SelectItem>
                      <SelectItem value="figma">Figma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  rows={3}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tech_stack">Tech Stack (comma-separated)</Label>
                <Input
                  id="tech_stack"
                  value={formData.tech_stack}
                  onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                  placeholder="React, TypeScript, Node.js"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Plugin File</Label>
                {uploadedFileName ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary border border-border">
                    <FileArchive className="h-5 w-5 text-primary" />
                    <span className="flex-1 text-sm truncate">{uploadedFileName}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {uploading ? 'Uploading...' : 'Click to upload plugin file'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ZIP, RAR, or other archive formats
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".zip,.rar,.7z,.tar,.gz"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto_send">Auto-send on download request</Label>
                <Switch
                  id="auto_send"
                  checked={formData.auto_send}
                  onCheckedChange={(checked) => setFormData({ ...formData, auto_send: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving || uploading}>
                {saving ? 'Saving...' : editingPlugin ? 'Update Plugin' : 'Create Plugin'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
