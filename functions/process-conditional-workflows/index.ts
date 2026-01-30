import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  subscriber_id: string;
  current_step: number;
  status: string;
  next_step_at: string;
  metadata: any;
}

interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  step_type: string;
  name: string;
  subject?: string;
  body?: string;
  delay_value?: number;
  delay_unit?: string;
  condition_field?: string;
  condition_operator?: string;
  condition_value?: string;
  true_next_step?: number;
  false_next_step?: number;
  action_type?: string;
  action_params?: any;
}

interface Subscriber {
  id: string;
  email: string;
  name: string;
  lead_score?: number;
  engagement_level?: string;
  total_opens?: number;
  total_clicks?: number;
  purchase_count?: number;
  total_spent?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = resendKey ? new Resend(resendKey) : null;

    console.log("Processing conditional workflow executions...");

    // Get executions that are due
    const now = new Date().toISOString();
    const { data: executions, error: fetchError } = await supabase
      .from("workflow_executions")
      .select(`
        *,
        workflow:email_workflows(*),
        subscriber:newsletter_subscribers(*)
      `)
      .eq("status", "active")
      .lte("next_step_at", now);

    if (fetchError) throw fetchError;

    if (!executions || executions.length === 0) {
      console.log("No workflow steps to process");
      return new Response(
        JSON.stringify({ message: "No workflow steps to process" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${executions.length} executions to process`);

    let processedCount = 0;
    let errorCount = 0;

    for (const execution of executions) {
      try {
        await processWorkflowExecution(supabase, resend, execution);
        processedCount++;
      } catch (error) {
        console.error(`Error processing execution ${execution.id}:`, error);
        errorCount++;
        
        // Log the error
        await supabase
          .from("workflow_step_logs")
          .insert({
            execution_id: execution.id,
            step_id: null,
            status: "failed",
            error_message: error.message,
          });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${processedCount} executions, ${errorCount} errors`,
        processed: processedCount,
        errors: errorCount,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Error in workflow processor:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

async function processWorkflowExecution(
  supabase: any,
  resend: any,
  execution: WorkflowExecution
) {
  console.log(`Processing execution ${execution.id}, step ${execution.current_step}`);

  // Get the current step
  const { data: steps } = await supabase
    .from("workflow_steps")
    .select("*")
    .eq("workflow_id", execution.workflow_id)
    .order("step_order");

  if (!steps || steps.length === 0) {
    throw new Error("No steps found for workflow");
  }

  const currentStep = steps.find((s: WorkflowStep) => s.step_order === execution.current_step);
  if (!currentStep) {
    // Workflow completed
    await supabase
      .from("workflow_executions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", execution.id);
    return;
  }

  const subscriber = execution.subscriber;
  let nextStepOrder = execution.current_step + 1;
  let nextStepDelay = 0;

  // Process step based on type
  switch (currentStep.step_type) {
    case "email":
      await processEmailStep(supabase, resend, execution, currentStep, subscriber);
      break;
    
    case "condition":
      nextStepOrder = await processConditionStep(supabase, execution, currentStep, subscriber);
      break;
    
    case "action":
      await processActionStep(supabase, execution, currentStep, subscriber);
      break;
    
    case "delay":
      nextStepDelay = calculateDelay(currentStep.delay_value || 0, currentStep.delay_unit || "hours");
      break;
  }

  // Log step completion
  await supabase
    .from("workflow_step_logs")
    .insert({
      execution_id: execution.id,
      step_id: currentStep.id,
      status: "sent",
    });

  // Update execution to next step
  const nextStep = steps.find((s: WorkflowStep) => s.step_order === nextStepOrder);
  if (nextStep) {
    const nextStepAt = new Date();
    nextStepAt.setMilliseconds(nextStepAt.getMilliseconds() + nextStepDelay);

    await supabase
      .from("workflow_executions")
      .update({
        current_step: nextStepOrder,
        next_step_at: nextStepAt.toISOString(),
      })
      .eq("id", execution.id);
  } else {
    // Workflow completed
    await supabase
      .from("workflow_executions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", execution.id);
  }
}

async function processEmailStep(
  supabase: any,
  resend: any,
  execution: WorkflowExecution,
  step: WorkflowStep,
  subscriber: Subscriber
) {
  if (!resend) {
    console.log("Resend not configured, skipping email");
    return;
  }

  // Get sender settings
  const { data: senderSettings } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "email_sender")
    .single();

  const fromEmail = senderSettings?.value || "noreply@medkon.com";

  // Personalize email content
  const personalizedSubject = personalizeContent(step.subject || "", subscriber);
  const personalizedBody = personalizeContent(step.body || "", subscriber);

  try {
    await resend.emails.send({
      from: fromEmail,
      to: subscriber.email,
      subject: personalizedSubject,
      html: personalizedBody,
    });

    console.log(`Email sent to ${subscriber.email} for step ${step.step_order}`);

    // Update subscriber engagement
    await supabase
      .from("newsletter_subscribers")
      .update({
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", subscriber.id);

  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

async function processConditionStep(
  supabase: any,
  execution: WorkflowExecution,
  step: WorkflowStep,
  subscriber: Subscriber
): Promise<number> {
  // Evaluate condition using the database function
  const { data: conditionResult } = await supabase
    .rpc("evaluate_workflow_condition", {
      p_subscriber_id: subscriber.id,
      p_condition_field: step.condition_field,
      p_condition_operator: step.condition_operator,
      p_condition_value: step.condition_value,
    });

  console.log(`Condition result for ${subscriber.email}: ${conditionResult}`);

  // Return next step based on condition result
  if (conditionResult) {
    return step.true_next_step || (execution.current_step + 1);
  } else {
    return step.false_next_step || (execution.current_step + 1);
  }
}

async function processActionStep(
  supabase: any,
  execution: WorkflowExecution,
  step: WorkflowStep,
  subscriber: Subscriber
) {
  if (!step.action_type || !step.action_params) {
    console.log("No action configured for step");
    return;
  }

  // Execute action using the database function
  await supabase
    .rpc("execute_workflow_action", {
      p_subscriber_id: subscriber.id,
      p_action_type: step.action_type,
      p_action_params: step.action_params,
    });

  console.log(`Action ${step.action_type} executed for ${subscriber.email}`);
}

function calculateDelay(value: number, unit: string): number {
  const multipliers = {
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
  };

  return value * (multipliers[unit as keyof typeof multipliers] || multipliers.hours);
}

function personalizeContent(content: string, subscriber: Subscriber): string {
  return content
    .replace(/\{\{name\}\}/g, subscriber.name || "there")
    .replace(/\{\{email\}\}/g, subscriber.email)
    .replace(/\{\{lead_score\}\}/g, (subscriber.lead_score || 0).toString())
    .replace(/\{\{engagement_level\}\}/g, subscriber.engagement_level || "new")
    .replace(/\{\{total_opens\}\}/g, (subscriber.total_opens || 0).toString())
    .replace(/\{\{total_clicks\}\}/g, (subscriber.total_clicks || 0).toString())
    .replace(/\{\{purchase_count\}\}/g, (subscriber.purchase_count || 0).toString())
    .replace(/\{\{total_spent\}\}/g, (subscriber.total_spent || 0).toString())
    .replace(/\{\{date\}\}/g, new Date().toLocaleDateString());
}

serve(handler);