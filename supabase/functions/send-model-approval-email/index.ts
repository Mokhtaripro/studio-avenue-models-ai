import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  modelProfileId: string;
  approved: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { modelProfileId, approved }: ApprovalEmailRequest = await req.json();
    console.log("Processing approval email for model:", modelProfileId, "approved:", approved);

    // Get model profile with user info
    const { data: modelProfile, error: profileError } = await supabaseAdmin
      .from("model_profiles")
      .select("user_id, pseudo")
      .eq("id", modelProfileId)
      .single();

    if (profileError || !modelProfile) {
      console.error("Model profile not found:", profileError);
      throw new Error("Model profile not found");
    }

    // Get user email from profiles table
    const { data: profile, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("email, first_name")
      .eq("user_id", modelProfile.user_id)
      .single();

    if (userError || !profile?.email) {
      console.error("User email not found:", userError);
      throw new Error("User email not found");
    }

    const userName = profile.first_name || modelProfile.pseudo || "Mannequin";
    const userEmail = profile.email;

    let emailHtml: string;
    let emailSubject: string;

    if (approved) {
      // Generate password reset link
      const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: userEmail,
        options: {
          redirectTo: "https://wevljukjnesrbrrdmtwn.lovable.app/definir-mot-de-passe",
        },
      });

      if (resetError) {
        console.error("Failed to generate reset link:", resetError);
        throw new Error("Failed to generate password reset link");
      }

      const resetLink = resetData?.properties?.action_link;
      console.log("Generated reset link for:", userEmail);

      emailSubject = "🎉 Votre profil mannequin a été approuvé !";
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { font-size: 28px; font-weight: 300; letter-spacing: 2px; margin: 0; }
            .content { background: #fafafa; padding: 40px; margin-bottom: 30px; }
            .button { display: inline-block; background: #1a1a1a; color: #ffffff !important; padding: 16px 40px; text-decoration: none; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; margin: 20px 0; }
            .footer { text-align: center; font-size: 12px; color: #888; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>STUDIOAVENUE</h1>
            </div>
            <div class="content">
              <p>Bonjour ${userName},</p>
              <p>Excellente nouvelle ! Votre profil mannequin a été <strong>approuvé</strong> par notre équipe.</p>
              <p>Pour accéder à votre espace personnel et compléter votre profil, veuillez d'abord créer votre mot de passe :</p>
              <p style="text-align: center;">
                <a href="${resetLink}" class="button">Créer mon mot de passe</a>
              </p>
              <p>Ce lien est valable pendant 24 heures.</p>
              <p>Une fois votre mot de passe créé, vous pourrez :</p>
              <ul>
                <li>Compléter votre profil avec vos mensurations</li>
                <li>Ajouter vos photos de book</li>
                <li>Gérer vos disponibilités</li>
                <li>Recevoir des propositions de booking</li>
              </ul>
              <p>Bienvenue dans l'agence StudioAvenue !</p>
              <p>L'équipe StudioAvenue</p>
            </div>
            <div class="footer">
              <p>© 2024 StudioAvenue. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      emailSubject = "Information concernant votre candidature";
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { font-size: 28px; font-weight: 300; letter-spacing: 2px; margin: 0; }
            .content { background: #fafafa; padding: 40px; margin-bottom: 30px; }
            .footer { text-align: center; font-size: 12px; color: #888; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>STUDIOAVENUE</h1>
            </div>
            <div class="content">
              <p>Bonjour ${userName},</p>
              <p>Nous avons examiné votre candidature avec attention.</p>
              <p>Malheureusement, votre profil ne correspond pas à nos critères actuels de sélection.</p>
              <p>Nous vous encourageons à soumettre une nouvelle candidature à l'avenir si vous estimez que votre profil a évolué.</p>
              <p>Nous vous souhaitons bonne chance dans vos projets.</p>
              <p>Cordialement,<br>L'équipe StudioAvenue</p>
            </div>
            <div class="footer">
              <p>© 2024 StudioAvenue. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Send email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "StudioAvenue <onboarding@resend.dev>",
        to: [userEmail],
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Resend API error:", errorText);
      throw new Error("Failed to send email");
    }

    const emailResult = await resendResponse.json();
    console.log("Email sent successfully:", emailResult);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-model-approval-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
