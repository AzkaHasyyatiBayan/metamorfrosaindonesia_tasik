'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthProvider'

interface FileUploadProps {
  eventId?: string
  onUploadComplete: (url: string) => void
  maxSize?: number
}

export default function FileUpload({ 
  eventId, 
  onUploadComplete,
  maxSize = 5
}: FileUploadProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File terlalu besar. Maksimal ${maxSize}MB`
    }
    
    if (!file.type.startsWith('image/')) {
      return 'Hanya file gambar (JPG, PNG, WEBP, dll) yang diperbolehkan.'
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
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const folderName = eventId ? eventId : 'general'
      const filePath = `${folderName}/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('galleries')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Storage Error: ${uploadError.message}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('galleries')
        .getPublicUrl(filePath)

      const dbData: any = {
        title: selectedFile.name,
        file_url: publicUrl,
        file_type: 'image',
        file_name: selectedFile.name,
        uploaded_by: user.id
      }

      if (eventId) {
        dbData.event_id = eventId
      }

      const { error: dbError } = await supabase
        .from('media')
        .insert(dbData)

      if (dbError) {
         throw new Error(`Database Error: ${JSON.stringify(dbError)}`)
      }

      setSelectedFile(null)
      setProgress(100)
      onUploadComplete(publicUrl)
      
    } catch (error: any) {
      console.error('Upload Failed Details:', error)
      setError(`Upload gagal: ${error.message || 'Unknown error occurred'}`)
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-100">
        <p className="text-gray-600">Silakan login untuk upload dokumentasi</p>
      </div>
    )
  }

  return (
    <form onSubmit={uploadFile} className="space-y-4 bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800">Upload Foto</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pilih Foto (Max {maxSize}MB)
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors">
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="flex text-sm text-gray-600 justify-center">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                <span>Pilih file gambar</span>
                <input 
                  id="file-upload" 
                  name="file-upload" 
                  type="file" 
                  className="sr-only" 
                  onChange={(e) => {
                    setSelectedFile(e.target.files?.[0] || null)
                    setError('')
                  }} 
                  accept="image/*" 
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">
              {selectedFile ? selectedFile.name : 'PNG, JPG, WEBP up to 5MB'}
            </p>
          </div>
        </div>
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={uploading || !selectedFile}
        className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-medium shadow-sm flex justify-center items-center"
      >
        {uploading ? 'Mengunggah...' : 'Upload Foto'}
      </button>
    </form>
  )
}