import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Mail, Package, Globe, Loader2, FileText, AlertCircle } from 'lucide-react';

interface EmailTemplate {
  subject: string;
  body: string;
}

interface EmailSenderSettings {
  email: string;
  name: string;
}

interface SettingsData {
  plugin_auto_send: { enabled: boolean };
  site_settings: { maintenance_mode: boolean };
  email_sender: EmailSenderSettings;
  email_templates: {
    lead_notification: EmailTemplate;
    plugin_download: EmailTemplate;
    welcome_subscriber: EmailTemplate;
  };
}

export default function Settings() {
  const { user, userRole } = useAuth();
  const [settings, setSettings] = useState<SettingsData>({
    plugin_auto_send: { enabled: false },
    site_settings: { maintenance_mode: false },
    email_sender: { email: '', name: 'Newsletter' },
    email_templates: {
      lead_notification: {
        subject: 'New Lead Received: {{name}}',
        body: 'You have received a new lead from {{name}} ({{email}}).\n\nMessage:\n{{message}}\n\nCompany: {{company}}\nPhone: {{phone}}',
      },
      plugin_download: {
        subject: 'Your Plugin Download: {{plugin_name}}',
        body: 'Hi {{name}},\n\nThank you for your interest in {{plugin_name}}!\n\nYou can download it from the link below:\n{{download_link}}\n\nBest regards,\nThe Team',
      },
      welcome_subscriber: {
        subject: 'Welcome to Our Newsletter!',
        body: 'Hi {{name}},\n\nThank you for subscribing to our newsletter!\n\nYou will now receive updates about our latest products, tutorials, and news.\n\nBest regards,\nThe Team',
      },
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    avatar_url: '',
  });

  const isSuperAdmin = userRole === 'super_admin';

  useEffect(() => {
    fetchSettings();
    fetchProfile();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value');

      if (error) throw error;

      const settingsMap: any = {};
      data?.forEach(s => {
        settingsMap[s.key] = s.value;
      });

      setSettings(prev => ({
        ...prev,
        plugin_auto_send: settingsMap.plugin_auto_send || { enabled: false },
        site_settings: settingsMap.site_settings || { maintenance_mode: false },
        email_sender: settingsMap.email_sender || { email: '', name: 'Newsletter' },
        email_templates: settingsMap.email_templates || prev.email_templates,
      }));
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          avatar_url: data.avatar_url || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    if (!isSuperAdmin) {
      toast.error('Only super admins can change settings');
      return;
    }

    try {
      // Try update first
      const { error: updateError, count } = await supabase
        .from('settings')
        .update({ value })
        .eq('key', key)
        .select();

      // If no rows updated, insert instead
      if (count === 0) {
        const { error: insertError } = await supabase
          .from('settings')
          .insert({ key, value });
        if (insertError) throw insertError;
      } else if (updateError) {
        throw updateError;
      }
      
      setSettings(prev => ({ ...prev, [key]: value }));
      toast.success('Setting updated');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    }
  };

  const updateEmailTemplate = (templateKey: string, field: 'subject' | 'body', value: string) => {
    setSettings(prev => ({
      ...prev,
      email_templates: {
        ...prev.email_templates,
        [templateKey]: {
          ...prev.email_templates[templateKey as keyof typeof prev.email_templates],
          [field]: value,
        },
      },
    }));
  };

  const saveEmailTemplates = async () => {
    await updateSetting('email_templates', settings.email_templates);
  };

  const saveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application settings</p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  value={profileData.avatar_url}
                  onChange={(e) => setProfileData({ ...profileData, avatar_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <Button onClick={saveProfile} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className="text-sm font-medium capitalize">{userRole?.replace('_', ' ') || 'User'}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">User ID</span>
                <span className="text-sm font-mono text-muted-foreground">{user?.id.slice(0, 8)}...</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Settings - Super Admin Only */}
        {isSuperAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-4">System Settings</h2>
            <Tabs defaultValue="email-sender" className="space-y-4">
              <TabsList>
                <TabsTrigger value="email-sender">Email Sender</TabsTrigger>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="email">Email Templates</TabsTrigger>
              </TabsList>

              <TabsContent value="email-sender" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email Sender Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure your verified Resend domain to send newsletters from your own email address
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-600 dark:text-amber-400">Important: Verify your domain first</p>
                        <p className="text-muted-foreground mt-1">
                          To send emails to real recipients, you must verify your domain at{' '}
                          <a 
                            href="https://resend.com/domains" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary underline hover:no-underline"
                          >
                            resend.com/domains
                          </a>
                          . The default test domain only sends to your registered Resend email.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="sender_email">Sender Email Address</Label>
                        <Input
                          id="sender_email"
                          type="email"
                          value={settings.email_sender.email}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            email_sender: { ...prev.email_sender, email: e.target.value }
                          }))}
                          placeholder="newsletter@yourdomain.com"
                        />
                        <p className="text-xs text-muted-foreground">
                          Use an email from your verified domain (e.g., newsletter@yourdomain.com)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sender_name">Sender Name</Label>
                        <Input
                          id="sender_name"
                          value={settings.email_sender.name}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            email_sender: { ...prev.email_sender, name: e.target.value }
                          }))}
                          placeholder="Newsletter"
                        />
                        <p className="text-xs text-muted-foreground">
                          The name that appears as the sender (e.g., "Your Company Newsletter")
                        </p>
                      </div>
                    </div>

                    <Button 
                      onClick={() => updateSetting('email_sender', settings.email_sender)}
                      className="w-full"
                    >
                      Save Email Sender Settings
                    </Button>

                    {settings.email_sender.email && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">
                          Emails will be sent from: <span className="font-medium text-foreground">{settings.email_sender.name} &lt;{settings.email_sender.email}&gt;</span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="general" className="space-y-4">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Plugin Downloads
                      </CardTitle>
                      <CardDescription>Configure plugin download behavior</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Auto-send Downloads</p>
                          <p className="text-sm text-muted-foreground">
                            Automatically send plugin files when users request them
                          </p>
                        </div>
                        <Switch
                          checked={settings.plugin_auto_send.enabled}
                          onCheckedChange={(checked) => 
                            updateSetting('plugin_auto_send', { enabled: checked })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Site Settings
                      </CardTitle>
                      <CardDescription>Global website configuration</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Maintenance Mode</p>
                          <p className="text-sm text-muted-foreground">
                            Show maintenance page to visitors
                          </p>
                        </div>
                        <Switch
                          checked={settings.site_settings.maintenance_mode}
                          onCheckedChange={(checked) => 
                            updateSetting('site_settings', { maintenance_mode: checked })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Email Templates
                    </CardTitle>
                    <CardDescription>
                      Customize email notifications. Use {"{{variable}}"} for dynamic content.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Lead Notification Template */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Lead Notification</h4>
                      <p className="text-xs text-muted-foreground">
                        Variables: {"{{name}}, {{email}}, {{phone}}, {{company}}, {{message}}"}
                      </p>
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input
                          value={settings.email_templates.lead_notification.subject}
                          onChange={(e) => updateEmailTemplate('lead_notification', 'subject', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Body</Label>
                        <Textarea
                          value={settings.email_templates.lead_notification.body}
                          onChange={(e) => updateEmailTemplate('lead_notification', 'body', e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Plugin Download Template */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Plugin Download</h4>
                      <p className="text-xs text-muted-foreground">
                        Variables: {"{{name}}, {{email}}, {{plugin_name}}, {{download_link}}"}
                      </p>
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input
                          value={settings.email_templates.plugin_download.subject}
                          onChange={(e) => updateEmailTemplate('plugin_download', 'subject', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Body</Label>
                        <Textarea
                          value={settings.email_templates.plugin_download.body}
                          onChange={(e) => updateEmailTemplate('plugin_download', 'body', e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Welcome Subscriber Template */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Welcome Subscriber</h4>
                      <p className="text-xs text-muted-foreground">
                        Variables: {"{{name}}, {{email}}"}
                      </p>
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input
                          value={settings.email_templates.welcome_subscriber.subject}
                          onChange={(e) => updateEmailTemplate('welcome_subscriber', 'subject', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Body</Label>
                        <Textarea
                          value={settings.email_templates.welcome_subscriber.body}
                          onChange={(e) => updateEmailTemplate('welcome_subscriber', 'body', e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>

                    <Button onClick={saveEmailTemplates} className="w-full">
                      Save Email Templates
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
