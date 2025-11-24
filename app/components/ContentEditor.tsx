'use client'
import { useState } from 'react'
import Button from './Button'

export default function ContentEditor() {
  const [content, setContent] = useState({
    about: 'Metamorfosa adalah komunitas yang berfokus pada pengembangan diri dan inklusi sosial...',
    vision: 'Menjadi wadah transformasi bagi setiap individu untuk berkembang melalui pembelajaran kolaboratif...',
    mission: `• Menyelenggarakan event edukatif yang accessible
• Membangun jaringan komunitas yang solid
• Mendorong pertumbuhan personal dan profesional`
  })

  const handleSave = () => {
    // Simpan content
    alert('Konten berhasil disimpan!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Edit Konten Halaman About</h3>
        <p className="text-gray-600">Update informasi tentang komunitas Metamorfosa</p>
      </div>

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
        <Button onClick={handleSave}>
          Simpan Perubahan
        </Button>
        <Button variant="outline">
          Preview
        </Button>
      </div>
    </div>
  )
}