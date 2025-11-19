import { supabase } from './supabase'

export async function uploadAudio(
  audioBlob: Blob,
  userId: string,
  fileName: string
): Promise<{ publicUrl: string; error?: string }> {
  try {
    // Create file path with user ID folder
    const filePath = `${userId}/${Date.now()}-${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('consultations')
      .upload(filePath, audioBlob, {
        contentType: audioBlob.type,
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('consultations')
      .getPublicUrl(filePath)

    return {
      publicUrl: urlData.publicUrl
    }
  } catch (err: any) {
    console.error('Upload error:', err)
    return {
      publicUrl: '',
      error: err.message || 'Failed to upload audio'
    }
  }
}
