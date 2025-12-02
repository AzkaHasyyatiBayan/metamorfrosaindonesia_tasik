'use client'

import Image from 'next/image'
import React, { useState } from 'react'

// --- ICONS ---
const InfoIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const TargetIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const FlagIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8M3 21h18M5 10V7a2 2 0 012-2h14a2 2 0 012 2v3" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const PhoneIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

const GalleryIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

// Banner images from public folder
const bannerImages = [
  { id: 1, src: '/banner.jpeg', alt: 'Banner kegiatan komunitas 1' },
  { id: 2, src: '/banner2.jpeg', alt: 'Banner kegiatan komunitas 2' },
  { id: 3, src: '/banner3.jpg', alt: 'Banner kegiatan komunitas 3' },
  { id: 4, src: '/banner4.jpg', alt: 'Banner kegiatan komunitas 4' },
]

// --- DATA ---
type AboutSection = {
  id: string
  title: string
  content: string
  image_url?: string
  icon: React.ReactNode
}

const aboutSections: AboutSection[] = [
  {
    id: '1',
    title: 'Profil Komunitas',
    icon: <InfoIcon />,
    content: `Resmi berdiri pada 21 November 2021, Metamorfrosa Indonesia Tasikmalaya hadir menjawab kebutuhan ruang inklusif. 
    Kami berdedikasi memberdayakan teman disabilitas melalui edukasi dan advokasi, demi memperjuangkan hak, aksesibilitas, dan kesetaraan untuk menciptakan masyarakat Tasikmalaya yang ramah bagi semua.`,
  },
  {
    id: '2',
    title: 'Visi dan Misi',
    icon: <TargetIcon />,
    content: `Visi:
    Mewujudkan Kota Tasikmalaya menjadi kota yang lebih inklusif.
    
    Misi:
    1. Menyediakan platform dan kegiatan yang aksesibel bagi semua
    2. Meningkatkan kesadaran masyarakat tentang pentingnya inklusivitas
    3. Memberdayakan penyandang disabilitas melalui pelatihan dan edukasi
    4. Membangun jaringan support system yang kuat`,
  },
  {
    id: '3',
    title: 'Tujuan dan Kegiatan',
    icon: <FlagIcon />,
    content: `Tujuan Utama:
    - Meningkatkan partisipasi penyandang disabilitas dalam masyarakat
    - Menyediakan akses informasi dan edukasi yang merata
    - Menciptakan lingkungan yang ramah dan aksesibel.
    
    Kegiatan Utama:
    - Workshop dan pelatihan keterampilan
    - Event sosial dan budaya inklusif
    - Advocacy dan awareness campaign
    - Support group meetings`,
  },
  {
    id: '4',
    title: 'Struktur Pengurus',
    icon: <UsersIcon />,
    content: `Pengurus Inti:
    - Ketua: [Nama Ketua]
    - Sekretaris: [Nama Sekretaris]
    - Bendahara: [Nama Bendahara]
    
    Divisi-divisi:
    - Divisi Program dan Event
    - Divisi Relawan dan Kemitraan
    - Divisi Media dan Komunikasi
    - Divisi Dana dan Usaha`,
  },
  {
    id: '5',
    title: 'Informasi Kontak',
    icon: <PhoneIcon />,
    content: `Hubungi Kami:
    Email: metamorfrosa.tasik@gmail.com
    Instagram: @metamorfrosa_tasik
    
    Lokasi: Tasikmalaya, Jawa Barat.
    Jam Operasional: Senin - Jumat: 09.00 - 17.00 WIB`,
  }
]

