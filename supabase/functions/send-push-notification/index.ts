// Supabase Edge Function: send-push-notification
// Handles TWO ways of being triggered:
//   1. Sanity webhook (automatic) — fires when you publish a post/event/devotional
//   2. Manual test call — POST { "title": "...", "body": "..." }
//
// Deploy with: supabase functions deploy send-push-notification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleAuth } from "npm:google-auth-library@9";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const FIREBASE_SERVICE_ACCOUNT = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
const SANITY_WEBHOOK_SECRET = Deno.env.get("SANITY_WEBHOOK_SECRET");

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

// Build a friendly title/body from whatever Sanity sends us
function buildNotificationFromSanityPayload(payload: any) {
  const docType = payload._type || "";
  const name = payload.title || payload.name || "New content";
  const preview = payload.excerpt || payload.description || payload.summary || "";

  const typeLabels: Record<string, string> = {
    post: "New Article",
    article: "New Article",
    event: "New Event",
    devotional: "New Devotion",
    dailyDevotional: "New Devotion",
  };

  const label = typeLabels[docType] || "New Update";
  return {
    title: `${label}: ${name}`,
    body: preview ? preview.slice(0, 120) : "Open the Stay Alive app to check it out!",
  };
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const providedSecret = url.searchParams.get("secret");

    // Require the shared secret for ALL calls (both webhook and manual test)
    if (SANITY_WEBHOOK_SECRET && providedSecret !== SANITY_WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const payload = await req.json();

    let title: string;
    let body: string;

    if (payload._type) {
      // This looks like a Sanity webhook payload — build the message automatically
      const built = buildNotificationFromSanityPayload(payload);
      title = built.title;
      body = built.body;
    } else {
      // Manual/test call — expects { title, body } directly
      title = payload.title;
      body = payload.body;
    }

    if (!title || !body) {
      return new Response(JSON.stringify({ error: "Could not determine title/body" }), { status: 400 });
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
      JSON.stringify({ sent: successCount, failed: failCount, totalTokens: tokens.length, title, body }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});