import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 1x1 transparent GIF
const TRACKING_PIXEL = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
  0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21,
  0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00,
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
  0x01, 0x00, 0x3b
]);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const campaignId = url.searchParams.get("c");
  const email = url.searchParams.get("e");
  const eventType = url.searchParams.get("t") || "open";
  const linkUrl = url.searchParams.get("url");
  const linkText = url.searchParams.get("text");

  if (!campaignId) {
    return new Response(TRACKING_PIXEL, {
      headers: { "Content-Type": "image/gif", ...corsHeaders },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const userAgent = req.headers.get("user-agent") || "";
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || "";

    // Log the event
    await supabase.from("campaign_events").insert({
      campaign_id: campaignId,
      event_type: eventType,
      recipient_email: email ? decodeURIComponent(email) : null,
      link_url: linkUrl ? decodeURIComponent(linkUrl) : null,
      user_agent: userAgent,
      ip_address: ipAddress,
    });

    // Update campaign counts
    if (eventType === "open") {
      await supabase.rpc("increment_campaign_open", { campaign_uuid: campaignId });
    } else if (eventType === "click") {
      await supabase.rpc("increment_campaign_click", { campaign_uuid: campaignId });
      
      // Track individual link clicks for heatmap
      if (linkUrl) {
        const decodedUrl = decodeURIComponent(linkUrl);
        const decodedText = linkText ? decodeURIComponent(linkText) : null;
        
        await supabase.rpc("track_link_click", {
          p_campaign_id: campaignId,
          p_link_url: decodedUrl,
          p_link_text: decodedText,
        });
        
        console.log(`Tracked link click: ${decodedUrl} for campaign ${campaignId}`);
      }
    }

    console.log(`Tracked ${eventType} for campaign ${campaignId}`);

    // For clicks, redirect to the actual URL
    if (eventType === "click" && linkUrl) {
      return new Response(null, {
        status: 302,
        headers: { Location: decodeURIComponent(linkUrl), ...corsHeaders },
      });
    }

    // For opens, return tracking pixel
    return new Response(TRACKING_PIXEL, {
      headers: { 
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        ...corsHeaders 
      },
    });
  } catch (error: any) {
    console.error("Error tracking email:", error);
    return new Response(TRACKING_PIXEL, {
      headers: { "Content-Type": "image/gif", ...corsHeaders },
    });
  }
};

serve(handler);
