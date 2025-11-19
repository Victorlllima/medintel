/**
 * Format time in seconds to HH:MM:SS
 */
export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Convert audio blob to different format if needed
 */
export async function convertAudioFormat(
  blob: Blob,
  targetMimeType: string
): Promise<Blob> {
  // For now, just return the original blob
  // In a real implementation, you might use a library to convert formats
  return blob
}

/**
 * Get supported MIME types for audio recording
 */
export function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/wav'
  ]

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }

  return ''
}
