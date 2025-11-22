import Link from 'next/link';
import { supabase } from './lib/supabase';
import EventCard from './components/EventCard';
import Navigation from './components/Navigation';
import EventRecommendations from './components/EventRecommendations';

type Event = {
  id: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  category: string[];
  max_participants?: number;
  image_url?: string;
  is_active: boolean;
}

async function getFeaturedEvents(): Promise<Event[]> {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .gte('date_time', new Date().toISOString())
      .order('date_time', { ascending: true })
      .limit(3);

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }

    return events || [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export default async function Home() {
  const events = await getFeaturedEvents();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Metamorfrosa Indonesia Tasikmalaya
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Komunitas inklusif yang memberdayakan penyandang disabilitas 
            melalui kegiatan edukasi, sosial, dan advokasi
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/events"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Lihat Event
            </Link>
            <Link 
              href="/about"
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Tentang Kami
            </Link>
          </div>
        </div>
      </section>

      <EventRecommendations />

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Event Mendatang</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {events.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Tidak ada event mendatang. Stay tuned!</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link 
              href="/events"
              className="inline-block border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Lihat Semua Event
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Layanan Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎉</span>
              </div>
              <h3 className="font-semibold mb-2">Event Inklusif</h3>
              <p className="text-gray-600 text-sm">Kegiatan yang dapat diakses semua kalangan</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="font-semibold mb-2">Komunitas</h3>
              <p className="text-gray-600 text-sm">Support system dan jaringan pertemanan</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="font-semibold mb-2">Edukasi</h3>
              <p className="text-gray-600 text-sm">Workshop dan pelatihan keterampilan</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <h3 className="font-semibold mb-2">Relawan</h3>
              <p className="text-gray-600 text-sm">Kesempatan menjadi relawan dan interpreter</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2024 Metamorfrosa Indonesia Tasikmalaya. Semua hak dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}