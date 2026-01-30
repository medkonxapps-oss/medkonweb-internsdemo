import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Processing workflow executions...");

    // Get executions that are due
    const now = new Date().toISOString();
    const { data: executions, error: fetchError } = await supabase
      .from("workflow_executions")
      .select(`
        *,
        workflow:email_workflows(*),
        subscriber:newsletter_subscribers(id, email, name)
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

    // Get email sender settings
    const { data: senderSettings } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "email_sender")
      .maybeSingle();

    const senderEmail = senderSettings?.value?.sender_email || "onboarding@resend.dev";
    const senderName = senderSettings?.value?.sender_name || "Newsletter";

    const resend = resendKey ? new Resend(resendKey) : null;
    let processedCount = 0;
    let errorCount = 0;

    for (const execution of executions) {
      try {
        const workflow = execution.workflow;
        const subscriber = execution.subscriber;

        if (!workflow || !subscriber || !subscriber.email) {
          console.log(`Skipping execution ${execution.id}: missing workflow or subscriber`);
          continue;
        }

        // Get the current step
        const { data: steps, error: stepsError } = await supabase
          .from("workflow_steps")
          .select("*")
          .eq("workflow_id", workflow.id)
          .order("step_order");

        if (stepsError) throw stepsError;

        const currentStep = steps?.find(s => s.step_order === execution.current_step);

        if (!currentStep) {
          // No more steps, mark as completed
          await supabase
            .from("workflow_executions")
            .update({ status: "completed", completed_at: now })
            .eq("id", execution.id);
          
          console.log(`Completed workflow execution ${execution.id}`);
          continue;
        }

        // Send the email
        let personalizedBody = currentStep.body
          .replace(/\{\{name\}\}/g, subscriber.name || "Subscriber")
          .replace(/\{\{email\}\}/g, subscriber.email)
          .replace(/\{\{date\}\}/g, new Date().toLocaleDateString());

        let personalizedSubject = currentStep.subject
          .replace(/\{\{name\}\}/g, subscriber.name || "Subscriber")
          .replace(/\{\{email\}\}/g, subscriber.email);

        if (resend) {
          try {
            await resend.emails.send({
              from: `${senderName} <${senderEmail}>`,
              to: [subscriber.email],
              subject: personalizedSubject,
              html: personalizedBody,
            });

            // Log the step execution
            await supabase.from("workflow_step_logs").insert({
              execution_id: execution.id,
              step_id: currentStep.id,
              status: "sent",
            });

            console.log(`Sent step ${currentStep.step_order} to ${subscriber.email}`);
            processedCount++;
          } catch (emailError: any) {
            console.error(`Error sending email:`, emailError);
            await supabase.from("workflow_step_logs").insert({
              execution_id: execution.id,
              step_id: currentStep.id,
              status: "failed",
              error_message: emailError.message,
            });
            errorCount++;
          }
        } else {
          console.log(`Would send to ${subscriber.email}: ${personalizedSubject}`);
          await supabase.from("workflow_step_logs").insert({
            execution_id: execution.id,
            step_id: currentStep.id,
            status: "sent",
          });
          processedCount++;
        }

        // Calculate next step
        const nextStepIndex = steps.findIndex(s => s.step_order === execution.current_step) + 1;
        
        if (nextStepIndex < steps.length) {
          const nextStep = steps[nextStepIndex];
          const nextStepAt = new Date();
          
          switch (nextStep.delay_unit) {
            case "minutes":
              nextStepAt.setMinutes(nextStepAt.getMinutes() + nextStep.delay_value);
              break;
            case "hours":
              nextStepAt.setHours(nextStepAt.getHours() + nextStep.delay_value);
              break;
            case "days":
              nextStepAt.setDate(nextStepAt.getDate() + nextStep.delay_value);
              break;
            case "weeks":
              nextStepAt.setDate(nextStepAt.getDate() + nextStep.delay_value * 7);
              break;
          }

          await supabase
            .from("workflow_executions")
            .update({
              current_step: nextStep.step_order,
              next_step_at: nextStepAt.toISOString(),
            })
            .eq("id", execution.id);
        } else {
          // No more steps, mark as completed
          await supabase
            .from("workflow_executions")
            .update({ status: "completed", completed_at: now })
            .eq("id", execution.id);
        }
      } catch (execError) {
        console.error(`Error processing execution ${execution.id}:`, execError);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${processedCount} workflow steps`,
        processed: processedCount,
        errors: errorCount,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in process-workflows:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
