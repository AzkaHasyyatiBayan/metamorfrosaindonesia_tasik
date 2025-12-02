'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase' 
import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'
import { Icons } from './Icons'

type RegistrationType = 'PARTICIPANT' | 'VOLUNTEER'

interface RegistrationFormProps {
  eventId: string
}

export default function RegistrationForm({ eventId }: RegistrationFormProps) {
  const { user, userProfile } = useAuth()
  const [type, setType] = useState<RegistrationType>('PARTICIPANT')
  const [notes, setNotes] = useState('')
  const [hasDisability, setHasDisability] = useState(false)
  const [disabilityType, setDisabilityType] = useState<string | undefined>(undefined)
  // Volunteer UI temporarily disabled
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [volunteerType, setVolunteerType] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 1. Validasi Awal
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!eventId) {
      const errorMsg = 'ID Event tidak ditemukan. Silakan muat ulang halaman.'
      setMessage(errorMsg)
      alert(errorMsg)
      return
    }

    setLoading(true)
    setMessage('')
    setIsSuccess(false)

    try {
      // Map front-end registration type to DB `role` values
      const roleValue = type === 'VOLUNTEER' ? 'volunteer' : 'peserta'
      const statusValue = 'pending'

      // Prepare notes
      let finalNotes = notes || ''
      if (type === 'PARTICIPANT' && hasDisability && disabilityType) {
        finalNotes = finalNotes ? `${finalNotes} \nDisability: ${disabilityType}` : `Disability: ${disabilityType}`
      }

      const insertPayload: Record<string, unknown> = {
        event_id: eventId,
        user_id: user.id,
        role: roleValue,
        notes: finalNotes || null,
        status: statusValue,
        full_name: userProfile?.name || user.email || '',
        email: user.email || '',
        phone: userProfile?.phone || null
      }

      if (type === 'VOLUNTEER' && volunteerType) insertPayload.volunteer_type = volunteerType

      const { error } = await supabase
        .from('registrations')
        .insert([insertPayload])

      if (error) {
        // Lempar error agar ditangkap catch block
        throw error
      }

      // Sukses
      setIsSuccess(true)
      setMessage(`Pendaftaran Berhasil! Mengalihkan...`)
      setNotes('')
      setType('PARTICIPANT')
      
      // Redirect setelah sukses
      setTimeout(() => {
        router.push('/user/profile')
      }, 1500)
      
    } catch (error: unknown) {
      console.error('Registration process error:', error)
      
      let errMsg = 'Terjadi kesalahan saat mendaftar.'
      
      // FIX: Menggunakan type guard dan casting yang spesifik untuk menghindari 'any'
      if (typeof error === 'object' && error !== null) {
         // Casting aman ke bentuk minimal error object yang kita harapkan
         const err = error as { code?: string; message?: string };

         if (err.code === '23505') {
            errMsg = 'Anda sudah terdaftar di event ini.'
         } else if (err.message?.includes('duplicate')) {
            errMsg = 'Anda sudah terdaftar di event ini.'
         } else if (err.message?.includes('capacity') || err.message?.includes('full')) {
            errMsg = 'Mohon maaf, kuota peserta penuh.'
         } else if (err.message) {
            errMsg = err.message;
         }
      }

      setMessage(`Gagal: ${errMsg}`)
      
      // PENTING: Alert dinyalakan agar user sadar proses berhenti karena error
      alert(`Pendaftaran Gagal: ${errMsg}`) 
    } finally {
      // PENTING: Memastikan loading berhenti apapun hasilnya
      setLoading(false)
    }
  }

  // --- STATE: USER BELUM LOGIN ---
  if (!user) {
    return (
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-10 text-center group transition-all hover:shadow-red-100/50">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-red-500 via-red-400 to-red-500"></div>
        
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
          <div className="text-red-500">
             <Icons.User /> 
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Login Diperlukan</h3>
        <p className="text-gray-500 mb-8 max-w-xs mx-auto leading-relaxed">
          Untuk mendaftar di event eksklusif ini, silakan masuk ke akun Anda terlebih dahulu.
        </p>
        
        <button 
          onClick={() => router.push('/auth/login')}
          className="w-full bg-linear-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-red-500/30 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Login Sekarang</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    )
  }

  // --- STATE: USER SUDAH LOGIN (FORM) ---
  return (
    <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 md:p-10 overflow-hidden">
      {/* Decorative Blur Element */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative text-center mb-10">
        <span className="inline-block py-1 px-3 rounded-full bg-red-50 text-red-600 text-xs font-bold tracking-wider mb-3 border border-red-100 uppercase">
          Registrasi
        </span>
        <h3 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Daftar Event</h3>
        <p className="text-gray-500">Lengkapi data di bawah untuk mengamankan slot Anda.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        
        {/* Section: Tipe Pendaftaran */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide opacity-80">
            Daftar Sebagai
          </label>
          <div className="grid grid-cols-1 gap-4"> 
            
            <button
              type="button"
              onClick={() => setType('PARTICIPANT')}
              disabled={isSuccess}
              className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                type === 'PARTICIPANT'
                  ? 'border-red-500 bg-red-50/50 shadow-md ring-1 ring-red-500/20'
                  : 'border-gray-100 bg-white hover:border-red-200 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full transition-colors duration-300 ${
                  type === 'PARTICIPANT' ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' : 'bg-gray-100 text-gray-400 group-hover:bg-red-100 group-hover:text-red-500'
                }`}>
                  <Icons.User />
                </div>
                <div>
                  <span className={`block font-bold text-lg transition-colors ${type === 'PARTICIPANT' ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                    Peserta
                  </span>
                  <span className="text-sm text-gray-500">Ikut serta dalam kegiatan event</span>
                </div>
                
                {/* Checkmark Icon if selected */}
                {type === 'PARTICIPANT' && (
                  <div className="absolute top-6 right-6 text-red-500 animate-fadeIn">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Section: Accessibility (Conditional) */}
        <div className="space-y-4">
          {type === 'PARTICIPANT' && (
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${hasDisability ? 'bg-red-50/30 border-red-100' : 'bg-gray-50/50 border-transparent hover:bg-white hover:border-gray-200'}`}>
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={hasDisability} 
                    onChange={(e) => setHasDisability(e.target.checked)} 
                    className="peer sr-only" 
                  />
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-lg peer-checked:bg-red-500 peer-checked:border-red-500 transition-all flex items-center justify-center">
                    <svg className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 select-none">
                  <span className="block text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors">Saya memiliki disabilitas / kebutuhan khusus</span>
                  <span className="block text-xs text-gray-500 mt-0.5">Centang jika Anda memerlukan bantuan aksesibilitas</span>
                </div>
              </label>

              <div className={`grid transition-all duration-300 ease-in-out overflow-hidden ${hasDisability ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="min-h-0">
                  <select 
                    value={disabilityType} 
                    onChange={(e) => setDisabilityType(e.target.value)} 
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all cursor-pointer hover:border-red-300"
                  >
                    <option value="">Pilih jenis disabilitas...</option>
                    <option value="tunadaksa">Tunadaksa (Fisik)</option>
                    <option value="tunawicara">Tunawicara (Bicara)</option>
                    <option value="tunarungu">Tunarungu (Pendengaran)</option>
                    <option value="tunagrahita">Tunagrahita (Intelektual)</option>
                    <option value="netra">Tunanetra (Penglihatan)</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section: Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide opacity-80">
            Catatan Tambahan <span className="text-gray-400 font-normal normal-case ml-1">(Opsional)</span>
          </label>
          <div className="relative">
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              disabled={isSuccess}
              className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all resize-none disabled:opacity-50"
              placeholder="Tuliskan pertanyaan atau informasi lain yang perlu kami ketahui..."
            />
             <div className="absolute bottom-3 right-3 pointer-events-none text-gray-300">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
             </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || isSuccess}
          className="group w-full relative overflow-hidden bg-linear-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-gray-400 disabled:to-gray-300 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-red-500/30 transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] disabled:transform-none disabled:shadow-none"
        >
          <div className="relative z-10 flex items-center justify-center gap-3">
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Memproses Data...</span>
              </>
            ) : isSuccess ? (
              <>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Berhasil Mendaftar!</span>
              </>
            ) : (
              <>
                <span>Daftar Sekarang</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </>
            )}
          </div>
          {/* Shine Effect */}
          {!loading && !isSuccess && (
             <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-linear-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
          )}
        </button>

        {/* Feedback Message */}
        {message && (
          <div className={`p-4 rounded-xl text-center text-sm font-medium border animate-fadeIn transition-all ${
            isSuccess 
              ? 'bg-green-50/50 border-green-200 text-green-700 shadow-sm' 
              : 'bg-red-50/50 border-red-200 text-red-600 shadow-sm'
          }`}>
            <p className="flex items-center justify-center gap-2">
               {isSuccess 
                 ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               }
               {message}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}