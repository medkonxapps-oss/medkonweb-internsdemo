import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, Pause, Pencil, Trash2, Zap, MoreVertical, Copy,
  Users, ListTodo, FileCheck, Target, Bell, CheckCircle2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface AutomationRuleCardProps {
  rule: {
    id: string;
    name: string;
    description: string | null;
    trigger_entity: string;
    trigger_event: string;
    conditions: any[];
    actions: any[];
    is_active: boolean;
    created_at: string;
  };
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const ENTITY_ICONS: Record<string, any> = {
  lead: Users,
  task: ListTodo,
  approval: FileCheck,
};

const ACTION_ICONS: Record<string, any> = {
  create_task: ListTodo,
  assign_lead: Users,
  notify: Bell,
  change_status: CheckCircle2,
};

export function AutomationRuleCard({
  rule,
  onToggleActive,
  onEdit,
  onDelete,
  onDuplicate,
}: AutomationRuleCardProps) {
  const EntityIcon = ENTITY_ICONS[rule.trigger_entity] || Zap;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group relative p-5 rounded-xl border-2 border-border/50 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300"
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <Badge 
          variant={rule.is_active ? 'default' : 'secondary'}
          className={`${rule.is_active 
            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0' 
            : ''
          }`}
        >
          {rule.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4 pr-20">
          <div className={`p-3 rounded-xl ${
            rule.is_active 
              ? 'bg-gradient-to-br from-violet-500/20 to-purple-500/10' 
              : 'bg-muted'
          }`}>
            <Zap className={`h-5 w-5 ${
              rule.is_active ? 'text-violet-500' : 'text-muted-foreground'
            }`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-lg">{rule.name}</h4>
            {rule.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {rule.description}
              </p>
            )}
          </div>
        </div>

        {/* Trigger */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            When
          </span>
          <Badge variant="outline" className="gap-1.5 font-normal">
            <EntityIcon className="h-3 w-3" />
            {rule.trigger_entity}
          </Badge>
          <span className="text-xs text-muted-foreground">is</span>
          <Badge variant="outline" className="font-normal">
            {rule.trigger_event}
          </Badge>
        </div>

        {/* Conditions & Actions Summary */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-medium">{rule.conditions?.length || 0}</span>
              <span className="text-muted-foreground ml-1">conditions</span>
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-medium">{rule.actions?.length || 0}</span>
              <span className="text-muted-foreground ml-1">actions</span>
            </span>
          </div>
        </div>

        {/* Actions Preview */}
        {rule.actions?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {rule.actions.slice(0, 3).map((action: any, index: number) => {
              const ActionIcon = ACTION_ICONS[action.type] || Zap;
              return (
                <Badge key={index} variant="secondary" className="gap-1.5">
                  <ActionIcon className="h-3 w-3" />
                  {action.type.replace('_', ' ')}
                </Badge>
              );
            })}
            {rule.actions.length > 3 && (
              <Badge variant="secondary">+{rule.actions.length - 3} more</Badge>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-xs text-muted-foreground">
            Created {format(new Date(rule.created_at), 'MMM d, yyyy')}
          </span>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onToggleActive}
              className="gap-1.5"
            >
              {rule.is_active ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Activate
                </>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Rule
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
