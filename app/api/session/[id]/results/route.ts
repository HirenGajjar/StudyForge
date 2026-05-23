import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = createServiceClient()

  const [notesRes, questionsRes, quizRes] = await Promise.all([
    supabase
      .from('generated_notes')
      .select('sections, summary, key_concepts')
      .eq('session_id', id)
      .single(),
    supabase
      .from('expected_questions')
      .select('question_text, question_type, topic_tag, difficulty, model_answer')
      .eq('session_id', id),
    supabase
      .from('quizzes')
      .select('title, quiz_questions(*)')
      .eq('session_id', id)
      .single(),
  ])

  const sections = notesRes.data?.sections ?? []

  const expectedQuestions = (questionsRes.data ?? []).map((q) => ({
    question: q.question_text,
    type: q.question_type,
    topic: q.topic_tag,
    difficulty: q.difficulty,
    model_answer: q.model_answer,
  }))

  const quizTitle = quizRes.data?.title ?? 'Quiz'
  const quiz = ((quizRes.data?.quiz_questions as unknown as Array<{
    question_type: string
    question_text: string
    options: string[] | null
    correct_answer: string
    explanation: string
    topic_tag: string
  }>) ?? []).map((q) => ({
    type: q.question_type,
    question: q.question_text,
    options: q.options ?? [],
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    topic: q.topic_tag,
  }))

  return NextResponse.json({ sections, expectedQuestions, quizTitle, quiz })
}
