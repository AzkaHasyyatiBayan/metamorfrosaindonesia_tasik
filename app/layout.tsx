import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Footer from './components/Footer'
import Navbar from './components/NavBar'
import AuthProvider from './components/AuthProvider'
import { EnhancedErrorBoundary } from './components/EnhancedErrorBoundary'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Metamorfosa Community - Wadah Belajar Bahasa Isyarat',
  description: 'Komunitas Metamorfosa Indonesia - Berbagi, belajar, dan tumbuh bersama melalui bahasa isyarat',
  keywords: 'bahasa isyarat, komunitas, event, inklusif, metamorfosa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <EnhancedErrorBoundary>
          <AuthProvider>
            <div className="min-h-screen flex flex-col bg-white">
              <Navbar />
              <main className="flex-1 w-full">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </EnhancedErrorBoundary>
      </body>
    </html>
  )
}