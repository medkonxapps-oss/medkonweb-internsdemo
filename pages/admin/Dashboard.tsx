import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import { Users, Mail, Package, FileText, Download, AlertCircle, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ApprovalRequest {
  id: string;
  title: string;
  request_type: string;
  status: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  priority: string;
  due_date: string | null;
  status: string;
}

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    leads: 0,
    subscribers: 0,
    plugins: 0,
    posts: 0,
    downloads: 0,
  });
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchPendingApprovals();
      fetchRecentTasks();

      // Subscribe to real-time updates for tasks and approvals
      const tasksChannel = supabase
        .channel('dashboard-tasks')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
          },
          () => {
            fetchRecentTasks();
          }
        )
        .subscribe();

      const approvalsChannel = supabase
        .channel('dashboard-approvals')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'approval_requests',
          },
          () => {
            fetchPendingApprovals();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(tasksChannel);
        supabase.removeChannel(approvalsChannel);
      };
    }
  }, [user, isAdmin]);

  const fetchStats = async () => {
    try {
      const [leads, subscribers, plugins, posts, downloads] = await Promise.all([
        supabase.from('leads').select('id', { count: 'exact', head: true }),
        supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
        supabase.from('plugins').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('plugin_downloads').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        leads: leads.count || 0,
        subscribers: subscribers.count || 0,
        plugins: plugins.count || 0,
        posts: posts.count || 0,
        downloads: downloads.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      let query = supabase
        .from('approval_requests')
        .select('id, title, request_type, status, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);

      // If not admin, only show user's own requests or requests assigned to them
      if (!isAdmin && user) {
        query = query.or(`requested_by.eq.${user.id},assigned_to.eq.${user.id}`);
      }

      const { data } = await query;
      setPendingApprovals(data || []);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    }
  };

  const fetchRecentTasks = async () => {
    try {
      let query = supabase
        .from('tasks')
        .select('id, title, priority, due_date, status')
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(10);

      // If not admin, only show user's own tasks or tasks assigned to them
      if (!isAdmin && user) {
        query = query.or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`);
      }

      const { data } = await query;
      setRecentTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPendingApprovals(),
      fetchRecentTasks(),
      fetchStats()
    ]);
    setRefreshing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-chart-4';
      case 'low': return 'text-chart-2';
      default: return 'text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'leave': return '🏖️';
      case 'expense': return '💰';
      case 'discount': return '🏷️';
      default: return '📋';
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to Medkon CRM</p>
          </div>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            title="Total Leads"
            value={stats.leads}
            icon={Users}
            iconColor="text-chart-1"
            delay={0}
          />
          <StatCard
            title="Subscribers"
            value={stats.subscribers}
            icon={Mail}
            iconColor="text-chart-2"
            delay={0.1}
          />
          <StatCard
            title="Plugins"
            value={stats.plugins}
            icon={Package}
            iconColor="text-chart-3"
            delay={0.2}
          />
          <StatCard
            title="Blog Posts"
            value={stats.posts}
            icon={FileText}
            iconColor="text-chart-4"
            delay={0.3}
          />
          <StatCard
            title="Downloads"
            value={stats.downloads}
            icon={Download}
            iconColor="text-chart-5"
            delay={0.4}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Approvals Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-chart-4" />
                {isAdmin ? 'Pending Approvals' : 'My Approvals'}
              </h2>
              <Link to="/admin/approvals" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            {pendingApprovals.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <CheckCircle className="h-5 w-5 mr-2" />
                No pending approvals
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getTypeIcon(approval.request_type)}</span>
                      <div>
                        <p className="text-sm font-medium">{approval.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{approval.request_type} request</p>
                      </div>
                    </div>
                    <span className="text-xs bg-chart-4/20 text-chart-4 px-2 py-1 rounded">Pending</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Tasks Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-chart-3" />
                {isAdmin ? 'Recent Tasks' : 'My Tasks'}
              </h2>
              <Link to="/admin/tasks" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            {recentTasks.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <CheckCircle className="h-5 w-5 mr-2" />
                No active tasks
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        Status: {task.status} • Priority: {task.priority}
                      </p>
                    </div>
                    <span className={`text-xs font-medium capitalize ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link to="/admin/leads" className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Manage Leads</span>
              </Link>
              <Link to="/admin/blog" className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Write Blog Post</span>
              </Link>
              <Link to="/admin/plugins" className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Add Plugin</span>
              </Link>
              <Link to="/admin/newsletter" className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">View Subscribers</span>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Getting Started</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">1.</span>
                Add your first plugin in the Plugins section
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">2.</span>
                Create blog posts to drive traffic
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">3.</span>
                Monitor leads from your contact form
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">4.</span>
                Manage team members and permissions
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
