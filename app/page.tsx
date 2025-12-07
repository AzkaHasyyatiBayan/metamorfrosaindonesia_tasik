import Link from 'next/link'
import Button from './components/Button'
import EventList from './components/EventList'
import HomeCTA from './components/HomeCTA'
import { getUpcomingEvents } from './lib/data'

const SignLanguageIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
  </svg>
)

const LearningIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v6l-9-5v-6l9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v6l9-5v-6l-9 5z" />
  </svg>
)

const EventIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const CommunityIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const AboutIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const MissionIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const VisionIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

export const revalidate = 1800

export default async function HomePage() {
  const upcomingEvents = await getUpcomingEvents()
  const displayedEvents = upcomingEvents.slice(0, 3)

  return (
    <div>
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/banner.jpeg")',
          }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Metamorfrosa Indonesia Tasikmalaya
          </h1>
          <p className="text-xl md:text-2xl mb-8 leading-relaxed drop-shadow-md">
            Wadah bagi komunitas untuk berbagi, belajar, dan tumbuh bersama melalui berbagai event menarik
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/user/events">
              <Button className="bg-red-600 text-white hover:bg-red-700 px-8 py-3 text-lg font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
                Jelajahi Event
              </Button>
            </Link>
            <Link href="/user/about">
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white/20 px-8 py-3 text-lg font-semibold rounded-lg backdrop-blur-sm transition-all duration-300">
                Tentang Kami
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-100/40">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Yuk Kenalan Sama Metamorfrosa!
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Komunitas yang peduli dengan inklusivitas dan pemberdayaan melalui bahasa isyarat
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center group hover:shadow-xl transition-all duration-300">
              <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-red-200 transition-colors duration-300">
                <AboutIcon />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Tentang Kami</h3>
              <p className="text-gray-600 leading-relaxed">
                Metamorfrosa adalah komunitas yang berfokus pada pengembangan kemampuan bahasa isyarat 
                dan menciptakan lingkungan yang inklusif bagi semua anggota.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center group hover:shadow-xl transition-all duration-300">
              <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors duration-300">
                <MissionIcon />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Misi Kami</h3>
              <p className="text-gray-600 leading-relaxed">
                Mendorong inklusivitas sosial melalui pembelajaran bahasa isyarat yang menyenangkan 
                dan membangun komunitas yang saling mendukung.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center group hover:shadow-xl transition-all duration-300">
              <div className="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow-200 transition-colors duration-300">
                <VisionIcon />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Visi Kami</h3>
              <p className="text-gray-600 leading-relaxed">
                Menjadi wadah utama bagi masyarakat untuk belajar dan berinteraksi menggunakan 
                bahasa isyarat dalam lingkungan yang ramah dan mendukung.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Mau Tau Lebih Banyak?</h3>
            <p className="text-gray-600 mb-6 text-lg max-w-2xl mx-auto">
              Jelajahi halaman tentang kami untuk mengetahui lebih dalam tentang sejarah, 
              nilai-nilai, dan tim di balik Metamorfosa Community.
            </p>
            <Link href="/user/about">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105">
                Jelajahi Tentang Kami
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-red-600">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ada Apa Saja di Metamorfrosa?
            </h2>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              Temukan berbagai kegiatan seru dan bermanfaat untuk pengembangan diri dan komunitas
            </p>
          </div>

          <div className="bg-white rounded-2xl border-4 border-red-700 shadow-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="text-center group">
                <div className="bg-red-100 rounded-2xl p-6 border-2 border-red-200 group-hover:border-red-400 transition-all duration-300 group-hover:transform group-hover:scale-105 mb-4">
                  <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white">
                    <CommunityIcon />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Kenal dan Berinteraksi
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Temukan teman baru yang menggunakan bahasa isyarat dan perluas jaringan pertemanan
                  </p>
                </div>
              </div>

              <div className="text-center group">
                <div className="bg-red-100 rounded-2xl p-6 border-2 border-red-200 group-hover:border-red-400 transition-all duration-300 group-hover:transform group-hover:scale-105 mb-4">
                  <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white">
                    <LearningIcon />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Belajar Bahasa Isyarat
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Tingkatkan kemampuan bahasa isyarat dengan metode belajar yang menyenangkan
                  </p>
                </div>
              </div>

              <div className="text-center group">
                <div className="bg-red-100 rounded-2xl p-6 border-2 border-red-200 group-hover:border-red-400 transition-all duration-300 group-hover:transform group-hover:scale-105 mb-4">
                  <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white">
                    <EventIcon />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Event Seru Berkala
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Ikuti berbagai event menarik yang diadakan secara rutin untuk anggota komunitas
                  </p>
                </div>
              </div>

              <div className="text-center group">
                <div className="bg-red-100 rounded-2xl p-6 border-2 border-red-200 group-hover:border-red-400 transition-all duration-300 group-hover:transform group-hover:scale-105 mb-4">
                  <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white">
                    <SignLanguageIcon />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Praktik Komunikasi
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Langsung praktik berkomunikasi menggunakan bahasa isyarat dalam situasi nyata
                  </p>
                </div>
              </div>
            </div>

            <HomeCTA />
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Event Mendatang</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Temukan event-event seru yang akan datang di komunitas Metamorfrosa
            </p>
          </div>
          
          {displayedEvents.length > 0 ? (
            <>
              <EventList events={displayedEvents} />
              <div className="text-center mt-12">
                <Link href="/user/events">
                  <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold rounded-lg transition-colors duration-300">
                    Lihat Semua Event
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mx-auto mb-4 flex justify-center">
                <CalendarIcon />
              </div>
              <p className="text-gray-500 text-lg mb-2">Belum ada event yang akan datang</p>
              <p className="text-gray-400 text-sm mb-4">Event akan segera tersedia</p>
              <Link href="/events">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold">
                  Jelajahi Event Lainnya
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:transform group-hover:scale-110 transition-all duration-300">
                <EventIcon />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Event Inklusif</h3>
              <p className="text-gray-600">Kegiatan yang dapat diakses semua kalangan</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:transform group-hover:scale-110 transition-all duration-300">
                <CommunityIcon />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Komunitas</h3>
              <p className="text-gray-600">Support system dan jaringan pertemanan</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:transform group-hover:scale-110 transition-all duration-300">
                <LearningIcon />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Belajar Bersama</h3>
              <p className="text-gray-600">Kembangkan skill bahasa isyarat dan pengetahuan secara kolektif</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}