import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  try {
    const appInfo = await req.json();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: latest, error } = await supabase
      .from("app_updates")
      .select("version, url, checksum")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !latest) {
      return new Response(JSON.stringify({ version: appInfo.version_name || "1.0.0" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const currentVersion = appInfo.version_name;

    if (currentVersion === latest.version) {
      return new Response(JSON.stringify({ version: latest.version }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        version: latest.version,
        url: latest.url,
        checksum: latest.checksum,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ message: "Error checking for update", error: err.message }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
});