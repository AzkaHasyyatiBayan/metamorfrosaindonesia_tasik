interface ChartsProps {
  type: 'participation' | 'volunteers'
}

export default function Charts({ type }: ChartsProps) {
  const participationData = [65, 78, 82, 75, 90, 85]
  const volunteerData = [12, 15, 18, 14, 20, 16]
  
  const data = type === 'participation' ? participationData : volunteerData
  const maxValue = Math.max(...data)
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun']

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {type === 'participation' ? '📈 Tingkat Partisipasi' : '🤝 Aktivitas Volunteer'}
      </h3>
      
      <div className="flex items-end justify-between h-40 gap-2">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className={`w-full rounded-t transition-all ${
                type === 'participation' 
                  ? 'bg-linear-to-t from-red-500 to-orange-500' 
                  : 'bg-linear-to-t from-yellow-500 to-orange-400'
              }`}
              style={{ height: `${(value / maxValue) * 100}%` }}
            ></div>
            <span className="text-xs text-gray-600 mt-2">{labels[index]}</span>
            <span className="text-xs font-medium text-gray-800 mt-1">{value}{type === 'participation' ? '%' : ''}</span>
          </div>
        ))}
      </div>
    </div>
  )
}