import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { detectFileType } from '@/lib/parsers'

const MAX_SIZE = 50 * 1024 * 1024 // 50 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const sessionId = formData.get('session_id') as string
    const isPastPaper = formData.get('is_past_paper') === 'true'

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 })
    }

    const files = formData.getAll('files') as File[]
    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Validate all files first before doing any async work
    for (const file of files) {
      if (!detectFileType(file.name)) {
        return NextResponse.json({ error: `Unsupported file type: ${file.name}` }, { status: 400 })
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `File too large: ${file.name} (max 50MB)` }, { status: 400 })
      }
    }

    // Process all files in parallel
    const uploadIds = await Promise.all(files.map(async (file) => {
      const fileType = detectFileType(file.name)!

      const { data: uploadRow, error: insertErr } = await supabase
        .from('uploads')
        .insert({
          session_id: sessionId,
          file_name: file.name,
          file_type: fileType,
          file_size_bytes: file.size,
          storage_path: 'pending',
          parse_status: 'pending',
        })
        .select('id')
        .single()

      if (insertErr) throw insertErr

      const storagePath = `${sessionId}/${uploadRow.id}/${file.name}`
      const arrayBuffer = await file.arrayBuffer()

      const { error: storageErr } = await supabase.storage
        .from('uploads')
        .upload(storagePath, arrayBuffer, { contentType: file.type, upsert: false })

      if (storageErr) throw storageErr

      await supabase.from('uploads').update({ storage_path: storagePath }).eq('id', uploadRow.id)

      await parseUpload(supabase, uploadRow.id, storagePath, fileType, isPastPaper)

      return uploadRow.id
    }))

    return NextResponse.json({ upload_ids: uploadIds })
  } catch (err) {
    console.error('[POST /api/upload]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

async function parseUpload(
  supabase: ReturnType<typeof createServiceClient>,
  uploadId: string,
  storagePath: string,
  fileType: string,
  isPastPaper: boolean,
) {
  try {
    const { data: fileData, error: downloadErr } = await supabase.storage
      .from('uploads')
      .download(storagePath)

    if (downloadErr) throw downloadErr

    const buffer = Buffer.from(await fileData.arrayBuffer())
    const { parseFile } = await import('@/lib/parsers')
    const chunks = await parseFile(
      buffer,
      fileType as 'pdf' | 'pptx' | 'ppt' | 'docx',
      isPastPaper,
    )

    if (chunks.length > 0) {
      await supabase.from('document_chunks').insert(
        chunks.map((c) => ({
          upload_id: uploadId,
          chunk_index: c.chunkIndex,
          chunk_type: c.chunkType,
          content: c.content,
          metadata: c.metadata,
        })),
      )
    }

    await supabase
      .from('uploads')
      .update({ parse_status: 'parsed', page_count: chunks.length })
      .eq('id', uploadId)
  } catch (err) {
    console.error('[parseUpload]', err)
    await supabase
      .from('uploads')
      .update({ parse_status: 'failed' })
      .eq('id', uploadId)
  }
}
