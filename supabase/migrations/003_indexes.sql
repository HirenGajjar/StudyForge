-- Indexes for query performance

create index if not exists idx_sessions_user_id       on public.sessions(user_id);
create index if not exists idx_sessions_anon_token    on public.sessions(anon_token);
create index if not exists idx_uploads_session_id     on public.uploads(session_id);
create index if not exists idx_chunks_upload_id       on public.document_chunks(upload_id);
create index if not exists idx_search_session_id      on public.web_search_results(session_id);
create index if not exists idx_notes_session_id       on public.generated_notes(session_id);
create index if not exists idx_questions_session_id   on public.expected_questions(session_id);
create index if not exists idx_quizzes_session_id     on public.quizzes(session_id);
create index if not exists idx_quiz_questions_quiz_id on public.quiz_questions(quiz_id);
create index if not exists idx_attempts_quiz_id       on public.quiz_attempts(quiz_id);
create index if not exists idx_attempts_user_id       on public.quiz_attempts(user_id);
