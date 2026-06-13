create table if not exists public.tournament_high_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text,
  display_name text,
  player_team_id text not null,
  player_team_name text not null,
  completed_rounds integer not null default 0 check (completed_rounds >= 0),
  opponent_team_ids text[] not null default '{}',
  opponent_team_names text[] not null default '{}',
  total_goals integer not null default 0 check (total_goals >= 0),
  total_saves integer not null default 0 check (total_saves >= 0),
  total_misses integer not null default 0 check (total_misses >= 0),
  total_shots integer not null default 0 check (total_shots >= 0),
  tournament_won boolean not null default false,
  final_round_result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists tournament_high_scores_leaderboard_idx
  on public.tournament_high_scores (
    total_goals desc,
    completed_rounds desc,
    total_shots asc,
    created_at asc
  );

create index if not exists tournament_high_scores_user_idx
  on public.tournament_high_scores (user_id, created_at desc);

alter table public.tournament_high_scores enable row level security;

drop policy if exists "Anyone can view tournament high scores"
  on public.tournament_high_scores;
create policy "Anyone can view tournament high scores"
  on public.tournament_high_scores
  for select
  using (true);

drop policy if exists "Authenticated users can insert their own tournament scores"
  on public.tournament_high_scores;
create policy "Authenticated users can insert their own tournament scores"
  on public.tournament_high_scores
  for insert
  to authenticated
  with check (auth.uid() = user_id);
