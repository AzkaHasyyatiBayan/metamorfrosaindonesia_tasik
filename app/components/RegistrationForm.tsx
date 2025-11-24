'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'

type RegistrationType = 'PARTICIPANT' | 'VOLUNTEER'

interface RegistrationFormProps {
  eventId: string
}

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const VolunteerIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const NotesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

export default function RegistrationForm({ eventId }: RegistrationFormProps) {
  const { user } = useAuth()
  const [type, setType] = useState<RegistrationType>('PARTICIPANT')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('registrations')
        .insert([
          {
            event_id: eventId,
            user_id: user.id,
            type: type,
            notes: notes,
            status: 'PENDING'
          }
        ])

      if (error) throw error

      setMessage(`Pendaftaran sebagai ${type === 'PARTICIPANT' ? 'Peserta' : 'Relawan'} berhasil! Tunggu konfirmasi admin.`)
      setNotes('')
      
    } catch (error) {
      setMessage(`Terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserIcon />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Login Diperlukan</h3>
        <p className="text-gray-600 mb-6">Silakan login untuk mendaftar event ini</p>
        <button 
          onClick={() => router.push('/auth/login')}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105"
        >
          Login Sekarang
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Daftar Event</h3>
        <p className="text-gray-600">Isi form berikut untuk mendaftar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Registration Type */}
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-4">
            Saya ingin mendaftar sebagai:
          </label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <button
              type="button"
              onClick={() => setType('PARTICIPANT')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                type === 'PARTICIPANT'
                  ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-red-300'
              }`}
            >
              <div className="flex flex-col items-center">
                <UserIcon />
                <span className="font-medium mt-2">Peserta</span>
                <span className="text-xs text-gray-500 mt-1">Ikut serta dalam event</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setType('VOLUNTEER')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                type === 'VOLUNTEER'
                  ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-red-300'
              }`}
            >
              <div className="flex flex-col items-center">
                <VolunteerIcon />
                <span className="font-medium mt-2">Relawan</span>
                <span className="text-xs text-gray-500 mt-1">Bantu jalankan event</span>
              </div>
            </button>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <div className="flex items-center mb-3">
            <NotesIcon />
            <label htmlFor="notes" className="text-sm font-semibold text-gray-900 ml-2">
              Catatan Tambahan
            </label>
          </div>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
            placeholder="Kebutuhan khusus, pertanyaan, atau informasi tambahan yang perlu admin ketahui..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </>
          ) : (
            `Daftar sebagai ${type === 'PARTICIPANT' ? 'Peserta' : 'Relawan'}`
          )}
        </button>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl text-center border ${
            message.includes('berhasil') 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}