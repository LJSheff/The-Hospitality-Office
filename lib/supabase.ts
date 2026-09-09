import { createClient } from "@supabase/supabase-js";

// Fallback values only prevent static build-time evaluation from failing.
// Vercel must provide the real values as environment variables at runtime.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder";
export const supabase = createClient(url, key);
