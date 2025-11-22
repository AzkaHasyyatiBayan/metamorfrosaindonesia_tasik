'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthProvider'

interface FileUploadProps {
  eventId: string
  onUploadComplete: () => void
}

export default function FileUpload({ eventId, onUploadComplete }: FileUploadProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile || !user) return

    try {
      setUploading(true)
      setError(null)

      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
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
      onUploadComplete()
      
    } catch (error) {
      console.error('Upload error:', error)
      setError('Gagal mengupload file. Silakan coba lagi.')
    } finally {
      setUploading(false)
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
        <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          accept="image/*,video/*"
        />
      </div>

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