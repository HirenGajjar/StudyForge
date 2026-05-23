import { createServiceClient } from '@/lib/supabase/server'
import GenerationViewer from '@/components/session/GenerationViewer'

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: session } = await supabase
    .from('sessions')
    .select('university_name, course_name, course_code, status')
    .eq('id', id)
    .single()

  // If stuck in 'generating' (previous run died), reset so client re-triggers generation
  const status = session?.status ?? 'pending'
  if (status === 'generating') {
    await supabase
      .from('sessions')
      .update({ status: 'pending', updated_at: new Date().toISOString() })
      .eq('id', id)
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <GenerationViewer sessionId={id} initialStatus={status === 'generating' ? 'pending' : status} />
    </div>
  )
}
