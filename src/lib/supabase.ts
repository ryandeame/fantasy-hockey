import { createClient, Session, User } from '@supabase/supabase-js';

export type TournamentHighScore = {
  id: string;
  user_id: string;
  user_email: string | null;
  display_name: string | null;
  player_team_id: string;
  player_team_name: string;
  completed_rounds: number;
  opponent_team_ids: string[];
  opponent_team_names: string[];
  total_goals: number;
  total_saves: number;
  total_misses: number;
  total_shots: number;
  tournament_won: boolean;
  final_round_result: Record<string, unknown>;
  created_at: string;
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    })
  : null;

export type SupabaseSession = Session;
export type SupabaseUser = User;
