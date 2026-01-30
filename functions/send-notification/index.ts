import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "lead" | "plugin_download";
  data: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    message?: string;
    plugin_name?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data }: NotificationRequest = await req.json();

    console.log(`Processing ${type} notification for: ${data.email}`);

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let adminSubject = "";
    let adminHtml = "";
    let userSubject = "";
    let userHtml = "";

    if (type === "lead") {
      adminSubject = `New Lead: ${data.name}`;
      adminHtml = `
        <h1>New Lead Submission</h1>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        ${data.company ? `<p><strong>Company:</strong> ${data.company}</p>` : ""}
        ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
        ${data.message ? `<p><strong>Message:</strong></p><p>${data.message}</p>` : ""}
        <p style="color: #888; font-size: 12px;">Submitted via website contact form</p>
      `;

      userSubject = "Thanks for reaching out!";
      userHtml = `
        <h1>Thank you for contacting us, ${data.name}!</h1>
        <p>We've received your message and will get back to you within 24 hours.</p>
        <p>In the meantime, feel free to explore our portfolio and services on our website.</p>
        <p>Best regards,<br>The Medkon Team</p>
      `;
    } else if (type === "plugin_download") {
      adminSubject = `Plugin Download Request: ${data.plugin_name}`;
      adminHtml = `
        <h1>New Plugin Download Request</h1>
        <p><strong>Plugin:</strong> ${data.plugin_name}</p>
        <p><strong>Name:</strong> ${data.name || "Not provided"}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p style="color: #888; font-size: 12px;">Submitted via website plugin download form</p>
      `;

      userSubject = `Your download request for ${data.plugin_name}`;
      userHtml = `
        <h1>Thanks for your interest, ${data.name || "there"}!</h1>
        <p>We've received your request for <strong>${data.plugin_name}</strong>.</p>
        <p>Our team will review your request and send you the download link shortly.</p>
        <p>Best regards,<br>The Medkon Team</p>
      `;
    }

    // Send admin notification
    const adminRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Medkon <onboarding@resend.dev>",
        to: ["admin@medkon.dev"],
        subject: adminSubject,
        html: adminHtml,
      }),
    });

    const adminEmail = await adminRes.json();
    console.log("Admin email response:", adminEmail);

    // Send user confirmation
    const userRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Medkon <onboarding@resend.dev>",
        to: [data.email],
        subject: userSubject,
        html: userHtml,
      }),
    });

    const userEmail = await userRes.json();
    console.log("User email response:", userEmail);

    return new Response(
      JSON.stringify({ success: true, adminEmail, userEmail }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
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
