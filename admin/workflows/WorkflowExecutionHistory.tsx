import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, CheckCircle2, XCircle, Loader2, Users, Mail,
  RefreshCw, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface Execution {
  id: string;
  workflow_id: string;
  subscriber_id: string;
  current_step: number;
  status: string;
  started_at: string;
  next_step_at: string | null;
  completed_at: string | null;
  subscriber?: {
    email: string;
    name: string | null;
  };
}

interface WorkflowExecutionHistoryProps {
  workflowId: string;
  workflowName: string;
}

export function WorkflowExecutionHistory({ workflowId, workflowName }: WorkflowExecutionHistoryProps) {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchExecutions();
  }, [workflowId]);

  const fetchExecutions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select(`
          *,
          subscriber:newsletter_subscribers(email, name)
        `)
        .eq('workflow_id', workflowId)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const formattedData = (data || []).map(item => ({
        ...item,
        subscriber: Array.isArray(item.subscriber) ? item.subscriber[0] : item.subscriber
      }));
      
      setExecutions(formattedData);
    } catch (error) {
      console.error('Error fetching executions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { 
          icon: Loader2, 
          color: 'text-blue-500', 
          bg: 'bg-blue-500/10',
          label: 'Running',
          animate: true
        };
      case 'completed':
        return { 
          icon: CheckCircle2, 
          color: 'text-emerald-500', 
          bg: 'bg-emerald-500/10',
          label: 'Completed',
          animate: false
        };
      case 'paused':
        return { 
          icon: Clock, 
          color: 'text-amber-500', 
          bg: 'bg-amber-500/10',
          label: 'Paused',
          animate: false
        };
      case 'cancelled':
        return { 
          icon: XCircle, 
          color: 'text-red-500', 
          bg: 'bg-red-500/10',
          label: 'Cancelled',
          animate: false
        };
      default:
        return { 
          icon: AlertCircle, 
          color: 'text-muted-foreground', 
          bg: 'bg-muted',
          label: status,
          animate: false
        };
    }
  };

  const activeCount = executions.filter(e => e.status === 'active').length;
  const completedCount = executions.filter(e => e.status === 'completed').length;

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <Loader2 className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-sm font-medium">{activeCount} Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="text-sm font-medium">{completedCount} Completed</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchExecutions} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Executions List */}
      <ScrollArea className="h-[400px] pr-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : executions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No executions yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Activate the workflow to start sending emails
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {executions.map((execution, index) => {
              const config = getStatusConfig(execution.status);
              const StatusIcon = config.icon;
              const isExpanded = expandedId === execution.id;

              return (
                <motion.div
                  key={execution.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-lg border bg-card overflow-hidden"
                >
                  <div 
                    className="p-3 flex items-center gap-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : execution.id)}
                  >
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <StatusIcon className={`h-4 w-4 ${config.color} ${config.animate ? 'animate-spin' : ''}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {execution.subscriber?.email || 'Unknown'}
                        </span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          Step {execution.current_step}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Started {formatDistanceToNow(new Date(execution.started_at), { addSuffix: true })}
                      </p>
                    </div>

                    <Badge className={`${config.bg} ${config.color} border-0`}>
                      {config.label}
                    </Badge>

                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 border-t bg-muted/30"
                    >
                      <div className="pt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subscriber Name</span>
                          <span>{execution.subscriber?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Started At</span>
                          <span>{format(new Date(execution.started_at), 'PPp')}</span>
                        </div>
                        {execution.next_step_at && execution.status === 'active' && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Next Step</span>
                            <span>{formatDistanceToNow(new Date(execution.next_step_at), { addSuffix: true })}</span>
                          </div>
                        )}
                        {execution.completed_at && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Completed At</span>
                            <span>{format(new Date(execution.completed_at), 'PPp')}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
