-- Row Level Security policies

alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.uploads enable row level security;
alter table public.document_chunks enable row level security;
alter table public.web_search_results enable row level security;
alter table public.generated_notes enable row level security;
alter table public.expected_questions enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;

-- users: own row only
create policy "users_own" on public.users
  for all using (auth.uid() = id);

-- sessions: owner or anon token match (anon check done server-side via service role)
create policy "sessions_owner" on public.sessions
  for all using (
    auth.uid() = user_id
    or user_id is null  -- anonymous sessions readable via service role
  );

-- uploads/chunks/notes/questions/quizzes: accessible if session is accessible
create policy "uploads_session" on public.uploads
  for all using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id
        and (s.user_id = auth.uid() or s.user_id is null)
    )
  );

create policy "chunks_session" on public.document_chunks
  for all using (
    exists (
      select 1 from public.uploads u
      join public.sessions s on s.id = u.session_id
      where u.id = upload_id
        and (s.user_id = auth.uid() or s.user_id is null)
    )
  );

create policy "search_results_session" on public.web_search_results
  for all using (
    exists (
      select 1 from public.sessions s where s.id = session_id
        and (s.user_id = auth.uid() or s.user_id is null)
    )
  );

create policy "notes_session" on public.generated_notes
  for all using (
    exists (
      select 1 from public.sessions s where s.id = session_id
        and (s.user_id = auth.uid() or s.user_id is null)
    )
  );

create policy "questions_session" on public.expected_questions
  for all using (
    exists (
      select 1 from public.sessions s where s.id = session_id
        and (s.user_id = auth.uid() or s.user_id is null)
    )
  );

create policy "quizzes_session" on public.quizzes
  for all using (
    exists (
      select 1 from public.sessions s where s.id = session_id
        and (s.user_id = auth.uid() or s.user_id is null)
    )
  );

create policy "quiz_questions_quiz" on public.quiz_questions
  for all using (
    exists (
      select 1 from public.quizzes q
      join public.sessions s on s.id = q.session_id
      where q.id = quiz_id
        and (s.user_id = auth.uid() or s.user_id is null)
    )
  );

create policy "attempts_owner" on public.quiz_attempts
  for all using (user_id = auth.uid() or user_id is null);