export default function AboutPage() {
  const [selectedBanner, setSelectedBanner] = useState<typeof bannerImages[0] | null>(null)
  
  // Helper sederhana untuk memformat konten teks menjadi paragraf atau list
  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return <div key={index} className="h-4"></div> // Spacer untuk baris kosong

      // Deteksi List Item (dimulai dengan "-" atau angka "1.")
      const isListItem = /^-|^\d+\./.test(trimmedLine)
      
      if (isListItem) {
        return (
          <div key={index} className="flex items-start mb-2 ml-4">
            <span className="inline-block w-2 h-2 min-w-2 bg-red-500 rounded-full mt-2 mr-3 opacity-80"></span>
            <p className="text-gray-700 leading-relaxed text-base">{trimmedLine.replace(/^-/, '').trim()}</p>
          </div>
        )
      }

      // Deteksi Sub-heading (diakhiri dengan ":")
      if (trimmedLine.endsWith(':')) {
        return (
          <h4 key={index} className="font-bold text-gray-900 mt-4 mb-2 text-lg">
            {trimmedLine}
          </h4>
        )
      }

      return (
        <p key={index} className="mb-3 text-gray-600 leading-relaxed text-base">
          {trimmedLine}
        </p>
      )
    })
  }

  // Fungsi untuk membuka modal banner
  const openBannerModal = (banner: typeof bannerImages[0]) => {
    setSelectedBanner(banner)
  }

  // Fungsi untuk menutup modal
  const closeImageModal = () => {
    setSelectedBanner(null)
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight relative z-10">
          Tentang <span className="text-red-600">Kami</span>
        </h1>
        <div className="w-24 h-1.5 bg-red-600 rounded-full mx-auto mb-6 relative z-10"></div>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed relative z-10">
          Mengenal lebih dekat perjalanan, nilai, dan dedikasi Metamorfrosa Indonesia dalam membangun ruang inklusif di Tasikmalaya.
        </p>
      </div>

      {/* Banner Section */}
      <div className="max-w-5xl mx-auto mb-16">
        <section className="group relative bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
          {/* Decorative Top Accent */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-red-500/0 via-red-500/50 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Icon / Visual Identifier */}
            <div className="shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-500">
                <GalleryIcon />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center group-hover:text-red-600 transition-colors">
                Galeri Kami
              </h2>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                Lihat momen-momen spesial dari berbagai kegiatan dan acara yang telah kami selenggarakan bersama komunitas.
              </p>
              
              {/* Banner Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {bannerImages.map((banner) => (
                  <div 
                    key={banner.id}
                    className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer border border-gray-100 hover:border-red-200 transition-all duration-300 shadow-sm hover:shadow-lg"
                    onClick={() => openBannerModal(banner)}
                  >
                    <Image
                      src={banner.src}
                      alt={banner.alt}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
                      <div className="p-3 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white text-sm font-medium text-center">Klik untuk memperbesar</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      
      {/* Content Sections */}
      <div className="max-w-5xl mx-auto space-y-10">
        {aboutSections.map((section, idx) => (
          <section 
            key={section.id} 
            className={`
              group relative bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-gray-100 
              transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 overflow-hidden
              ${idx % 2 === 0 ? 'md:ml-0' : 'md:mr-0'}
            `}
          >
            {/* Decorative Top Accent */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-red-500/0 via-red-500/50 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* Icon / Visual Identifier */}
              <div className="shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-500">
                  {section.icon}
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center group-hover:text-red-600 transition-colors">
                  {section.title}
                </h2>
                
                <div className="prose prose-red max-w-none text-gray-600">
                  {renderContent(section.content)}
                </div>

                {/* Optional Image */}
                {section.image_url && (
                  <div className="mt-8 rounded-2xl overflow-hidden shadow-lg border border-gray-100 group-hover:shadow-xl transition-shadow">
                    <Image 
                      src={section.image_url} 
                      alt={section.title}
                      width={800}
                      height={450}
                      className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Footer Quote / Call to Action */}
      <div className="max-w-3xl mx-auto text-center mt-20">
        <blockquote className="text-xl font-medium text-gray-600 italic">
          &quot;Karena setiap individu berhak mendapatkan kesempatan yang sama untuk berkembang dan berkarya.&quot;
        </blockquote>
        <div className="mt-4 text-red-600 font-bold tracking-wide text-sm uppercase">
          — Metamorfrosa Indonesia
        </div>
      </div>

      {/* Single Banner Modal */}
      {selectedBanner && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button 
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors"
            >
              <XIcon />
            </button>
            
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="relative aspect-video w-full bg-black">
                <Image
                  src={selectedBanner.src}
                  alt={selectedBanner.alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedBanner.alt}
                </h3>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Banner Dokumentasi Kegiatan</p>
                  <a 
                    href={selectedBanner.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-red-600 hover:text-red-700 font-medium gap-2"
                  >
                    <DownloadIcon />
                    <span>Unduh Gambar</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}