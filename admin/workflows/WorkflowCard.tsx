import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, Pause, Pencil, Trash2, Mail, Clock, Users, 
  ChevronRight, MoreVertical, Copy, Eye, Workflow 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface WorkflowCardProps {
  workflow: {
    id: string;
    name: string;
    description: string | null;
    trigger_type: string;
    trigger_value: string | null;
    is_active: boolean;
    created_at: string;
    steps_count?: number;
    executions_count?: number;
    has_advanced_steps?: boolean;
  };
  isSelected: boolean;
  triggerLabel: string;
  onSelect: () => void;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function WorkflowCard({
  workflow,
  isSelected,
  triggerLabel,
  onSelect,
  onToggleActive,
  onEdit,
  onDelete,
  onDuplicate,
}: WorkflowCardProps) {
  const IconComponent = workflow.has_advanced_steps ? Workflow : Mail;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
          : 'border-border/50 hover:border-primary/30 hover:bg-accent/30'
      }`}
      onClick={onSelect}
    >
      {/* Status indicator */}
      <div className={`absolute top-3 right-3 h-2.5 w-2.5 rounded-full ${
        workflow.is_active 
          ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse' 
          : 'bg-muted-foreground/30'
      }`} />

      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl transition-all duration-300 ${
          workflow.is_active 
            ? 'bg-gradient-to-br from-primary/20 to-primary/5' 
            : 'bg-muted/50'
        }`}>
          <IconComponent className={`h-5 w-5 transition-colors ${
            workflow.is_active ? 'text-primary' : 'text-muted-foreground'
          }`} />
        </div>
        
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold truncate">{workflow.name}</h4>
          </div>
          
          {workflow.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {workflow.description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-2">
            <Badge 
              variant="outline" 
              className="text-xs font-normal bg-background/50"
            >
              {triggerLabel}
            </Badge>
            {workflow.has_advanced_steps && (
              <Badge 
                variant="secondary" 
                className="text-xs"
              >
                Advanced
              </Badge>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {workflow.steps_count || 0} steps
            </div>
            {(workflow.executions_count || 0) > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {workflow.executions_count} running
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleActive(); }}>
                {workflow.is_active ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Workflow
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Activate Workflow
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${
            isSelected ? 'rotate-90' : ''
          }`} />
        </div>
      </div>
    </motion.div>
  );
}
