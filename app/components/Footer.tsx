'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icons } from './Icons'

export default function Footer() {
  const pathname = usePathname()
  const currentYear = new Date().getFullYear()

  if (pathname === '/user/profile') {
    return null
  }

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
                  Metamorfrosa
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
                href="https://wa.me/+628558827731" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-700 hover:bg-green-600 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group"
                aria-label="WhatsApp"
              >
                <Icons.Whatsapp />
              </a>
              <a 
                href="https://instagram.com/metamorfrosaindonesia_tasik" 
                className="w-10 h-10 bg-gray-700 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group"
                aria-label="Instagram"
              >
                <Icons.Instagram />
              </a>
              <a 
                href="https://www.tiktok.com/@metamorfrosa_tasikmalaya" 
                className="w-10 h-10 bg-gray-700 hover:bg-black rounded-lg flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group"
                aria-label="TikTok"
              >
                <Icons.Tiktok />
              </a>
              <a 
                href="https://www.youtube.com/@MetamorfrosaIndonesiaTasik" 
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
                { href: '/user/events', label: 'Semua Event' },
                { href: '/user/about', label: 'Tentang Kami' },
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
                  <a href="mailto:metamorfrosa.tasik@gmail.com" className="text-white hover:text-red-300 transition-colors">
                    metamorfrosa.tasik@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shrink-0 mt-1">
                  <Icons.Phone />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Telepon</p>
                  <a href="tel:+628558827731" className="text-white hover:text-red-300 transition-colors">
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

        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-6 mb-4 md:mb-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} Metamorfrosa Community. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
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