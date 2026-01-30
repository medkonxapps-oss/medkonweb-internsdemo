import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const campaignId = url.searchParams.get("c");

  if (!token) {
    return new Response(getUnsubscribePage(false, "Invalid unsubscribe link"), {
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find subscriber by token
    const { data: subscriber, error: findError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, subscribed")
      .eq("unsubscribe_token", token)
      .maybeSingle();

    if (findError || !subscriber) {
      console.error("Subscriber not found:", findError);
      return new Response(getUnsubscribePage(false, "Invalid or expired unsubscribe link"), {
        headers: { "Content-Type": "text/html", ...corsHeaders },
      });
    }

    if (!subscriber.subscribed) {
      return new Response(getUnsubscribePage(true, "You have already been unsubscribed."), {
        headers: { "Content-Type": "text/html", ...corsHeaders },
      });
    }

    // Unsubscribe the user
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({
        subscribed: false,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("Error unsubscribing:", updateError);
      return new Response(getUnsubscribePage(false, "Failed to unsubscribe. Please try again."), {
        headers: { "Content-Type": "text/html", ...corsHeaders },
      });
    }

    // Log the unsubscribe event
    if (campaignId) {
      await supabase.from("campaign_events").insert({
        campaign_id: campaignId,
        event_type: "unsubscribe",
        recipient_email: subscriber.email,
      });
    }

    console.log(`Unsubscribed: ${subscriber.email}`);

    return new Response(getUnsubscribePage(true, "You have been successfully unsubscribed from our newsletter."), {
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in unsubscribe function:", error);
    return new Response(getUnsubscribePage(false, "An error occurred. Please try again."), {
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });
  }
};

function getUnsubscribePage(success: boolean, message: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${success ? 'Unsubscribed' : 'Unsubscribe Error'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 48px;
      text-align: center;
      max-width: 480px;
    }
    .icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 32px;
    }
    .icon.success { background: rgba(34, 197, 94, 0.2); }
    .icon.error { background: rgba(239, 68, 68, 0.2); }
    h1 {
      color: #fff;
      font-size: 24px;
      margin-bottom: 16px;
    }
    p {
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon ${success ? 'success' : 'error'}">
      ${success ? '✓' : '✕'}
    </div>
    <h1>${success ? 'Unsubscribed' : 'Oops!'}</h1>
    <p>${message}</p>
  </div>
</body>
</html>
  `;
}

serve(handler);
