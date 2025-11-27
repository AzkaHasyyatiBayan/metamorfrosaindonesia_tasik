'use client'
import { useState } from 'react'
import Button from './Button'

type MessageType = 'success' | 'error' | null

export default function ContentEditor() {
  const [content, setContent] = useState({
    about: 'Metamorfosa adalah komunitas yang berfokus pada pengembangan diri dan inklusi sosial...',
    vision: 'Menjadi wadah transformasi bagi setiap individu untuk berkembang melalui pembelajaran kolaboratif...',
    mission: `• Menyelenggarakan event edukatif yang accessible
• Membangun jaringan komunitas yang solid
• Mendorong pertumbuhan personal dan profesional`
  })
  const [message, setMessage] = useState<{ type: MessageType; text: string }>({ type: null, text: '' })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    try {
      setLoading(true)
      setMessage({ type: null, text: '' })
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setMessage({ 
        type: 'success', 
        text: 'Konten berhasil disimpan!' 
      })
      
      setTimeout(() => setMessage({ type: null, text: '' }), 4000)
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Gagal menyimpan konten' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Edit Konten Halaman About</h3>
        <p className="text-gray-600">Update informasi tentang komunitas Metamorfosa</p>
      </div>

      {message.type && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              {message.type === 'success' ? (
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-2">
            Tentang Kami
          </label>
          <textarea
            id="about"
            rows={4}
            value={content.about}
            onChange={(e) => setContent(prev => ({ ...prev, about: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="vision" className="block text-sm font-medium text-gray-700 mb-2">
            Visi
          </label>
          <textarea
            id="vision"
            rows={3}
            value={content.vision}
            onChange={(e) => setContent(prev => ({ ...prev, vision: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="mission" className="block text-sm font-medium text-gray-700 mb-2">
            Misi
          </label>
          <textarea
            id="mission"
            rows={5}
            value={content.mission}
            onChange={(e) => setContent(prev => ({ ...prev, mission: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
        <Button variant="outline">
          Preview
        </Button>
      </div>
    </div>
  )
}
