// Supabase Edge Function: send-push-notification
// Uses Firebase Cloud Messaging HTTP v1 API (the current one, not the deprecated legacy key)
//
// Deploy with: supabase functions deploy send-push-notification
// Call it with a POST body like:
// { "title": "New Devotion Posted", "body": "Check out today's word!" }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleAuth } from "npm:google-auth-library@9";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
// The full contents of your Firebase service account JSON file, as a single-line string secret
const FIREBASE_SERVICE_ACCOUNT = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");

async function getAccessToken() {
  const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT);
  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return { token: tokenResponse.token, projectId: serviceAccount.project_id };
}

serve(async (req) => {
  try {
    const { title, body } = await req.json();
    if (!title || !body) {
      return new Response(JSON.stringify({ error: "title and body required" }), { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("push_token")
      .not("push_token", "is", null);

    if (error) throw error;

    const tokens = [...new Set(profiles.map((p) => p.push_token).filter(Boolean))];
    if (tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No device tokens found" }));
    }

    const { token: accessToken, projectId } = await getAccessToken();

    let successCount = 0;
    let failCount = 0;

    for (const deviceToken of tokens) {
      const res = await fetch(
        `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            message: {
              token: deviceToken,
              notification: { title, body },
            },
          }),
        }
      );
      if (res.ok) successCount++;
      else failCount++;
    }

    return new Response(
      JSON.stringify({ sent: successCount, failed: failCount, totalTokens: tokens.length }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});