import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tcytmupogtzqhxlydicl.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeXRtdXBvZ3R6cWh4bHlkaWNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MTE5NDMsImV4cCI6MjA5MjI4Nzk0M30.DF3hAN0qKzvbtjODH_M8yrhTZizkTGQyGZU3lqfmtGU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});
