# StudyForge — Session Changelog (2026-05-12)

## Summary
This document records all changes made during the setup and configuration session.

---

## 1. Database & Infrastructure

### Supabase
- Connected to Supabase project `xhhbsrsnzwjkulmiiasc`
- Confirmed all tables exist: `sessions`, `uploads`, `document_chunks`, `generated_notes`, `expected_questions`, `quizzes`, `quiz_questions`, `quiz_attempts`, `web_search_results`, `users`
- Created private storage bucket `uploads`

---

## 2. Bug Fixes

### `app/api/sessions/route.ts`
- Changed `.insert()` to `.upsert({ onConflict: 'anon_token' })` to handle duplicate anonymous session tokens without 500 errors

### `app/api/quiz/[id]/route.ts`
- Fixed quiz lookup: changed `.eq('id', id)` → `.eq('session_id', id)` so the quiz page (which uses session ID in the URL) resolves correctly

### `lib/ai/provider.ts`
- Added `400` to the Claude fallback trigger conditions (credit errors now fall through to next provider)

### `lib/ai/response-parser.ts`
- Added stripping of `<think>...</think>` blocks (reasoning models like Qwen output these before JSON)
- Added fallback JSON extraction via regex if there is surrounding text
- Added markdown fence stripping

---

## 3. AI Provider Changes

### Added Gemini support — `lib/ai/gemini.ts` (new file)
- Uses `@google/genai` SDK
- Model: `gemini-2.0-flash`

### Added Ollama support — `lib/ai/ollama.ts` (new file)
- Calls local Ollama at `http://localhost:11434/api/chat`
- Supports primary + fallback model via `OLLAMA_MODEL` and `OLLAMA_FALLBACK_MODEL` env vars
- Primary: `qwen3:30b`, Fallback: `qwen2.5:14b`

### Updated `lib/ai/provider.ts`
- New provider priority order:
  1. **Ollama** (local, primary — free, no quota)
  2. **Gemini** (if `GEMINI_API_KEY` set)
  3. **Claude** (Anthropic)
  4. **OpenAI** (final fallback)

### Installed `@google/genai` SDK
```
pnpm add @google/genai
```

---

## 4. Environment Variables

### Added to `.env.local` and `lib/env.ts`
| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key |
| `OLLAMA_MODEL` | Primary local model (default: `qwen3:30b`) |
| `OLLAMA_FALLBACK_MODEL` | Fallback local model (default: `qwen2.5:14b`) |
| `ANTHROPIC_API_KEY` | Changed from required to optional |

---

## 5. Prompt Overhaul — `lib/ai/prompts.ts`

Complete rewrite of the system prompt. New prompt includes:

- Role definition as elite AI academic system
- Retrieval & web search prioritization rules
- Anti-hallucination guidelines
- Confidence scoring
- Bloom's taxonomy cognitive levels
- PYQ (previous year question) pattern analysis
- New `metadata` output block

### New output schema
```json
{
  "metadata": {
    "subject", "topic", "difficulty_level",
    "detected_exam_focus", "retrieval_sources_used",
    "high_weightage_topics", "estimated_bloom_levels",
    "confidence_score"
  },
  "notes": {
    "title", "summary", "learning_objectives",
    "key_concepts": [{ "term", "definition", "importance", "common_confusion" }],
    "sections": [{
      "title", "content", "important_points", "examples",
      "real_world_applications", "common_mistakes", "exam_tips", "memory_tricks"
    }],
    "revision_sheet": {
      "formulae", "definitions", "one_liners", "mnemonics", "last_minute_revision"
    }
  },
  "expected_questions": [{
    "question", "type", "difficulty", "topic",
    "probability", "marks_weightage", "reasoning",
    "answer_strategy", "model_answer", "key_points"
  }],
  "quiz": [{
    "question", "type", "difficulty", "topic",
    "cognitive_level", "options", "correct_answer",
    "explanation", "source_inference"
  }]
}
```

---

## 6. Type System — `types/generation.ts`

Updated all TypeScript interfaces to match new prompt schema:
- Added `Metadata` interface
- Added `common_confusion` to `KeyConcept`
- Added `real_world_applications`, `memory_tricks` to `NoteSection`
- Added `definitions`, `last_minute_revision` to `RevisionSheet`
- Added `probability`, `reasoning` to `ExpectedQuestion`
- Added `cognitive_level`, `source_inference` to `QuizQuestion`
- `quiz` changed from `{ title, questions[] }` object to flat `QuizQuestion[]` array

---

## 7. Frontend — `components/session/GenerationViewer.tsx`

- Updated `NotesTab` to use new section shape (removed `s.id`, `s.subsections`)
- Added exam tips panel per section (orange callout box)
- Updated sidebar TOC to use index-based keys instead of `s.id`
- Fixed `QuestionsTab` to use `q.question` instead of `q.question_text`
- Fixed quiz store call: `setQuiz('Quiz', parsed.quiz)` for flat array

---

## 8. Upload Limits — `app/create/page.tsx`

- Increased max files per dropzone from **5 → 20**

---

## 9. DB Insert Mapping — `app/api/generate/route.ts`

- Updated `expected_questions` insert to map new field names (`question` → `question_text`, `type` → `type`, `topic` → `topic_tag`)
- Updated `quizzes` insert: title now uses `${course_name} Quiz` (flat array, no title field)
- Updated `quiz_questions` insert to map new field names
- Updated `model_used` to reflect actual model from env var

---

## 10. File Upload — `app/api/upload/route.ts`

- Storage bucket reference confirmed as `uploads` (plural)

---

## Files Created
- `lib/ai/gemini.ts` — Gemini provider
- `lib/ai/ollama.ts` — Ollama local provider
- `CHANGES.md` — this file

## Files Modified
- `lib/ai/provider.ts`
- `lib/ai/prompts.ts`
- `lib/ai/response-parser.ts`
- `lib/env.ts`
- `types/generation.ts`
- `components/session/GenerationViewer.tsx`
- `app/api/sessions/route.ts`
- `app/api/quiz/[id]/route.ts`
- `app/api/generate/route.ts`
- `app/create/page.tsx`
- `.env.local`
- `package.json` / `pnpm-lock.yaml`
