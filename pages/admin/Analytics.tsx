import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Users, Download, Mail, TrendingUp } from 'lucide-react';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';

interface DailyStats {
  date: string;
  leads: number;
  downloads: number;
  subscribers: number;
}

interface LeadsByStatus {
  status: string;
  count: number;
}

interface DownloadsByPlugin {
  name: string;
  downloads: number;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [leadsByStatus, setLeadsByStatus] = useState<LeadsByStatus[]>([]);
  const [downloadsByPlugin, setDownloadsByPlugin] = useState<DownloadsByPlugin[]>([]);
  const [totals, setTotals] = useState({
    leads: 0,
    downloads: 0,
    subscribers: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    const days = parseInt(timeRange);
    const startDate = startOfDay(subDays(new Date(), days));

    try {
      // Fetch leads
      const { data: leads } = await supabase
        .from('leads')
        .select('id, status, created_at')
        .gte('created_at', startDate.toISOString());

      // Fetch downloads
      const { data: downloads } = await supabase
        .from('plugin_downloads')
        .select('id, plugin_id, created_at, plugins(name)')
        .gte('created_at', startDate.toISOString());

      // Fetch subscribers
      const { data: subscribers } = await supabase
        .from('newsletter_subscribers')
        .select('id, created_at')
        .gte('created_at', startDate.toISOString());

      // Calculate daily stats
      const dateRange = eachDayOfInterval({ start: startDate, end: new Date() });
      const dailyData = dateRange.map((date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return {
          date: format(date, 'MMM dd'),
          leads: leads?.filter(l => format(new Date(l.created_at), 'yyyy-MM-dd') === dateStr).length || 0,
          downloads: downloads?.filter(d => format(new Date(d.created_at), 'yyyy-MM-dd') === dateStr).length || 0,
          subscribers: subscribers?.filter(s => format(new Date(s.created_at), 'yyyy-MM-dd') === dateStr).length || 0,
        };
      });
      setDailyStats(dailyData);

      // Calculate leads by status
      const statusCounts = leads?.reduce((acc: Record<string, number>, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {}) || {};
      setLeadsByStatus(
        Object.entries(statusCounts).map(([status, count]) => ({ status, count: count as number }))
      );

      // Calculate downloads by plugin
      const pluginCounts = downloads?.reduce((acc: Record<string, number>, download: any) => {
        const name = download.plugins?.name || 'Unknown';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {}) || {};
      setDownloadsByPlugin(
        Object.entries(pluginCounts)
          .map(([name, downloads]) => ({ name, downloads: downloads as number }))
          .sort((a, b) => b.downloads - a.downloads)
          .slice(0, 5)
      );

      // Calculate totals
      const totalLeads = leads?.length || 0;
      const convertedLeads = leads?.filter(l => l.status === 'converted').length || 0;
      setTotals({
        leads: totalLeads,
        downloads: downloads?.length || 0,
        subscribers: subscribers?.length || 0,
        conversionRate: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Track your business metrics</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="New Leads"
            value={totals.leads}
            icon={Users}
            iconColor="text-chart-1"
            delay={0}
          />
          <StatCard
            title="Downloads"
            value={totals.downloads}
            icon={Download}
            iconColor="text-chart-2"
            delay={0.1}
          />
          <StatCard
            title="New Subscribers"
            value={totals.subscribers}
            icon={Mail}
            iconColor="text-chart-3"
            delay={0.2}
          />
          <StatCard
            title="Conversion Rate"
            value={`${totals.conversionRate}%`}
            icon={TrendingUp}
            iconColor="text-chart-4"
            delay={0.3}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Trends Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Trends Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        className="fill-muted-foreground"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        className="fill-muted-foreground"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="leads"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={false}
                        name="Leads"
                      />
                      <Line
                        type="monotone"
                        dataKey="downloads"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={false}
                        name="Downloads"
                      />
                      <Line
                        type="monotone"
                        dataKey="subscribers"
                        stroke="hsl(var(--chart-3))"
                        strokeWidth={2}
                        dot={false}
                        name="Subscribers"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Leads by Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Leads by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadsByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="status"
                        label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                      >
                        {leadsByStatus.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Plugins */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Top Plugins by Downloads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={downloadsByPlugin} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        width={150}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="downloads" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
