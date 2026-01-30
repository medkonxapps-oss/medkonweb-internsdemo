import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Mail, MailOpen, MousePointer, TrendingUp, Users, Send, Clock, CheckCircle2 } from 'lucide-react';
import { format, subDays, startOfDay, eachDayOfInterval, parseISO } from 'date-fns';

interface CampaignStats {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  avgOpenRate: number;
  avgClickRate: number;
  totalRecipients: number;
}

interface DailyEngagement {
  date: string;
  opens: number;
  clicks: number;
  sent: number;
}

interface CampaignPerformance {
  id: string;
  subject: string;
  sent_at: string;
  recipient_count: number;
  open_count: number;
  click_count: number;
  openRate: number;
  clickRate: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function EmailAnalytics() {
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CampaignStats>({
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
    totalRecipients: 0,
  });
  const [dailyEngagement, setDailyEngagement] = useState<DailyEngagement[]>([]);
  const [topCampaigns, setTopCampaigns] = useState<CampaignPerformance[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    const days = parseInt(timeRange);
    const startDate = startOfDay(subDays(new Date(), days));

    try {
      // Fetch all campaigns
      const { data: campaigns } = await supabase
        .from('scheduled_campaigns')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (!campaigns) {
        setLoading(false);
        return;
      }

      // Calculate overall stats
      const sentCampaigns = campaigns.filter(c => c.status === 'sent');
      const totalRecipients = sentCampaigns.reduce((sum, c) => sum + c.recipient_count, 0);
      const totalOpened = sentCampaigns.reduce((sum, c) => sum + c.open_count, 0);
      const totalClicked = sentCampaigns.reduce((sum, c) => sum + c.click_count, 0);

      setStats({
        totalSent: sentCampaigns.length,
        totalOpened,
        totalClicked,
        avgOpenRate: totalRecipients > 0 ? Math.round((totalOpened / totalRecipients) * 100) : 0,
        avgClickRate: totalRecipients > 0 ? Math.round((totalClicked / totalRecipients) * 100) : 0,
        totalRecipients,
      });

      // Calculate daily engagement
      const dateRange = eachDayOfInterval({ start: startDate, end: new Date() });
      const dailyData = dateRange.map((date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayCampaigns = sentCampaigns.filter(c => 
          c.sent_at && format(parseISO(c.sent_at), 'yyyy-MM-dd') === dateStr
        );
        return {
          date: format(date, 'MMM dd'),
          opens: dayCampaigns.reduce((sum, c) => sum + c.open_count, 0),
          clicks: dayCampaigns.reduce((sum, c) => sum + c.click_count, 0),
          sent: dayCampaigns.reduce((sum, c) => sum + c.recipient_count, 0),
        };
      });
      setDailyEngagement(dailyData);

      // Top performing campaigns
      const topPerformers = sentCampaigns
        .map(c => ({
          id: c.id,
          subject: c.subject,
          sent_at: c.sent_at || c.scheduled_at,
          recipient_count: c.recipient_count,
          open_count: c.open_count,
          click_count: c.click_count,
          openRate: c.recipient_count > 0 ? Math.round((c.open_count / c.recipient_count) * 100) : 0,
          clickRate: c.recipient_count > 0 ? Math.round((c.click_count / c.recipient_count) * 100) : 0,
        }))
        .sort((a, b) => b.openRate - a.openRate)
        .slice(0, 5);
      setTopCampaigns(topPerformers);

      // Status breakdown
      const statusCounts = campaigns.reduce((acc: Record<string, number>, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {});
      setStatusBreakdown(
        Object.entries(statusCounts).map(([status, count]) => ({ status, count: count as number }))
      );

    } catch (error) {
      console.error('Error fetching email analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-500/20 text-green-600';
      case 'scheduled': return 'bg-blue-500/20 text-blue-600';
      case 'cancelled': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
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
            <h1 className="text-3xl font-bold tracking-tight">Email Analytics</h1>
            <p className="text-muted-foreground">Track your email campaign performance</p>
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
            title="Campaigns Sent"
            value={stats.totalSent}
            icon={Send}
            iconColor="text-chart-1"
            delay={0}
          />
          <StatCard
            title="Total Recipients"
            value={stats.totalRecipients.toLocaleString()}
            icon={Users}
            iconColor="text-chart-2"
            delay={0.1}
          />
          <StatCard
            title="Avg. Open Rate"
            value={`${stats.avgOpenRate}%`}
            icon={MailOpen}
            iconColor="text-chart-3"
            delay={0.2}
          />
          <StatCard
            title="Avg. Click Rate"
            value={`${stats.avgClickRate}%`}
            icon={MousePointer}
            iconColor="text-chart-4"
            delay={0.3}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Engagement Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Email Engagement Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyEngagement}>
                      <defs>
                        <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
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
                      <Area
                        type="monotone"
                        dataKey="opens"
                        stroke="hsl(var(--chart-1))"
                        fillOpacity={1}
                        fill="url(#colorOpens)"
                        strokeWidth={2}
                        name="Opens"
                      />
                      <Area
                        type="monotone"
                        dataKey="clicks"
                        stroke="hsl(var(--chart-2))"
                        fillOpacity={1}
                        fill="url(#colorClicks)"
                        strokeWidth={2}
                        name="Clicks"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Campaign Status Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Campaign Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="status"
                        label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusBreakdown.map((_, index) => (
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

          {/* Top Performing Campaigns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                {topCampaigns.length === 0 ? (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <p>No sent campaigns yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topCampaigns.map((campaign, index) => (
                      <div key={campaign.id} className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{campaign.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(campaign.sent_at), 'MMM d, yyyy')} • {campaign.recipient_count} recipients
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm">
                          <div className="text-center">
                            <p className="font-semibold text-chart-1">{campaign.openRate}%</p>
                            <p className="text-xs text-muted-foreground">Opens</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-chart-2">{campaign.clickRate}%</p>
                            <p className="text-xs text-muted-foreground">Clicks</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Detailed Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Engagement Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="text-center p-6 rounded-lg bg-muted/30">
                  <Mail className="h-8 w-8 mx-auto mb-2 text-chart-1" />
                  <p className="text-3xl font-bold">{stats.totalRecipients.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Emails Delivered</p>
                </div>
                <div className="text-center p-6 rounded-lg bg-muted/30">
                  <MailOpen className="h-8 w-8 mx-auto mb-2 text-chart-3" />
                  <p className="text-3xl font-bold">{stats.totalOpened.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Opens</p>
                </div>
                <div className="text-center p-6 rounded-lg bg-muted/30">
                  <MousePointer className="h-8 w-8 mx-auto mb-2 text-chart-4" />
                  <p className="text-3xl font-bold">{stats.totalClicked.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Clicks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
