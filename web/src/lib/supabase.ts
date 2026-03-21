import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Task = {
  id: string;
  project_id: string | null;
  title: string;
  description: string;
  category: string;
  status: "Open" | "In Progress" | "Resolved";
  context: Record<string, unknown>;
  resolution: string | null;
  created_at: string;
  updated_at: string;
};

export type Source = {
  id: string;
  project_id: string | null;
  source_type: "github_repo" | "documentation" | "suggestion";
  name: string;
  content: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};
