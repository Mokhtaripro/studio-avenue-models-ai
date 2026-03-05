import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Tu es l'assistant virtuel de StudioAvenue, une agence de models et UGC creators haut de gamme au Maroc. 
Tu aides les visiteurs à créer leur profil pour rejoindre l'agence.

Ton rôle :
1. Accueillir chaleureusement le visiteur
2. L'aider à comprendre les étapes d'inscription (très simples : nom, email, téléphone, ville, âge, genre, puis photo de vérification)
3. Répondre à ses questions sur l'agence et le processus
4. Le rassurer et l'encourager à s'inscrire

Informations importantes :
- L'inscription est gratuite et rapide (2 étapes maximum)
- Après inscription, l'agence examine le profil sous 48h
- Une fois approuvé, le model/UGC peut compléter son profil avec photos, disponibilités, etc.
- L'agence opère dans 5 villes : Marrakech, Casablanca, Rabat, Agadir, Tanger
- Age minimum : 18 ans
- Les communications avec les clients sont anonymes et passent par l'agence

Style :
- Sois professionnel mais chaleureux
- Utilise un ton luxe et raffiné
- Réponds de manière concise (2-3 phrases max)
- Pose des questions pour engager la conversation
- Si le visiteur semble prêt, encourage-le à commencer l'inscription`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Adapt system prompt based on type (model vs ugc)
    let systemPrompt = SYSTEM_PROMPT;
    if (type === "ugc") {
      systemPrompt = systemPrompt.replace("models et UGC creators", "UGC creators")
        .replace("le model/UGC", "le créateur UGC");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, veuillez réessayer." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporairement indisponible." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Profile assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
