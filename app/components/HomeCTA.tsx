'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'
import Button from './Button'

export default function HomeCTA() {
  const { user } = useAuth()

  if (user) return null

  return (
    <div className="bg-red-50 rounded-xl border-2 border-red-200 p-6 text-center animate-fade-in">
      <h4 className="text-xl font-semibold text-red-800 mb-2">
        Update Informasi Lebih Lengkap Mengenai Komunitas
      </h4>
      <p className="text-red-700 mb-4">
        Dapatkan pengalaman baru dengan pembelajaran yang interaktif bermakna bersama teman-teman baru
      </p>
      <Link href="/auth/login">
        <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-300">
          Daftar Sekarang
        </Button>
      </Link>
    </div>
  )
}