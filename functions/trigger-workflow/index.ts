import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

interface TriggerRequest {
  workflow_id?: string;
  workflow_name?: string;
  subscriber_email?: string;
  subscriber_id?: string;
  metadata?: Record<string, any>;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const webhookSecret = Deno.env.get("WORKFLOW_WEBHOOK_SECRET");

    // Validate webhook secret if configured
    const providedSecret = req.headers.get("x-webhook-secret");
    if (webhookSecret && providedSecret !== webhookSecret) {
      console.error("Invalid webhook secret provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid webhook secret" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: TriggerRequest = await req.json();
    console.log("Received webhook trigger request:", body);

    // Validate request
    if (!body.workflow_id && !body.workflow_name) {
      return new Response(
        JSON.stringify({ error: "Either workflow_id or workflow_name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.subscriber_email && !body.subscriber_id) {
      return new Response(
        JSON.stringify({ error: "Either subscriber_email or subscriber_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the workflow
    let workflowId = body.workflow_id;
    if (!workflowId && body.workflow_name) {
      const { data: workflow, error: wfError } = await supabase
        .from("email_workflows")
        .select("id, is_active")
        .eq("name", body.workflow_name)
        .maybeSingle();

      if (wfError || !workflow) {
        return new Response(
          JSON.stringify({ error: `Workflow not found: ${body.workflow_name}` }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!workflow.is_active) {
        return new Response(
          JSON.stringify({ error: "Workflow is not active" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      workflowId = workflow.id;
    } else {
      // Verify workflow exists and is active
      const { data: workflow, error: wfError } = await supabase
        .from("email_workflows")
        .select("id, is_active")
        .eq("id", workflowId)
        .maybeSingle();

      if (wfError || !workflow) {
        return new Response(
          JSON.stringify({ error: `Workflow not found: ${workflowId}` }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!workflow.is_active) {
        return new Response(
          JSON.stringify({ error: "Workflow is not active" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Find the subscriber
    let subscriberId = body.subscriber_id;
    if (!subscriberId && body.subscriber_email) {
      // Try to find existing subscriber
      const { data: subscriber } = await supabase
        .from("newsletter_subscribers")
        .select("id")
        .eq("email", body.subscriber_email)
        .eq("subscribed", true)
        .maybeSingle();

      if (subscriber) {
        subscriberId = subscriber.id;
      } else {
        // Create new subscriber if doesn't exist
        const { data: newSubscriber, error: subError } = await supabase
          .from("newsletter_subscribers")
          .insert({
            email: body.subscriber_email,
            source: "webhook",
            subscribed: true,
          })
          .select()
          .single();

        if (subError) {
          console.error("Error creating subscriber:", subError);
          return new Response(
            JSON.stringify({ error: "Failed to create subscriber" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        subscriberId = newSubscriber.id;
        console.log("Created new subscriber:", subscriberId);
      }
    } else {
      // Verify subscriber exists
      const { data: subscriber, error: subError } = await supabase
        .from("newsletter_subscribers")
        .select("id")
        .eq("id", subscriberId)
        .maybeSingle();

      if (subError || !subscriber) {
        return new Response(
          JSON.stringify({ error: `Subscriber not found: ${subscriberId}` }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get the first step of the workflow
    const { data: firstStep, error: stepError } = await supabase
      .from("workflow_steps")
      .select("*")
      .eq("workflow_id", workflowId)
      .order("step_order")
      .limit(1)
      .maybeSingle();

    if (stepError || !firstStep) {
      return new Response(
        JSON.stringify({ error: "Workflow has no steps configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate when the first step should be executed
    let nextStepAt = new Date();
    switch (firstStep.delay_unit) {
      case "minutes":
        nextStepAt.setMinutes(nextStepAt.getMinutes() + firstStep.delay_value);
        break;
      case "hours":
        nextStepAt.setHours(nextStepAt.getHours() + firstStep.delay_value);
        break;
      case "days":
        nextStepAt.setDate(nextStepAt.getDate() + firstStep.delay_value);
        break;
      case "weeks":
        nextStepAt.setDate(nextStepAt.getDate() + firstStep.delay_value * 7);
        break;
    }

    // Create workflow execution
    const { data: execution, error: execError } = await supabase
      .from("workflow_executions")
      .upsert({
        workflow_id: workflowId,
        subscriber_id: subscriberId,
        current_step: 1,
        status: "active",
        next_step_at: nextStepAt.toISOString(),
        started_at: new Date().toISOString(),
        metadata: body.metadata || {},
      }, {
        onConflict: "workflow_id,subscriber_id",
      })
      .select()
      .single();

    if (execError) {
      console.error("Error creating execution:", execError);
      return new Response(
        JSON.stringify({ error: "Failed to start workflow execution" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Workflow triggered successfully:", {
      execution_id: execution.id,
      workflow_id: workflowId,
      subscriber_id: subscriberId,
      next_step_at: nextStepAt.toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Workflow triggered successfully",
        execution_id: execution.id,
        workflow_id: workflowId,
        subscriber_id: subscriberId,
        next_step_at: nextStepAt.toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in trigger-workflow function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
