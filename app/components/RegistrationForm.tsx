'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'

type RegistrationType = 'PARTICIPANT' | 'VOLUNTEER'

interface RegistrationFormProps {
  eventId: string
}

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

      setMessage(`Pendaftaran sebagai ${type} berhasil! Tunggu konfirmasi admin.`)
      setNotes('')
      
    } catch (error) {
      setMessage(`Terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-600 mb-4">Silakan login untuk mendaftar event</p>
        <button 
          onClick={() => router.push('/auth/login')}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Login
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Form Pendaftaran</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mendaftar Sebagai *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="PARTICIPANT"
                checked={type === 'PARTICIPANT'}
                onChange={(e) => setType(e.target.value as RegistrationType)}
                className="mr-2"
              />
              <span>Peserta</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="VOLUNTEER"
                checked={type === 'VOLUNTEER'}
                onChange={(e) => setType(e.target.value as RegistrationType)}
                className="mr-2"
              />
              <span>Relawan</span>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Catatan Tambahan
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Kebutuhan khusus atau pertanyaan..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
        >
          {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
        </button>

        {message && (
          <div className={`p-3 rounded-md text-center ${
            message.includes('berhasil') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}