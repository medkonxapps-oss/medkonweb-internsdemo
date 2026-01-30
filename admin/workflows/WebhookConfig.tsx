import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Webhook, Copy, Check, ExternalLink, Code2, 
  Shield, AlertTriangle, Key, Play
} from 'lucide-react';

interface WebhookConfigProps {
  workflowId: string;
  workflowName: string;
  isActive: boolean;
}

export function WebhookConfig({ workflowId, workflowName, isActive }: WebhookConfigProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const webhookUrl = `${supabaseUrl}/functions/v1/trigger-workflow`;

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  };

  const examplePayload = JSON.stringify({
    workflow_id: workflowId,
    subscriber_email: "user@example.com",
    metadata: {
      source: "your-app",
      custom_field: "value"
    }
  }, null, 2);

  const curlExample = `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-webhook-secret: YOUR_SECRET" \\
  -d '{
    "workflow_id": "${workflowId}",
    "subscriber_email": "user@example.com"
  }'`;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5"
      >
        <Webhook className="h-4 w-4" />
        Webhook
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhook Configuration
            </DialogTitle>
            <DialogDescription>
              Trigger "{workflowName}" from external systems via API
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {/* Status */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
              {isActive ? (
                <>
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Check className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-600 dark:text-emerald-400">Webhook Ready</p>
                    <p className="text-sm text-muted-foreground">This workflow is active and can receive triggers</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-600 dark:text-amber-400">Workflow Inactive</p>
                    <p className="text-sm text-muted-foreground">Activate the workflow to enable webhook triggers</p>
                  </div>
                </>
              )}
            </div>

            {/* Endpoint URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Webhook Endpoint</label>
              <div className="flex gap-2">
                <Input
                  value={webhookUrl}
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(webhookUrl, 'url')}
                >
                  {copied === 'url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Workflow ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Workflow ID</label>
              <div className="flex gap-2">
                <Input
                  value={workflowId}
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(workflowId, 'id')}
                >
                  {copied === 'id' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Security Note */}
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-medium text-amber-600 dark:text-amber-400">Security Recommendation</p>
                    <p className="text-sm text-muted-foreground">
                      For production use, set up a <code className="px-1 py-0.5 bg-muted rounded">WORKFLOW_WEBHOOK_SECRET</code> environment variable and include it in your requests as the <code className="px-1 py-0.5 bg-muted rounded">x-webhook-secret</code> header.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Request Format */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Request Format
              </h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Example Payload (JSON)</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(examplePayload, 'payload')}
                  >
                    {copied === 'payload' ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    Copy
                  </Button>
                </div>
                <pre className="p-4 rounded-xl bg-muted/50 overflow-x-auto text-sm font-mono">
                  {examplePayload}
                </pre>
              </div>
            </div>

            {/* cURL Example */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">cURL Example</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(curlExample, 'curl')}
                >
                  {copied === 'curl' ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  Copy
                </Button>
              </div>
              <pre className="p-4 rounded-xl bg-muted/50 overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                {curlExample}
              </pre>
            </div>

            {/* Parameters */}
            <div className="space-y-3">
              <h4 className="font-medium">Request Parameters</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <Badge variant="secondary" className="shrink-0 mt-0.5">Required</Badge>
                  <div>
                    <code className="text-sm font-mono">workflow_id</code> or <code className="text-sm font-mono">workflow_name</code>
                    <p className="text-sm text-muted-foreground mt-1">Identify which workflow to trigger</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <Badge variant="secondary" className="shrink-0 mt-0.5">Required</Badge>
                  <div>
                    <code className="text-sm font-mono">subscriber_email</code> or <code className="text-sm font-mono">subscriber_id</code>
                    <p className="text-sm text-muted-foreground mt-1">The subscriber to enroll in the workflow</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <Badge variant="outline" className="shrink-0 mt-0.5">Optional</Badge>
                  <div>
                    <code className="text-sm font-mono">metadata</code>
                    <p className="text-sm text-muted-foreground mt-1">Custom data object to store with the execution</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response */}
            <div className="space-y-3">
              <h4 className="font-medium">Response</h4>
              <pre className="p-4 rounded-xl bg-muted/50 overflow-x-auto text-sm font-mono">
{`{
  "success": true,
  "message": "Workflow triggered successfully",
  "execution_id": "uuid",
  "workflow_id": "uuid",
  "subscriber_id": "uuid",
  "next_step_at": "2024-01-01T12:00:00Z"
}`}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
