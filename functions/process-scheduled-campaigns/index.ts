import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to wrap links with tracking
function wrapLinksWithTracking(html: string, campaignId: string, email: string, supabaseUrl: string): string {
  // Match <a> tags and wrap their hrefs
  const linkRegex = /<a\s+([^>]*href\s*=\s*["'])([^"']+)(["'][^>]*)>([^<]*)<\/a>/gi;
  
  return html.replace(linkRegex, (match, prefix, url, suffix, text) => {
    // Don't track unsubscribe links
    if (url.includes('unsubscribe')) {
      return match;
    }
    
    const trackingUrl = `${supabaseUrl}/functions/v1/track-email?c=${campaignId}&e=${encodeURIComponent(email)}&t=click&url=${encodeURIComponent(url)}&text=${encodeURIComponent(text || '')}`;
    return `<a ${prefix}${trackingUrl}${suffix}>${text}</a>`;
  });
}

// Function to calculate next scheduled date based on recurrence pattern
function calculateNextScheduledDate(pattern: string, lastDate: Date): Date {
  const next = new Date(lastDate);
  
  switch (pattern) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      return next;
  }
  
  return next;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";

    // Get campaigns that are due (both regular and recurring)
    const now = new Date().toISOString();
    const { data: campaigns, error: fetchError } = await supabase
      .from("scheduled_campaigns")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_at", now);

    if (fetchError) throw fetchError;

    if (!campaigns || campaigns.length === 0) {
      console.log("No campaigns to process");
      return new Response(
        JSON.stringify({ message: "No campaigns to process" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing ${campaigns.length} scheduled campaigns`);

    // Get all active subscribers with their unsubscribe tokens
    const { data: subscribers, error: subError } = await supabase
      .from("newsletter_subscribers")
      .select("email, name, unsubscribe_token")
      .eq("subscribed", true);

    if (subError) throw subError;

    for (const campaign of campaigns) {
      try {
        console.log(`Sending campaign: ${campaign.subject}`);

        const batchSize = 10;
        let sentCount = 0;
        let errorCount = 0;

        for (let i = 0; i < subscribers.length; i += batchSize) {
          const batch = subscribers.slice(i, i + batchSize);

          const emailPromises = batch.map(async (recipient: any) => {
            const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            
            // Replace all template variables
            let personalizedBody = campaign.body
              .replace(/\{\{name\}\}/g, recipient.name || "Subscriber")
              .replace(/\{\{email\}\}/g, recipient.email)
              .replace(/\{\{date\}\}/g, currentDate)
              .replace(/\{\{company_name\}\}/g, "Your Company")
              .replace(/\{\{website_url\}\}/g, "https://example.com")
              .replace(/\{\{support_email\}\}/g, "support@example.com");
            
            // Wrap links with tracking
            personalizedBody = wrapLinksWithTracking(personalizedBody, campaign.id, recipient.email, supabaseUrl);
            
            // Add tracking pixel
            const trackingPixel = `<img src="${supabaseUrl}/functions/v1/track-email?c=${campaign.id}&e=${encodeURIComponent(recipient.email)}&t=open" width="1" height="1" style="display:none;" />`;
            
            // Add unsubscribe link
            const unsubscribeUrl = `${supabaseUrl}/functions/v1/unsubscribe?token=${recipient.unsubscribe_token}&c=${campaign.id}`;
            
            try {
              await resend.emails.send({
                from: "Newsletter <onboarding@resend.dev>",
                to: [recipient.email],
                subject: campaign.subject,
                html: `
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    ${personalizedBody}
                    <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
                    <p style="color: #666; font-size: 12px; margin: 0;">
                      You received this email because you subscribed to our newsletter.
                      <br />
                      <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">Unsubscribe</a>
                    </p>
                    ${trackingPixel}
                  </div>
                `,
              });
              sentCount++;
            } catch (error: any) {
              console.error(`Failed to send to ${recipient.email}:`, error);
              errorCount++;
            }
          });

          await Promise.all(emailPromises);

          if (i + batchSize < subscribers.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        // Handle recurring campaigns
        if (campaign.is_recurring && campaign.recurrence_pattern) {
          const nextScheduled = calculateNextScheduledDate(campaign.recurrence_pattern, new Date(campaign.scheduled_at));
          const endDate = campaign.recurrence_end_date ? new Date(campaign.recurrence_end_date) : null;
          
          // Check if we should continue recurring
          if (!endDate || nextScheduled <= endDate) {
            // Update current campaign as sent but keep it for tracking
            await supabase
              .from("scheduled_campaigns")
              .update({
                status: "sent",
                sent_at: new Date().toISOString(),
                recipient_count: sentCount,
                last_sent_at: new Date().toISOString(),
              })
              .eq("id", campaign.id);
            
            // Create the next occurrence
            const { error: insertError } = await supabase
              .from("scheduled_campaigns")
              .insert({
                subject: campaign.subject,
                body: campaign.body,
                scheduled_at: nextScheduled.toISOString(),
                status: "scheduled",
                is_recurring: true,
                recurrence_pattern: campaign.recurrence_pattern,
                recurrence_end_date: campaign.recurrence_end_date,
                parent_campaign_id: campaign.parent_campaign_id || campaign.id,
                created_by: campaign.created_by,
              });
            
            if (insertError) {
              console.error(`Error creating next recurring campaign:`, insertError);
            } else {
              console.log(`Created next recurring campaign for ${nextScheduled.toISOString()}`);
            }
          } else {
            // End the recurrence
            await supabase
              .from("scheduled_campaigns")
              .update({
                status: "sent",
                sent_at: new Date().toISOString(),
                recipient_count: sentCount,
                is_recurring: false,
              })
              .eq("id", campaign.id);
            
            console.log(`Recurring campaign ${campaign.id} ended - past end date`);
          }
        } else {
          // Regular non-recurring campaign
          await supabase
            .from("scheduled_campaigns")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
              recipient_count: sentCount,
            })
            .eq("id", campaign.id);
        }

        console.log(`Campaign ${campaign.id} sent: ${sentCount} emails, ${errorCount} failed`);
      } catch (error: any) {
        console.error(`Error processing campaign ${campaign.id}:`, error);
        await supabase
          .from("scheduled_campaigns")
          .update({
            status: "scheduled",
            error_message: error.message,
          })
          .eq("id", campaign.id);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: campaigns.length }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in process-scheduled-campaigns:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
