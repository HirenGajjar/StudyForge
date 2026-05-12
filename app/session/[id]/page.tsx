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

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {session && (
        <div className="hidden">
          {/* Metadata available server-side */}
          <span data-university={session.university_name} />
          <span data-course={session.course_name} />
        </div>
      )}
      <GenerationViewer sessionId={id} />
    </div>
  )
}
