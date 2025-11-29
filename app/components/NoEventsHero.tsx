'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const CalendarIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const MushroomIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11 14H13V20H11z" fill="#8B4513"/>
    <ellipse cx="12" cy="10" rx="6" ry="4" fill="#FF6B6B"/>
    <circle cx="9" cy="9" r="1" fill="white"/>
    <circle cx="12" cy="8" r="1" fill="white"/>
    <circle cx="15" cy="9" r="1" fill="white"/>
    <circle cx="10" cy="11" r="0.8" fill="white"/>
    <circle cx="14" cy="11" r="0.8" fill="white"/>
  </svg>
)

const CommunityIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const SmallMushroomIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11 14H13V20H11z" fill="#8B4513"/>
    <ellipse cx="12" cy="10" rx="5" ry="3" fill="#FF6B6B"/>
    <circle cx="9.5" cy="9" r="0.8" fill="white"/>
    <circle cx="12" cy="8" r="0.8" fill="white"/>
    <circle cx="14.5" cy="9" r="0.8" fill="white"/>
  </svg>
)

interface NoEventsHeroProps {
  hasEvents: boolean
  searchQuery: string
  selectedCategories: string[]
}

export default function NoEventsHero({ hasEvents, searchQuery, selectedCategories }: NoEventsHeroProps) {
  const [marioPosition, setMarioPosition] = useState(0)
  const [isJumping, setIsJumping] = useState(false)
  const [mushroomScale, setMushroomScale] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setMarioPosition(prev => (prev + 2) % 100)
    }, 100)

    const jumpInterval = setInterval(() => {
      setIsJumping(true)
      setTimeout(() => setIsJumping(false), 300)
    }, 2000)

    const mushroomInterval = setInterval(() => {
      setMushroomScale(1.2)
      setTimeout(() => setMushroomScale(1), 500)
    }, 3000)

    return () => {
      clearInterval(interval)
      clearInterval(jumpInterval)
      clearInterval(mushroomInterval)
    }
  }, [])

  if (hasEvents) {
    return (
      <div className="text-center py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="text-yellow-500 mx-auto mb-6 flex justify-center">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Tidak Ada Event yang Cocok
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? `Tidak ditemukan event di lokasi "${searchQuery}" dengan kategori yang dipilih.`
                : 'Tidak ada event yang cocok dengan filter yang dipilih.'
              }
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {selectedCategories.map(cat => (
                <span key={cat} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                  {cat.replace('_', ' ')}
                </span>
              ))}
            </div>
            <p className="text-gray-500 text-sm">
              Coba ubah filter pencarian atau hubungi admin untuk informasi lebih lanjut.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-16">
      <div className="max-w-4xl mx-auto">
        <div className="relative h-32 mb-12">
          <div 
            className="absolute bottom-0 w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-300"
            style={{ 
              left: `${marioPosition}%`,
              transform: `translateY(${isJumping ? '-40px' : '0px'})`
            }}
          >
            <MushroomIcon />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-green-500 rounded-t-lg"></div>
          
          <div 
            className="absolute bottom-2 left-1/4 transition-transform duration-500"
            style={{ transform: `scale(${mushroomScale})` }}
          >
            <SmallMushroomIcon />
          </div>
          <div 
            className="absolute bottom-2 right-1/4 transition-transform duration-500 delay-300"
            style={{ transform: `scale(${mushroomScale})` }}
          >
            <SmallMushroomIcon />
          </div>
          
          <div className="absolute top-4 left-1/4 w-20 h-8 bg-white rounded-full opacity-80"></div>
          <div className="absolute top-8 left-3/4 w-16 h-6 bg-white rounded-full opacity-80"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-12 border-4 border-yellow-400 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4">
              <CommunityIcon />
            </div>
            <div className="absolute bottom-4 left-4">
              <CalendarIcon />
            </div>
            <div className="absolute top-1/4 left-1/4 opacity-10">
              <MushroomIcon />
            </div>
            <div className="absolute bottom-1/4 right-1/4 opacity-10">
              <MushroomIcon />
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Belum Ada Event Saat Ini!
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Tenang! Tim kami sedang mempersiapkan event-event seru untuk komunitas bahasa isyarat. 
              Event baru akan segera hadir dengan kegiatan yang menarik dan bermanfaat.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon />
                </div>
                <h4 className="font-semibold text-blue-900 mb-2">Event Menyusul</h4>
                <p className="text-blue-700 text-sm">Event baru sedang dalam persiapan</p>
              </div>
              
              <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CommunityIcon />
                </div>
                <h4 className="font-semibold text-green-900 mb-2">Tetap Terhubung</h4>
                <p className="text-green-700 text-sm">Ikuti update terbaru dari kami</p>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <SmallMushroomIcon />
                </div>
                <h4 className="font-semibold text-purple-900 mb-2">Belajar Bersama</h4>
                <p className="text-purple-700 text-sm">Terus tingkatkan skill bahasa isyarat</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/" 
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Kembali ke Beranda
              </Link>
              <button 
                onClick={() => window.location.reload()}
                className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Refresh Halaman
              </button>
            </div>

            <p className="text-gray-500 text-sm mt-6">
              Event akan tersedia dalam waktu dekat. Pantau terus halaman ini!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}