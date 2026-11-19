
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://honvalvhndzulxsdhrmq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_L6QDxVSRYquB_8ip6rrx8g_NIBDViUt";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
