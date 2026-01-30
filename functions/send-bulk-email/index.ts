import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
console.log("RESEND_API_KEY configured:", !!resendApiKey);

const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Recipient {
  email: string;
  name: string | null;
}

interface BulkEmailRequest {
  recipients: Recipient[];
  subject: string;
  body: string;
  fromEmail?: string;
  fromName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-bulk-email function called, method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log("Request body received:", JSON.stringify({
      recipientCount: requestBody.recipients?.length,
      subject: requestBody.subject,
      hasBody: !!requestBody.body,
      fromEmail: requestBody.fromEmail,
      fromName: requestBody.fromName
    }));

    const { recipients, subject, body, fromEmail, fromName }: BulkEmailRequest = requestBody;

    if (!recipients || recipients.length === 0) {
      console.error("No recipients provided");
      throw new Error("No recipients provided");
    }

    if (!subject || !body) {
      console.error("Subject or body missing");
      throw new Error("Subject and body are required");
    }

    // Use provided from address or default to Resend test domain
    // NOTE: onboarding@resend.dev can ONLY send to the email registered on your Resend account
    // For production, verify your own domain at https://resend.com/domains
    const senderEmail = fromEmail || "onboarding@resend.dev";
    const senderName = fromName || "Newsletter";
    const fromAddress = `${senderName} <${senderEmail}>`;
    
    console.log(`Sending bulk email from: ${fromAddress} to ${recipients.length} recipients`);

    // Send emails in batches to avoid rate limits
    const batchSize = 10;
    const results: any[] = [];
    const errors: any[] = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}: ${batch.length} recipients`);
      
      const emailPromises = batch.map(async (recipient) => {
        // Replace template variables
        const personalizedBody = body.replace(/\{\{name\}\}/g, recipient.name || 'Subscriber');
        
        try {
          console.log(`Sending email to: ${recipient.email}`);
          const response = await resend.emails.send({
            from: fromAddress,
            to: [recipient.email],
            subject: subject,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                ${personalizedBody.split('\n').map(line => `<p style="margin: 0 0 16px 0; line-height: 1.6;">${line}</p>`).join('')}
                <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
                <p style="color: #666; font-size: 12px; margin: 0;">
                  You received this email because you subscribed to our newsletter.
                </p>
              </div>
            `,
          });
          console.log(`Email sent successfully to ${recipient.email}:`, JSON.stringify(response));
          results.push({ email: recipient.email, success: true, response });
        } catch (error: any) {
          console.error(`Failed to send to ${recipient.email}:`, error.message, error);
          errors.push({ email: recipient.email, error: error.message });
        }
      });

      await Promise.all(emailPromises);
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Bulk email completed: ${results.length} sent, ${errors.length} failed`);
    if (errors.length > 0) {
      console.log("Errors:", JSON.stringify(errors));
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: results.length, 
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-bulk-email function:", error.message, error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
