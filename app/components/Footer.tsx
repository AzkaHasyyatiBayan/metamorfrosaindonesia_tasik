import Link from 'next/link'
import { Icons } from './Icons'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-linear-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                <Icons.Community />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Metamorfosa
                </h3>
                <p className="text-red-400 text-sm font-medium">Community</p>
              </div>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mb-6">
              Wadah transformasi inklusif yang memberdayakan setiap individu untuk berkembang 
              melalui pembelajaran kolaboratif bahasa isyarat dan komunitas yang saling mendukung.
            </p>
            
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-700 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group"
                aria-label="Facebook"
              >
                <Icons.Facebook />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-700 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group"
                aria-label="Instagram"
              >
                <Icons.Instagram />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-700 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group"
                aria-label="Twitter"
              >
                <Icons.Twitter />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-700 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group"
                aria-label="YouTube"
              >
                <Icons.Youtube />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-white flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Tautan Cepat
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Beranda' },
                { href: '/events', label: 'Semua Event' },
                { href: '/about', label: 'Tentang Kami' },
                { href: '/contact', label: 'Kontak' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group"
                  >
                    <Icons.ArrowRight />
                    <span className="ml-2 group-hover:ml-3 transition-all duration-300">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-white flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Hubungi Kami
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shrink-0 mt-1">
                  <Icons.Email />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Email</p>
                  <a href="mailto:hello@metamorfosa.com" className="text-white hover:text-red-300 transition-colors">
                    hello@metamorfosa.com
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shrink-0 mt-1">
                  <Icons.Phone />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Telepon</p>
                  <a href="tel:+6281234567890" className="text-white hover:text-red-300 transition-colors">
                    +62 855-8827-731
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shrink-0 mt-1">
                  <Icons.Location />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Lokasi</p>
                  <p className="text-white">Tasikmalaya, Jawa Barat</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-linear-to-r from-red-600/20 to-red-700/20 rounded-2xl p-8 mb-12 border border-red-500/30">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:flex-1 mb-6 lg:mb-0">
              <h4 className="text-xl font-bold text-white mb-2">
                Tetap Terhubung dengan Kami
              </h4>
              <p className="text-gray-300">
                Dapatkan update terbaru tentang event dan kegiatan komunitas Metamorfosa
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
              <input 
                type="email" 
                placeholder="Masukkan email Anda"
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent flex-1 min-w-0"
              />
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900">
                Berlangganan
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-6 mb-4 md:mb-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} Metamorfosa Community. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Syarat & Ketentuan
            </Link>
            <Link href="/sitemap" className="text-gray-400 hover:text-white text-sm transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-600/10 rounded-full -translate-x-16 translate-y-16"></div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full translate-x-12 -translate-y-12"></div>
    </footer>
  )
}
