export type SessionStatus =
  | 'pending'
  | 'parsing'
  | 'searching'
  | 'generating'
  | 'complete'
  | 'error'

export interface Session {
  id: string
  user_id: string | null
  anon_token: string
  university_name: string
  course_name: string
  course_code: string | null
  status: SessionStatus
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface Upload {
  id: string
  session_id: string
  file_name: string
  file_type: 'pdf' | 'pptx' | 'ppt' | 'docx'
  file_size_bytes: number
  storage_path: string
  parse_status: 'pending' | 'parsed' | 'failed'
  page_count: number | null
  created_at: string
}

export interface DocumentChunk {
  id: string
  upload_id: string
  chunk_index: number
  chunk_type: 'page' | 'slide'
  content: string
  char_count: number
  metadata: {
    title?: string
    has_image?: boolean
    is_past_paper?: boolean
    word_count?: number
  }
  created_at: string
}
