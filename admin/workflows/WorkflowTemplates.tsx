import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Users, ShoppingCart, Calendar, Rocket,
  Heart, Gift, TrendingUp, Star, Mail
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  gradient: string;
  category: string;
  steps: number;
  trigger: string;
}

const WORKFLOW_TEMPLATES: Template[] = [
  {
    id: 'welcome',
    name: 'Welcome Series',
    description: 'Onboard new subscribers with a warm welcome sequence',
    icon: Sparkles,
    gradient: 'from-violet-500 to-purple-500',
    category: 'Onboarding',
    steps: 3,
    trigger: 'On Subscribe',
  },
  {
    id: 'lead-nurture',
    name: 'Lead Nurture',
    description: 'Convert leads into customers with targeted content',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-cyan-500',
    category: 'Sales',
    steps: 5,
    trigger: 'On Segment Join',
  },
  {
    id: 're-engagement',
    name: 'Re-engagement',
    description: 'Win back inactive subscribers with special offers',
    icon: Heart,
    gradient: 'from-rose-500 to-pink-500',
    category: 'Retention',
    steps: 3,
    trigger: 'Manual',
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Build excitement for your new product release',
    icon: Rocket,
    gradient: 'from-orange-500 to-amber-500',
    category: 'Marketing',
    steps: 4,
    trigger: 'Manual',
  },
  {
    id: 'feedback',
    name: 'Feedback Request',
    description: 'Collect valuable feedback from your customers',
    icon: Star,
    gradient: 'from-emerald-500 to-green-500',
    category: 'Engagement',
    steps: 2,
    trigger: 'Manual',
  },
  {
    id: 'birthday',
    name: 'Birthday Campaign',
    description: 'Celebrate subscribers with special birthday offers',
    icon: Gift,
    gradient: 'from-fuchsia-500 to-pink-500',
    category: 'Personalization',
    steps: 2,
    trigger: 'Manual',
  },
];

interface WorkflowTemplatesProps {
  onSelectTemplate: (template: Template) => void;
}

export function WorkflowTemplates({ onSelectTemplate }: WorkflowTemplatesProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg mb-1">Quick Start Templates</h3>
        <p className="text-sm text-muted-foreground">
          Choose a template to quickly create a new workflow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {WORKFLOW_TEMPLATES.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-300 overflow-hidden group"
              onClick={() => onSelectTemplate(template)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${template.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                    <template.icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{template.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {template.steps} emails
                      </span>
                      <span>•</span>
                      <span>{template.trigger}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
