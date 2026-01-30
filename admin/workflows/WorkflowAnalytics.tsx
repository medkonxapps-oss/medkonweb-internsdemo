import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  AreaChart,
  Area,
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
import {
  TrendingUp,
  TrendingDown,
  Mail,
  MousePointer,
  Eye,
  Users,
  CheckCircle2,
  Clock,
  BarChart3,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface WorkflowAnalyticsProps {
  workflowId?: string;
  workflowName?: string;
}

interface AnalyticsData {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalCompleted: number;
  openRate: number;
  clickRate: number;
  completionRate: number;
  dailyData: Array<{
    date: string;
    sent: number;
    opened: number;
    clicked: number;
  }>;
  stepPerformance: Array<{
    step: string;
    sent: number;
    opened: number;
    clicked: number;
    openRate: number;
  }>;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export function WorkflowAnalytics({ workflowId, workflowName }: WorkflowAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalCompleted: 0,
    openRate: 0,
    clickRate: 0,
    completionRate: 0,
    dailyData: [],
    stepPerformance: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [workflowId, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = subDays(new Date(), days);

      // Fetch workflow step logs
      let stepLogsQuery = supabase
        .from('workflow_step_logs')
        .select(`
          *,
          execution:workflow_executions!inner(workflow_id),
          step:workflow_steps!inner(name, step_order)
        `)
        .gte('sent_at', startDate.toISOString());

      if (workflowId) {
        stepLogsQuery = stepLogsQuery.eq('execution.workflow_id', workflowId);
      }

      const { data: stepLogs, error: logsError } = await stepLogsQuery;

      // Fetch campaign events for open/click data
      const { data: events, error: eventsError } = await supabase
        .from('campaign_events')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Fetch executions
      let execQuery = supabase
        .from('workflow_executions')
        .select('*')
        .gte('started_at', startDate.toISOString());

      if (workflowId) {
        execQuery = execQuery.eq('workflow_id', workflowId);
      }

      const { data: executions, error: execError } = await execQuery;

      // Calculate metrics
      const sent = stepLogs?.filter(l => l.status === 'sent').length || 0;
      const opened = events?.filter(e => e.event_type === 'open').length || 0;
      const clicked = events?.filter(e => e.event_type === 'click').length || 0;
      const completed = executions?.filter(e => e.status === 'completed').length || 0;
      const total = executions?.length || 0;

      // Generate daily data
      const dailyMap = new Map<string, { sent: number; opened: number; clicked: number }>();
      for (let i = days - 1; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'MMM dd');
        dailyMap.set(date, { sent: 0, opened: 0, clicked: 0 });
      }

      stepLogs?.forEach(log => {
        const date = format(new Date(log.sent_at), 'MMM dd');
        if (dailyMap.has(date)) {
          const current = dailyMap.get(date)!;
          current.sent += 1;
          dailyMap.set(date, current);
        }
      });

      events?.forEach(event => {
        const date = format(new Date(event.created_at), 'MMM dd');
        if (dailyMap.has(date)) {
          const current = dailyMap.get(date)!;
          if (event.event_type === 'open') current.opened += 1;
          if (event.event_type === 'click') current.clicked += 1;
          dailyMap.set(date, current);
        }
      });

      const dailyData = Array.from(dailyMap.entries()).map(([date, data]) => ({
        date,
        ...data,
      }));

      // Calculate step performance
      const stepMap = new Map<string, { sent: number; opened: number; clicked: number }>();
      stepLogs?.forEach(log => {
        const stepName = (log.step as any)?.name || `Step ${(log.step as any)?.step_order}`;
        if (!stepMap.has(stepName)) {
          stepMap.set(stepName, { sent: 0, opened: 0, clicked: 0 });
        }
        const current = stepMap.get(stepName)!;
        current.sent += 1;
        stepMap.set(stepName, current);
      });

      const stepPerformance = Array.from(stepMap.entries()).map(([step, data]) => ({
        step,
        ...data,
        openRate: data.sent > 0 ? Math.round((data.opened / data.sent) * 100) : 0,
      }));

      setAnalytics({
        totalSent: sent,
        totalOpened: opened,
        totalClicked: clicked,
        totalCompleted: completed,
        openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
        clickRate: opened > 0 ? Math.round((clicked / opened) * 100) : 0,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        dailyData,
        stepPerformance,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    gradient 
  }: { 
    title: string; 
    value: string | number; 
    change?: number; 
    icon: any; 
    gradient: string;
  }) => (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{value}</span>
              {change !== undefined && (
                <span className={`flex items-center text-sm ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {Math.abs(change)}%
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const pieData = [
    { name: 'Opened', value: analytics.totalOpened, color: '#10b981' },
    { name: 'Clicked', value: analytics.totalClicked, color: '#8b5cf6' },
    { name: 'Not Opened', value: Math.max(0, analytics.totalSent - analytics.totalOpened), color: '#6b7280' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {workflowName ? `Analytics: ${workflowName}` : 'Overall Workflow Analytics'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Track email performance and subscriber engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Emails Sent"
          value={analytics.totalSent.toLocaleString()}
          icon={Mail}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Open Rate"
          value={`${analytics.openRate}%`}
          icon={Eye}
          gradient="from-emerald-500 to-green-500"
        />
        <StatCard
          title="Click Rate"
          value={`${analytics.clickRate}%`}
          icon={MousePointer}
          gradient="from-violet-500 to-purple-500"
        />
        <StatCard
          title="Completion Rate"
          value={`${analytics.completionRate}%`}
          icon={CheckCircle2}
          gradient="from-orange-500 to-amber-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Email Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.dailyData}>
                  <defs>
                    <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="openedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="clickedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
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
                    dataKey="sent"
                    stroke="#3b82f6"
                    fill="url(#sentGradient)"
                    strokeWidth={2}
                    name="Sent"
                  />
                  <Area
                    type="monotone"
                    dataKey="opened"
                    stroke="#10b981"
                    fill="url(#openedGradient)"
                    strokeWidth={2}
                    name="Opened"
                  />
                  <Area
                    type="monotone"
                    dataKey="clicked"
                    stroke="#8b5cf6"
                    fill="url(#clickedGradient)"
                    strokeWidth={2}
                    name="Clicked"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Engagement Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step Performance */}
      {analytics.stepPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step Performance</CardTitle>
            <CardDescription>See how each email step performs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.stepPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis dataKey="step" type="category" width={100} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="sent" fill="#3b82f6" name="Sent" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="opened" fill="#10b981" name="Opened" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="clicked" fill="#8b5cf6" name="Clicked" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && analytics.totalSent === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-semibold mb-2">No data yet</h4>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Analytics will appear here once your workflows start sending emails to subscribers.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
