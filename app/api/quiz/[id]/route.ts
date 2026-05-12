import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: quiz, error } = await supabase
    .from('quizzes')
    .select('*, quiz_questions(*)')
    .eq('session_id', id)
    .single()

  if (error) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  return NextResponse.json(quiz)
}
