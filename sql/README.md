# Supabase Setup

1. Open your Supabase project dashboard.
2. Go to **SQL Editor**.
3. Run `sql/001_create_tournament_high_scores.sql`.
4. Go to **Authentication > Providers > Email** and enable email/password auth.
5. Decide whether new users must confirm email before signing in:
   - Confirm email on: sign-up shows a message asking the user to confirm email.
   - Confirm email off: sign-up signs the user in immediately.
6. Copy your project values from **Project Settings > API**.
7. Create a local `.env` file from `.env.example`:

```text
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

8. Restart Expo after editing `.env`.

The app uses Supabase Auth users for login and writes authenticated tournament attempts to `public.tournament_high_scores`. Anonymous tournament runs still work, but they are not recorded.
