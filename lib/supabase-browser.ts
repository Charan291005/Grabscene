"use client";

import { createClient } from "@/utils/supabase/client";

// Singleton browser-side Supabase client for auth operations
export const supabaseBrowser = createClient();
