import Image from 'next/image'

type AboutSection = {
  id: string
  title: string
  content: string
  image_url?: string
}

const aboutSections: AboutSection[] = [
  {
    id: '1',
    title: 'Profil Komunitas',
    content: `Resmi berdiri pada 21 November 2021, Metamorfrosa Indonesia Tasikmalaya hadir menjawab kebutuhan ruang inklusif. 
    Kami berdedikasi memberdayakan teman disabilitas melalui edukasi dan advokasi, demi memperjuangkan hak, aksesibilitas, dan kesetaraan untuk menciptakan masyarakat Tasikmalaya yang ramah bagi semua.`,
  },
  {
    id: '2',
    title: 'Visi dan Misi',
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
    content: `Hubungi Kami:
    Email: metamorfrosa.tasik@gmail.com
    Instagram: @metamorfrosa_tasik
    
    Lokasi: Tasikmalaya, Jawa Barat.
    Jam Operasional: Senin - Jumat: 09.00 - 17.00 WIB`,
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-12">Tentang Kami</h1>
        
        <div className="space-y-12">
          {aboutSections.map((section) => (
            <section key={section.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
              
              <div className="prose max-w-none">
                {section.content.split('\n').map((paragraph: string, index: number) => {
                  if (paragraph.trim() === '') return null;
                  
                  return (
                    <p key={index} className="mb-2 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  )
                })}
              </div>

              {section.image_url && (
                <div className="mt-6 flex justify-center">
                  <Image 
                    src={section.image_url} 
                    alt={section.title}
                    width={400}
                    height={300}
                    className="rounded-lg max-w-md mx-auto shadow-sm object-cover"
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