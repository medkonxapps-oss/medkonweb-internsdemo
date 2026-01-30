import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MousePointer, ExternalLink, TrendingUp, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface LinkClick {
  id: string;
  link_url: string;
  link_text: string | null;
  click_count: number;
  unique_clicks: number;
  first_clicked_at: string;
  last_clicked_at: string;
}

interface ClickHeatmapProps {
  campaignId: string;
  totalRecipients: number;
}

export function ClickHeatmap({ campaignId, totalRecipients }: ClickHeatmapProps) {
  const [links, setLinks] = useState<LinkClick[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalClicks, setTotalClicks] = useState(0);

  useEffect(() => {
    fetchLinkClicks();
  }, [campaignId]);

  const fetchLinkClicks = async () => {
    try {
      const { data, error } = await supabase
        .from('link_clicks')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('click_count', { ascending: false });

      if (error) throw error;
      
      setLinks(data || []);
      setTotalClicks(data?.reduce((sum, l) => sum + l.click_count, 0) || 0);
    } catch (error) {
      console.error('Error fetching link clicks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHeatColor = (clickCount: number, maxClicks: number) => {
    if (maxClicks === 0) return 'bg-muted';
    const intensity = clickCount / maxClicks;
    
    if (intensity > 0.75) return 'bg-red-500/20 border-red-500/50 text-red-600';
    if (intensity > 0.5) return 'bg-orange-500/20 border-orange-500/50 text-orange-600';
    if (intensity > 0.25) return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-600';
    return 'bg-green-500/20 border-green-500/50 text-green-600';
  };

  const getClickRate = (clicks: number) => {
    if (totalRecipients === 0) return 0;
    return Math.round((clicks / totalRecipients) * 100);
  };

  const maxClicks = links.length > 0 ? Math.max(...links.map(l => l.click_count)) : 0;

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MousePointer className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p>No link clicks tracked yet</p>
        <p className="text-sm">Clicks will appear here as recipients interact with your email</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-bold">{totalClicks}</p>
          <p className="text-xs text-muted-foreground">Total Clicks</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{links.length}</p>
          <p className="text-xs text-muted-foreground">Unique Links</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{getClickRate(totalClicks)}%</p>
          <p className="text-xs text-muted-foreground">Click Rate</p>
        </div>
      </div>

      {/* Heatmap legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Click intensity:</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/50" />
          <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/50" />
          <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/50" />
        </div>
        <span className="ml-auto">Low → High</span>
      </div>

      {/* Link list with heatmap colors */}
      <div className="space-y-2">
        {links.map((link, index) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-3 rounded-lg border ${getHeatColor(link.click_count, maxClicks)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 pt-0.5">
                <div className="relative">
                  <MousePointer className="h-4 w-4" />
                  <span className="absolute -top-1 -right-2 text-[10px] font-bold bg-background px-1 rounded">
                    {index + 1}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {link.link_text && (
                    <span className="font-medium text-sm truncate">
                      {link.link_text}
                    </span>
                  )}
                  <a
                    href={link.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 truncate"
                  >
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate max-w-[200px]">{link.link_url}</span>
                  </a>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {link.click_count} clicks ({getClickRate(link.click_count)}%)
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last: {format(parseISO(link.last_clicked_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0">
                <Badge variant="secondary" className="text-xs font-bold">
                  {link.click_count}
                </Badge>
              </div>
            </div>
            
            {/* Visual bar */}
            <div className="mt-2 h-1.5 bg-background/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(link.click_count / maxClicks) * 100}%` }}
                transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                className="h-full bg-current rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
