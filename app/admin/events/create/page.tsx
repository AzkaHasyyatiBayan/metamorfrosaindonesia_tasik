'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase' 
import { useAuth } from '../../../components/AuthProvider' 
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

// --- TIPE DATA ---
type AccessibilityCategory = 'SIGN_LANGUAGE' | 'WHEELCHAIR_ACCESS' | 'BRAILLE' | 'AUDIO_DESCRIPTION' | 'TACTILE'

// --- ICON COMPONENTS ---
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const LocationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
)

const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const DescriptionIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
  </svg>
)

const TitleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

// Accessibility Icons
const SignLanguageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
  </svg>
)

const WheelchairIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
)

const BrailleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h.01M4 12h.01M4 18h.01M12 6h.01M12 12h.01M12 18h.01M20 6h.01M20 12h.01M20 18h.01" />
  </svg>
)

const AudioIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>
)

const TactileIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
  </svg>
)

const EventImageIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const PreviewImage = ({ imageUrl, title }: { imageUrl?: string; title: string }) => {
  if (!imageUrl) {
    return (
      <div 
        className="aspect-video rounded-xl flex items-center justify-center text-white"
        style={{
          background: 'linear-gradient(135deg, #EF4444, #DC2626)'
        }}
      >
        <EventImageIcon />
      </div>
    )
  }

  return (
    <div className="aspect-video relative rounded-xl overflow-hidden bg-gray-100">
      <Image
        src={imageUrl}
        alt={`Preview: ${title}`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        unoptimized 
      />
    </div>
  )
}

export default function CreateEvent() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [location, setLocation] = useState('')
  const [categories, setCategories] = useState<AccessibilityCategory[]>([])
  const [maxParticipants, setMaxParticipants] = useState('')
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [existingImageUrl, setExistingImageUrl] = useState('') 
  
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [message, setMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const id = searchParams?.get('id')
    if (!id) return

    let mounted = true
    const load = async () => {
      try {
        console.log('Fetching event data for edit...')
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('Fetch event error:', error)
          setMessage('Gagal memuat data event untuk diedit')
          return
        }

        if (!mounted) return

        setIsEditing(true)
        setEditingId(id)
        setTitle(data.title || '')
        setDescription(data.description || '')
        setDateTime(data.date_time ? new Date(data.date_time).toISOString().slice(0, 16) : '')
        setLocation(data.location || '')
        setCategories(data.category || [])
        setMaxParticipants(data.max_participants ? String(data.max_participants) : '')
        
        if (data.image_url) {
          setExistingImageUrl(data.image_url)
          setPreviewUrl(data.image_url)
        }
      } catch (err) {
        console.error('Error loading event for edit', err)
        setMessage('Gagal memuat data event untuk diedit (cek koneksi)')
      }
    }

    load()
    return () => { mounted = false }
  }, [searchParams])

  const toggleCategory = (category: AccessibilityCategory) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        alert("Ukuran gambar maksimal 2MB")
        return
      }
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const validateForm = () => {
    if (!title.trim()) {
      alert('Judul event harus diisi')
      return false
    }
    if (!description.trim()) {
      alert('Deskripsi event harus diisi')
      return false
    }
    if (!dateTime) {
      alert('Tanggal dan waktu harus diisi')
      return false
    }
    if (!location.trim()) {
      alert('Lokasi event harus diisi')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('Sesi Anda telah berakhir. Silakan login kembali.')
      return
    }

    if (!isAdmin) {
      setMessage('Unauthorized access - Hanya admin yang dapat membuat event')
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setMessage('')
    setLoadingText('Memproses...')

    try {
      let finalImageUrl = existingImageUrl

      if (imageFile) {
        setLoadingText('Mengupload gambar...')
        console.log('Mulai proses upload gambar...')
        
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `event-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`
        const filePath = `events/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('events')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload Error Details:', uploadError)
          throw new Error(`Gagal upload gambar: ${uploadError.message}`)
        }

        const { data: publicUrlData } = supabase.storage
          .from('events')
          .getPublicUrl(filePath)
          
        finalImageUrl = publicUrlData.publicUrl
        console.log('Upload berhasil, URL:', finalImageUrl)
      }

      setLoadingText('Menyimpan data event...')
      console.log('Menyimpan ke database...')

      const eventData = {
        title: title.trim(),
        description: description.trim(),
        date_time: new Date(dateTime).toISOString(),
        location: location.trim(),
        category: categories,
        max_participants: maxParticipants ? parseInt(maxParticipants) : null,
        image_url: finalImageUrl || null,
        creator_id: user.id
      }

      let error
      
      if (isEditing && editingId) {
        const { error: updateError } = await supabase
          .from('events')
          .update({
            ...eventData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)
          
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('events')
          .insert([eventData])
          
        error = insertError
      }

      if (error) {
        console.error('Database Insert Error:', error)
        throw error
      }

      console.log('Data berhasil disimpan!')
      setMessage('Event berhasil disimpan! Mengalihkan...')
      
      setTimeout(() => {
        router.refresh()
        router.push('/admin/events')
      }, 1500)
      
    } catch (error: unknown) { // FIX: Menggunakan unknown, bukan any
      console.error('Error in saving process:', error)
      
      let errorMsg = 'Terjadi kesalahan saat menyimpan event'
      
      if (error instanceof Error) {
        errorMsg = error.message
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        // Safe access to .message property
        errorMsg = (error as { message: string }).message
      }
      
      setMessage(`Gagal: ${errorMsg}`)
      alert(errorMsg) 
    } finally {
      if (!message.includes('berhasil')) {
        setLoading(false)
        setLoadingText('')
      }
    }
  }

  const getCategoryIcon = (category: AccessibilityCategory) => {
    switch (category) {
      case 'SIGN_LANGUAGE': return <SignLanguageIcon />
      case 'WHEELCHAIR_ACCESS': return <WheelchairIcon />
      case 'BRAILLE': return <BrailleIcon />
      case 'AUDIO_DESCRIPTION': return <AudioIcon />
      case 'TACTILE': return <TactileIcon />
      default: return null
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-500 font-medium">Memverifikasi akses...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4 border border-gray-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Akses Ditolak</h2>
          <p className="text-gray-500 mb-6 leading-relaxed">Anda tidak memiliki akses ke halaman ini. Silakan login sebagai administrator.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            >
              <ArrowLeftIcon />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {isEditing ? 'Edit Event' : 'Buat Event Baru'}
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Isi detail di bawah untuk {isEditing ? 'memperbarui' : 'mempublikasikan'} kegiatan komunitas.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form Column */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-8">
              
              {/* Basic Info Section */}
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Informasi Utama</h3>
                  <p className="text-sm text-gray-500">Detail dasar mengenai acara Anda.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Event *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <TitleIcon />
                      </div>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        placeholder="Contoh: Workshop Bahasa Isyarat Dasar"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi *</label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                        <DescriptionIcon />
                      </div>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={5}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                        placeholder="Jelaskan detail agenda, tujuan, dan siapa yang sebaiknya hadir..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Location Section */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal & Waktu *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <CalendarIcon />
                      </div>
                      <input
                        type="datetime-local"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <LocationIcon />
                      </div>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        placeholder="Nama Gedung / Link Zoom"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Accessibility & Capacity */}
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-4 pt-4">
                  <h3 className="text-lg font-bold text-gray-900">Detail & Aksesibilitas</h3>
                  <p className="text-sm text-gray-500">Kapasitas dan fitur inklusifitas event.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Fitur Aksesibilitas</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(['SIGN_LANGUAGE', 'WHEELCHAIR_ACCESS', 'BRAILLE', 'AUDIO_DESCRIPTION', 'TACTILE'] as AccessibilityCategory[]).map((category) => (
                      <label 
                        key={category} 
                        className={`
                          flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none
                          ${categories.includes(category)
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-100 bg-white text-gray-600 hover:border-red-200'
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={categories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="w-4 h-4 text-red-600 rounded focus:ring-red-500 border-gray-300 mr-3 accent-red-600"
                        />
                        <span className="mr-2 text-current">{getCategoryIcon(category)}</span>
                        <span className="text-sm font-medium">{category.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Maksimal Peserta</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <UsersIcon />
                      </div>
                      <input
                        type="number"
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(e.target.value)}
                        min="1"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        placeholder="Tidak terbatas"
                      />
                    </div>
                  </div>

                  {/* UPLOAD GAMBAR */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Banner</label>
                    <div className="relative">
                       <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden" // Sembunyikan input asli
                      />
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 border-dashed rounded-xl cursor-pointer hover:bg-gray-100 hover:border-red-300 transition-all"
                      >
                        <div className="flex items-center gap-3 text-gray-500">
                            <ImageIcon />
                            <span className="text-sm truncate">
                              {imageFile ? imageFile.name : (isEditing && existingImageUrl ? "Ganti Gambar (Opsional)" : "Pilih Gambar...")}
                            </span>
                        </div>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">Browse</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 ml-1">Max 2MB. Format: JPG, PNG</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.01] shadow-lg hover:shadow-red-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>{loadingText || 'Menyimpan...'}</span>
                    </>
                  ) : (
                    <span>{isEditing ? 'Simpan Perubahan' : 'Buat Event Sekarang'}</span>
                  )}
                </button>
                
                {message && (
                  <div className={`mt-4 p-4 rounded-xl text-center text-sm font-medium animate-fade-in ${
                    message.toLowerCase().includes('berhasil') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Preview Kartu Event</h3>
                  <p className="text-xs text-gray-500">Tampilan event di halaman user</p>
                </div>
                
                <div className="p-4">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden pointer-events-none select-none">
                    <div className="relative h-48 w-full bg-gray-100">
                      {/* Tampilkan Preview */}
                      <PreviewImage imageUrl={previewUrl} title={title} />
                      <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-green-700 shadow-sm">
                        ACTIVE
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-bold text-gray-900 mb-2 line-clamp-1">
                        {title || 'Judul Event Anda'}
                      </h4>
                      
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="text-red-500 mr-2"><CalendarIcon /></span>
                          <span>
                            {dateTime ? new Date(dateTime).toLocaleDateString('id-ID', { 
                              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                            }) : 'Hari, DD Bulan YYYY'}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="text-red-500 mr-2"><LocationIcon /></span>
                          <span className="truncate">{location || 'Lokasi Event'}</span>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <div className="p-1 bg-gray-100 rounded-full text-gray-500">
                            <UsersIcon />
                          </div>
                          <span className="text-xs font-semibold text-gray-700">0</span>
                          <span className="text-[10px] text-gray-400 uppercase">Peserta</span>
                        </div>
                        <div className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg">
                          Detail
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h4 className="font-semibold text-blue-800 text-sm mb-1">Tips Admin</h4>
                <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
                  <li>Gunakan gambar rasio 16:9 untuk hasil terbaik.</li>
                  <li>Deskripsi yang jelas meningkatkan partisipasi.</li>
                  <li>Pastikan link lokasi (Zoom/Maps) valid.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}