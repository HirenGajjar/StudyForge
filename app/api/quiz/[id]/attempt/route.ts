import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await req.json()
  const { answers, score } = body

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({ quiz_id: id, answers, score, completed_at: new Date().toISOString() })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: 'Failed to save attempt' }, { status: 500 })
  return NextResponse.json({ attempt_id: data.id })
}
