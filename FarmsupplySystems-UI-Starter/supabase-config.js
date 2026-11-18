import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://honvalvhndzulxsdhrmq.supabase.co/rest/v1/";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbnZhbHZobmR6dWx4c2Rocm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0NDc4NDMsImV4cCI6MjExMDAyMzg0M30.oWUe18Mevs5SSS9YAWDK2AqjXsWYwmCyExzlPIlL0-g";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
