import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GitBranch, Target, Users, Mail, Zap, 
  Clock, Tag, TrendingUp, Heart, Gift,
  ShoppingCart, Star, Award, Crown
} from 'lucide-react';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  color: string;
  steps: any[];
  useCase: string;
  expectedResults: string[];
}

const CONDITIONAL_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'lead-scoring-nurture',
    name: 'Smart Lead Scoring & Nurture',
    description: 'Automatically score leads and send targeted content based on engagement level',
    category: 'Lead Generation',
    icon: Target,
    color: 'bg-blue-500',
    useCase: 'Perfect for B2B companies wanting to qualify leads automatically',
    expectedResults: ['40% higher conversion rate', 'Reduced sales cycle', 'Better lead quality'],
    steps: [
      {
        step_order: 1,
        step_type: 'email',
        name: 'Welcome Email',
        subject: 'Welcome to {{company_name}}, {{name}}!',
        body: 'Thank you for your interest in our services. We\'ll send you valuable insights over the next few days.',
        delay_value: 0,
        delay_unit: 'hours'
      },
      {
        step_order: 2,
        step_type: 'delay',
        name: 'Wait 2 Days',
        delay_value: 2,
        delay_unit: 'days'
      },
      {
        step_order: 3,
        step_type: 'condition',
        name: 'Check Engagement',
        condition_field: 'total_opens',
        condition_operator: 'greater_than',
        condition_value: '1',
        true_next_step: 4,
        false_next_step: 8
      },
      {
        step_order: 4,
        step_type: 'action',
        name: 'Add Engaged Tag',
        action_type: 'add_tag',
        action_params: { tag_name: 'Engaged' }
      },
      {
        step_order: 5,
        step_type: 'email',
        name: 'High-Value Content',
        subject: 'Exclusive insights for engaged subscribers',
        body: 'Since you\'ve been engaging with our content, here\'s something special...'
      },
      {
        step_order: 6,
        step_type: 'delay',
        name: 'Wait 3 Days',
        delay_value: 3,
        delay_unit: 'days'
      },
      {
        step_order: 7,
        step_type: 'action',
        name: 'Create Sales Task',
        action_type: 'create_task',
        action_params: {
          title: 'Follow up with engaged lead: {{name}}',
          description: 'This lead has shown high engagement. Consider reaching out.',
          priority: 'high',
          due_days: 1
        }
      },
      {
        step_order: 8,
        step_type: 'email',
        name: 'Re-engagement Email',
        subject: 'We miss you, {{name}}',
        body: 'We noticed you haven\'t opened our recent emails. Here\'s what you might have missed...'
      },
      {
        step_order: 9,
        step_type: 'delay',
        name: 'Wait 5 Days',
        delay_value: 5,
        delay_unit: 'days'
      },
      {
        step_order: 10,
        step_type: 'condition',
        name: 'Check Re-engagement',
        condition_field: 'total_opens',
        condition_operator: 'greater_than',
        condition_value: '1',
        true_next_step: 4,
        false_next_step: 11
      },
      {
        step_order: 11,
        step_type: 'action',
        name: 'Add Inactive Tag',
        action_type: 'add_tag',
        action_params: { tag_name: 'Inactive' }
      }
    ]
  },
  {
    id: 'purchase-behavior-segmentation',
    name: 'Purchase Behavior Segmentation',
    description: 'Segment customers based on purchase history and send personalized offers',
    category: 'E-commerce',
    icon: ShoppingCart,
    color: 'bg-green-500',
    useCase: 'Ideal for e-commerce stores to increase customer lifetime value',
    expectedResults: ['25% increase in repeat purchases', 'Higher average order value', 'Better customer retention'],
    steps: [
      {
        step_order: 1,
        step_type: 'condition',
        name: 'Check Purchase Count',
        condition_field: 'purchase_count',
        condition_operator: 'greater_than',
        condition_value: '0',
        true_next_step: 2,
        false_next_step: 8
      },
      {
        step_order: 2,
        step_type: 'condition',
        name: 'Check Spending Level',
        condition_field: 'total_spent',
        condition_operator: 'greater_than',
        condition_value: '500',
        true_next_step: 3,
        false_next_step: 5
      },
      {
        step_order: 3,
        step_type: 'action',
        name: 'Add VIP Tag',
        action_type: 'add_tag',
        action_params: { tag_name: 'VIP' }
      },
      {
        step_order: 4,
        step_type: 'email',
        name: 'VIP Exclusive Offer',
        subject: 'Exclusive VIP offer just for you, {{name}}',
        body: 'As one of our valued VIP customers, enjoy 20% off your next purchase...'
      },
      {
        step_order: 5,
        step_type: 'action',
        name: 'Add Regular Customer Tag',
        action_type: 'add_tag',
        action_params: { tag_name: 'Regular Customer' }
      },
      {
        step_order: 6,
        step_type: 'email',
        name: 'Customer Appreciation',
        subject: 'Thank you for being a loyal customer',
        body: 'We appreciate your business. Here\'s a 10% discount for your next order...'
      },
      {
        step_order: 7,
        step_type: 'delay',
        name: 'Wait 7 Days',
        delay_value: 7,
        delay_unit: 'days'
      },
      {
        step_order: 8,
        step_type: 'email',
        name: 'First Purchase Incentive',
        subject: 'Complete your first purchase with us',
        body: 'We\'d love to have you as a customer. Here\'s 15% off your first order...'
      }
    ]
  },
  {
    id: 'engagement-based-content',
    name: 'Engagement-Based Content Delivery',
    description: 'Deliver different content paths based on subscriber engagement patterns',
    category: 'Content Marketing',
    icon: TrendingUp,
    color: 'bg-purple-500',
    useCase: 'Perfect for content creators and educational platforms',
    expectedResults: ['Higher content consumption', 'Better engagement rates', 'Reduced unsubscribe rate'],
    steps: [
      {
        step_order: 1,
        step_type: 'email',
        name: 'Content Introduction',
        subject: 'Your learning journey starts here',
        body: 'Welcome to our content series. We\'ll customize your experience based on your interests.'
      },
      {
        step_order: 2,
        step_type: 'delay',
        name: 'Wait 1 Day',
        delay_value: 1,
        delay_unit: 'days'
      },
      {
        step_order: 3,
        step_type: 'condition',
        name: 'Check Click Engagement',
        condition_field: 'total_clicks',
        condition_operator: 'greater_than',
        condition_value: '2',
        true_next_step: 4,
        false_next_step: 7
      },
      {
        step_order: 4,
        step_type: 'action',
        name: 'Tag as Highly Engaged',
        action_type: 'add_tag',
        action_params: { tag_name: 'Highly Engaged' }
      },
      {
        step_order: 5,
        step_type: 'email',
        name: 'Advanced Content',
        subject: 'Advanced strategies for engaged learners',
        body: 'Since you\'re actively engaging, here\'s some advanced content...'
      },
      {
        step_order: 6,
        step_type: 'email',
        name: 'Expert Interview',
        subject: 'Exclusive expert interview',
        body: 'As a highly engaged subscriber, enjoy this exclusive expert interview...'
      },
      {
        step_order: 7,
        step_type: 'email',
        name: 'Beginner-Friendly Content',
        subject: 'Easy tips to get started',
        body: 'Let\'s start with some easy-to-implement tips...'
      },
      {
        step_order: 8,
        step_type: 'delay',
        name: 'Wait 3 Days',
        delay_value: 3,
        delay_unit: 'days'
      },
      {
        step_order: 9,
        step_type: 'email',
        name: 'Motivation & Encouragement',
        subject: 'You\'re doing great! Keep going',
        body: 'Learning takes time. Here\'s some encouragement and simple next steps...'
      }
    ]
  },
  {
    id: 'birthday-loyalty-program',
    name: 'Smart Birthday & Loyalty Program',
    description: 'Celebrate customer birthdays with personalized offers based on their loyalty level',
    category: 'Customer Retention',
    icon: Gift,
    color: 'bg-pink-500',
    useCase: 'Great for retail and service businesses to increase customer loyalty',
    expectedResults: ['Higher customer satisfaction', 'Increased birthday month sales', 'Better brand loyalty'],
    steps: [
      {
        step_order: 1,
        step_type: 'email',
        name: 'Birthday Greeting',
        subject: 'Happy Birthday, {{name}}! 🎉',
        body: 'Wishing you a wonderful birthday! We have a special surprise for you...'
      },
      {
        step_order: 2,
        step_type: 'condition',
        name: 'Check Loyalty Status',
        condition_field: 'has_tag',
        condition_operator: 'equals',
        condition_value: 'VIP',
        true_next_step: 3,
        false_next_step: 5
      },
      {
        step_order: 3,
        step_type: 'email',
        name: 'VIP Birthday Offer',
        subject: 'Your exclusive VIP birthday gift',
        body: 'As our VIP customer, enjoy 30% off + free shipping on your birthday month!'
      },
      {
        step_order: 4,
        step_type: 'action',
        name: 'Create VIP Follow-up Task',
        action_type: 'create_task',
        action_params: {
          title: 'VIP Birthday Follow-up: {{name}}',
          description: 'Follow up on VIP birthday offer',
          priority: 'medium',
          due_days: 7
        }
      },
      {
        step_order: 5,
        step_type: 'email',
        name: 'Regular Birthday Offer',
        subject: 'Your birthday gift from us',
        body: 'Happy Birthday! Enjoy 20% off your next purchase as our gift to you.'
      },
      {
        step_order: 6,
        step_type: 'delay',
        name: 'Wait 7 Days',
        delay_value: 7,
        delay_unit: 'days'
      },
      {
        step_order: 7,
        step_type: 'condition',
        name: 'Check if Offer Used',
        condition_field: 'total_clicks',
        condition_operator: 'greater_than',
        condition_value: '0',
        true_next_step: 8,
        false_next_step: 9
      },
      {
        step_order: 8,
        step_type: 'email',
        name: 'Thank You Message',
        subject: 'Thank you for celebrating with us!',
        body: 'Thanks for using your birthday offer! We hope you loved your purchase.'
      },
      {
        step_order: 9,
        step_type: 'email',
        name: 'Birthday Reminder',
        subject: 'Don\'t forget your birthday gift!',
        body: 'Your birthday offer expires soon. Don\'t miss out on your special discount!'
      }
    ]
  }
];

