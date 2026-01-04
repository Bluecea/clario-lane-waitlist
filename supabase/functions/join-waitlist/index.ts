import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    // Basic validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email address");
    }

    // Initialize Supabase Client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Insert into waitlist
    const { error: dbError } = await supabaseClient
      .from("waitlist")
      .insert({ email });

    if (dbError) {
      if (dbError.code === "23505") { // Unique violation
        return new Response(
          JSON.stringify({ message: "Email already exists" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }
      throw dbError;
    }

    // Send Email via Resend
    if (RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "ClarioLane <noreply@clariolane.com>",
          to: [email],
          subject: "Welcome to ClarioLane Waitlist!",
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h1>You're on the list! 🚀</h1>
              <p>Thanks for joining the ClarioLane waitlist. We're excited to have you with us.</p>
              <p>We'll notify you as soon as we're ready to launch.</p>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        console.error("Resend Error:", await res.text());
      }
    } else {
      console.log("Skipping email: RESEND_API_KEY not set");
    }

    return new Response(
      JSON.stringify({ message: "Successfully joined waitlist" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
