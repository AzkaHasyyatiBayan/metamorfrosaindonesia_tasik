'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthProvider'

interface EnhancedFileUploadProps {
  eventId: string
  onUploadComplete: (url: string) => void
  accept?: string
  maxSize?: number
}

export default function EnhancedFileUpload({ 
  eventId, 
  onUploadComplete,
  accept = "image/*,video/*",
  maxSize = 10 
}: EnhancedFileUploadProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File terlalu besar. Maksimal ${maxSize}MB`
    }
    
    if (!accept.split(',').some(type => {
      const pattern = type.trim().replace('*', '.*')
      return new RegExp(pattern).test(file.type)
    })) {
      return 'Tipe file tidak didukung'
    }
    
    return null
  }

  const uploadFile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile || !user) return

    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)
    setError('')
    setProgress(0)

    try {
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${eventId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('galleries')
        .upload(filePath, selectedFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('galleries')
        .getPublicUrl(filePath)

      const { error: dbError } = await supabase
        .from('galleries')
        .insert({
          event_id: eventId,
          title: selectedFile.name,
          image_url: publicUrl,
          uploaded_by: user.id
        })

      if (dbError) throw dbError

      setSelectedFile(null)
      setProgress(100)
      onUploadComplete(publicUrl)
      
    } catch (error) {
      setError(`Upload gagal: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-600">Silakan login untuk upload dokumentasi</p>
      </div>
    )
  }

  return (
    <form onSubmit={uploadFile} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold">Upload Dokumentasi</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          File (maksimal {maxSize}MB)
        </label>
        <input
          type="file"
          onChange={(e) => {
            setSelectedFile(e.target.files?.[0] || null)
            setError('')
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          accept={accept}
        />
      </div>

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={uploading || !selectedFile}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
      >
        {uploading ? 'Uploading...' : 'Upload Dokumentasi'}
      </button>
    </form>
  )
}
