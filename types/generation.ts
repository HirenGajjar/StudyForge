export interface Metadata {
  subject: string
  topic: string
  difficulty_level: string
  detected_exam_focus: string[]
  retrieval_sources_used: string[]
  high_weightage_topics: string[]
  estimated_bloom_levels: string[]
  confidence_score: number
}

export interface KeyConcept {
  term: string
  definition: string
  importance: string
  common_confusion: string
}

export interface NoteSection {
  title: string
  content: string
  important_points: string[]
  examples: string[]
  real_world_applications: string[]
  common_mistakes: string[]
  exam_tips: string[]
  memory_tricks: string[]
}

export interface RevisionSheet {
  formulae: string[]
  definitions: string[]
  one_liners: string[]
  mnemonics: string[]
  last_minute_revision: string[]
}

export interface GeneratedNotes {
  title: string
  summary: string
  learning_objectives: string[]
  key_concepts: KeyConcept[]
  sections: NoteSection[]
  revision_sheet: RevisionSheet
}

export interface ExpectedQuestion {
  question: string
  type: 'theory' | 'numerical' | 'conceptual' | 'application' | 'case_study'
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  probability: number
  marks_weightage: string
  reasoning: string
  answer_strategy: string
  model_answer: string
  key_points: string[]
}

export interface QuizQuestion {
  question: string
  type: 'mcq' | 'short_answer' | 'true_false' | 'assertion_reason' | 'fill_blank'
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  cognitive_level: 'remember' | 'understand' | 'apply' | 'analyze'
  options?: string[]
  correct_answer: string
  explanation: string
  source_inference: string
}

export interface GenerationOutput {
  metadata: Metadata
  notes: GeneratedNotes
  expected_questions: ExpectedQuestion[]
  quiz: QuizQuestion[]
}

export type SSEEvent =
  | { type: 'status'; message: string }
  | { type: 'content'; delta: string }
  | { type: 'complete'; sessionId: string }
  | { type: 'error'; message: string }