interface ConditionalWorkflowTemplatesProps {
  onSelectTemplate: (template: WorkflowTemplate) => void;
}

export function ConditionalWorkflowTemplates({ onSelectTemplate }: ConditionalWorkflowTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(CONDITIONAL_TEMPLATES.map(t => t.category)))];
  
  const filteredTemplates = selectedCategory === 'all' 
    ? CONDITIONAL_TEMPLATES 
    : CONDITIONAL_TEMPLATES.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <GitBranch className="h-6 w-6 text-purple-500" />
          Conditional Workflow Templates
        </h2>
        <p className="text-muted-foreground">
          Smart workflows that adapt based on subscriber behavior and data
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === 'all' ? 'All Templates' : category}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map((template, index) => {
          const Icon = template.icon;
          
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${template.color} text-white group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Use Case:</h4>
                    <p className="text-sm text-muted-foreground">{template.useCase}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Expected Results:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {template.expectedResults.map((result, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GitBranch className="h-4 w-4" />
                      {template.steps.filter(s => s.step_type === 'condition').length} conditions
                      <Mail className="h-4 w-4 ml-2" />
                      {template.steps.filter(s => s.step_type === 'email').length} emails
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => onSelectTemplate(template)}
                      className="group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Custom Template Option */}
      <Card className="border-dashed border-2 hover:border-primary transition-colors">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Zap className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Create Custom Conditional Workflow</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            Build your own smart workflow with custom conditions, actions, and branching logic
          </p>
          <Button onClick={() => onSelectTemplate({
            id: 'custom',
            name: 'Custom Workflow',
            description: 'Build from scratch',
            category: 'Custom',
            icon: Zap,
            color: 'bg-gray-500',
            steps: [],
            useCase: 'Custom use case',
            expectedResults: []
          })}>
            <Zap className="h-4 w-4 mr-2" />
            Start from Scratch
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}