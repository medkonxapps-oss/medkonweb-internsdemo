import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Workflow, Zap, Mail, TrendingUp, Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface WorkflowStatsProps {
  totalWorkflows: number;
  activeWorkflows: number;
  totalRules: number;
  activeRules: number;
  totalExecutions: number;
  completedExecutions: number;
}

export function WorkflowStats({
  totalWorkflows,
  activeWorkflows,
  totalRules,
  activeRules,
  totalExecutions,
  completedExecutions
}: WorkflowStatsProps) {
  const stats = [
    {
      title: 'Email Workflows',
      value: totalWorkflows,
      subValue: `${activeWorkflows} active`,
      icon: Mail,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/20 to-cyan-500/10',
    },
    {
      title: 'Automation Rules',
      value: totalRules,
      subValue: `${activeRules} active`,
      icon: Zap,
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-500/20 to-purple-500/10',
    },
    {
      title: 'Active Executions',
      value: totalExecutions - completedExecutions,
      subValue: `${totalExecutions} total`,
      icon: Workflow,
      gradient: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-500/20 to-amber-500/10',
    },
    {
      title: 'Completed',
      value: completedExecutions,
      subValue: `${((completedExecutions / (totalExecutions || 1)) * 100).toFixed(0)}% success`,
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-green-500',
      bgGradient: 'from-emerald-500/20 to-green-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 shadow-lg">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`} />
            <CardContent className="relative p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.subValue}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
