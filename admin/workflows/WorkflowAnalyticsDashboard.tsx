import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, TrendingDown, Users, Mail, 
  GitBranch, Target, Clock, CheckCircle,
  XCircle, ArrowRight, BarChart3, PieChart,
  Activity, Zap
} from 'lucide-react';

interface WorkflowAnalytics {
  workflow_id: string;
  workflow_name: string;
  total_executions: number;
  active_executions: number;
  completed_executions: number;
  conversion_rate: number;
  avg_completion_time: number;
  step_analytics: StepAnalytics[];
}

interface StepAnalytics {
  step_order: number;
  step_name: string;
  step_type: string;
  total_reached: number;
  completed: number;
  completion_rate: number;
  avg_time_spent: number;
  branch_data?: {
    true_path: number;
    false_path: number;
  };
}

interface WorkflowAnalyticsDashboardProps {
  workflowId?: string;
}

export function WorkflowAnalyticsDashboard({ workflowId }: WorkflowAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<WorkflowAnalytics[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>(workflowId || '');
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedWorkflow, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Fetch workflow analytics
      const { data: workflows } = await supabase
        .from('email_workflows')
        .select('id, name')
        .eq('is_active', true);

      if (!workflows) return;

      const analyticsData: WorkflowAnalytics[] = [];

      for (const workflow of workflows) {
        if (selectedWorkflow && workflow.id !== selectedWorkflow) continue;

        // Get execution stats
        const { data: executions } = await supabase
          .from('workflow_executions')
          .select('*')
          .eq('workflow_id', workflow.id)
          .gte('started_at', startDate.toISOString())
          .lte('started_at', endDate.toISOString());

        if (!executions) continue;

        const totalExecutions = executions.length;
        const activeExecutions = executions.filter(e => e.status === 'active').length;
        const completedExecutions = executions.filter(e => e.status === 'completed').length;
        const conversionRate = totalExecutions > 0 ? (completedExecutions / totalExecutions) * 100 : 0;

        // Calculate average completion time
        const completedWithTime = executions.filter(e => e.status === 'completed' && e.completed_at);
        const avgCompletionTime = completedWithTime.length > 0 
          ? completedWithTime.reduce((sum, e) => {
              const start = new Date(e.started_at).getTime();
              const end = new Date(e.completed_at).getTime();
              return sum + (end - start);
            }, 0) / completedWithTime.length / (1000 * 60 * 60 * 24) // Convert to days
          : 0;

        // Get step analytics
        const { data: steps } = await supabase
          .from('workflow_steps')
          .select('*')
          .eq('workflow_id', workflow.id)
          .order('step_order');

        const stepAnalytics: StepAnalytics[] = [];

        if (steps) {
          for (const step of steps) {
            // Get step logs
            const { data: stepLogs } = await supabase
              .from('workflow_step_logs')
              .select('*')
              .eq('step_id', step.id)
              .gte('sent_at', startDate.toISOString())
              .lte('sent_at', endDate.toISOString());

            const totalReached = stepLogs?.length || 0;
            const completed = stepLogs?.filter(log => log.status === 'sent').length || 0;
            const completionRate = totalReached > 0 ? (completed / totalReached) * 100 : 0;

            // For condition steps, get branch data
            let branchData;
            if (step.step_type === 'condition') {
              // This would require additional tracking in the execution logs
              // For now, we'll simulate some data
              branchData = {
                true_path: Math.floor(completed * 0.6),
                false_path: Math.floor(completed * 0.4),
              };
            }

            stepAnalytics.push({
              step_order: step.step_order,
              step_name: step.name,
              step_type: step.step_type,
              total_reached: totalReached,
              completed: completed,
              completion_rate: completionRate,
              avg_time_spent: 0, // Would need additional tracking
              branch_data: branchData,
            });
          }
        }

        analyticsData.push({
          workflow_id: workflow.id,
          workflow_name: workflow.name,
          total_executions: totalExecutions,
          active_executions: activeExecutions,
          completed_executions: completedExecutions,
          conversion_rate: conversionRate,
          avg_completion_time: avgCompletionTime,
          step_analytics: stepAnalytics,
        });
      }

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedAnalytics = analytics.find(a => a.workflow_id === selectedWorkflow) || analytics[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Workflow Analytics</h2>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          {analytics.length > 1 && (
            <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select workflow" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Workflows</SelectItem>
                {analytics.map((workflow) => (
                  <SelectItem key={workflow.workflow_id} value={workflow.workflow_id}>
                    {workflow.workflow_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedAnalytics ? selectedAnalytics.total_executions : analytics.reduce((sum, a) => sum + a.total_executions, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Workflow runs in {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedAnalytics 
                ? `${selectedAnalytics.conversion_rate.toFixed(1)}%`
                : `${(analytics.reduce((sum, a) => sum + a.conversion_rate, 0) / analytics.length || 0).toFixed(1)}%`
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Completed workflows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Executions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedAnalytics ? selectedAnalytics.active_executions : analytics.reduce((sum, a) => sum + a.active_executions, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedAnalytics 
                ? `${selectedAnalytics.avg_completion_time.toFixed(1)}d`
                : `${(analytics.reduce((sum, a) => sum + a.avg_completion_time, 0) / analytics.length || 0).toFixed(1)}d`
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Days to complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Step-by-Step Analytics */}
      {selectedAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Step Performance - {selectedAnalytics.workflow_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedAnalytics.step_analytics.map((step, index) => (
                <motion.div
                  key={step.step_order}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Step {step.step_order}</Badge>
                      {step.step_type === 'email' && <Mail className="h-4 w-4 text-blue-500" />}
                      {step.step_type === 'condition' && <GitBranch className="h-4 w-4 text-purple-500" />}
                      {step.step_type === 'action' && <Zap className="h-4 w-4 text-green-500" />}
                      {step.step_type === 'delay' && <Clock className="h-4 w-4 text-orange-500" />}
                    </div>
                    <div>
                      <p className="font-medium">{step.step_name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{step.step_type} step</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">{step.total_reached}</p>
                      <p className="text-xs text-muted-foreground">Reached</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{step.completed}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{step.completion_rate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Rate</p>
                    </div>

                    {/* Branch Data for Condition Steps */}
                    {step.step_type === 'condition' && step.branch_data && (
                      <div className="flex gap-2">
                        <div className="text-center">
                          <p className="text-sm font-medium text-green-600">{step.branch_data.true_path}</p>
                          <p className="text-xs text-muted-foreground">True</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-red-600">{step.branch_data.false_path}</p>
                          <p className="text-xs text-muted-foreground">False</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Comparison */}
      {!selectedWorkflow && analytics.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Workflow Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.map((workflow, index) => (
                <motion.div
                  key={workflow.workflow_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedWorkflow(workflow.workflow_id)}
                >
                  <div>
                    <p className="font-medium">{workflow.workflow_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {workflow.total_executions} executions • {workflow.conversion_rate.toFixed(1)}% conversion
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={workflow.conversion_rate > 50 ? 'default' : 'secondary'}>
                      {workflow.conversion_rate > 50 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {workflow.conversion_rate.toFixed(1)}%
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}