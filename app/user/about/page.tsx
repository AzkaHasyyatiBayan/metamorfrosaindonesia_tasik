import { supabase } from '../../lib/supabase'
import Image from 'next/image'

type AboutSection = {
  id: string
  section: string
  title: string
  content: string
  image_url?: string
  display_order: number
  is_active: boolean
}

async function getAboutSections(): Promise<AboutSection[]> {
  const { data: sections, error } = await supabase
    .from('about')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching about sections:', error)
    return []
  }
  return sections as AboutSection[]
}

export default async function AboutPage() {
  const sections = await getAboutSections()

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-12">Tentang Kami</h1>
        
        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
              <div className="prose max-w-none">
                {section.content.split('\n').map((paragraph: string, index: number) => (
                  <p key={index} className="mb-4 text-gray-700">
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.image_url && (
                <div className="mt-4 flex justify-center">
                  <Image 
                    src={section.image_url} 
                    alt={section.title}
                    width={400}
                    height={300}
                    className="rounded-lg max-w-md mx-auto"
                  />
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
