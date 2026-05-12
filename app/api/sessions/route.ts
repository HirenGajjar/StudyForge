import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { university_name, course_name, course_code, anon_token } = body

    if (!university_name || !course_name || !anon_token) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('sessions')
      .upsert(
        { university_name, course_name, course_code: course_code || null, anon_token },
        { onConflict: 'anon_token', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ session_id: data.id })
  } catch (err) {
    console.error('[POST /api/sessions]', err)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
