'use client'

import { useState } from 'react'

// Definisi tipe data yang sama dengan parent untuk konsistensi
export type FilterState = {
  category: string[]
  dateRange: {
    start: string
    end: string
  }
  location: string
  accessibility: string
}

interface EventFilterProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  totalEvents: number
  filteredCount: number
  categories: string[] // Tambahan prop untuk kategori dinamis dari DB
}

export default function EventFilter({ 
  filters, 
  onFilterChange, 
  totalEvents,
  filteredCount,
  categories
}: EventFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Helper untuk menentukan apakah date range sesuai dengan preset (Week/Month)
  const getPeriodFromDateRange = (start: string, end: string): string => {
    if (!start || !end) return ''
    
    // Gunakan tanggal lokal untuk membandingkan input value (YYYY-MM-DD)
    const now = new Date()
    // Mengimbangi offset zona waktu agar tanggal sesuai dengan string YYYY-MM-DD lokal
    const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
    
    if (start === today) {
      const nextWeek = new Date(now)
      nextWeek.setDate(nextWeek.getDate() + 7)
      const nextWeekStr = new Date(nextWeek.getTime() - (nextWeek.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
      if (end === nextWeekStr) return 'week'
      
      const nextMonth = new Date(now)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      const nextMonthStr = new Date(nextMonth.getTime() - (nextMonth.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
      if (end === nextMonthStr) return 'month'
    }
    return ''
  }

  // PERBAIKAN: Menghapus state 'period' dan useEffect.
  // Sekarang 'period' dihitung langsung (derived state) dari props filters.
  // Ini menghilangkan error "setState synchronously within an effect".
  const period = getPeriodFromDateRange(filters.dateRange.start, filters.dateRange.end)

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    const newDateRange = {
      ...filters.dateRange,
      [field]: value
    }
    
    onFilterChange({
      ...filters,
      dateRange: newDateRange
    })
  }

  const handleLocationChange = (value: string) => {
    onFilterChange({
      ...filters,
      location: value
    })
  }

  // Menggunakan 'accessibility' sebagai filter kategori utama
  const handleCategoryChange = (value: string) => {
    onFilterChange({
      ...filters,
      accessibility: value
    })
  }

  const handlePeriodChange = (value: string) => {
    // Tidak perlu setPeriod(value) karena akan otomatis terupdate lewat props filters
    
    if (value === '') {
      onFilterChange({
        ...filters,
        dateRange: { start: '', end: '' }
      })
      return
    }

    const now = new Date()
    const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
    let end = ''
    
    if (value === 'week') {
      const nextWeek = new Date(now)
      nextWeek.setDate(nextWeek.getDate() + 7)
      end = new Date(nextWeek.getTime() - (nextWeek.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
    } else if (value === 'month') {
      const nextMonth = new Date(now)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      end = new Date(nextMonth.getTime() - (nextMonth.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
    }

    onFilterChange({
      ...filters,
      dateRange: { start: today, end }
    })
  }

  const clearFilters = () => {
    onFilterChange({
      category: [],
      dateRange: { start: '', end: '' },
      location: '',
      accessibility: ''
    })
    // Tidak perlu setPeriod('') manual
  }

  const hasActiveFilters = Boolean(
    filters.dateRange.start || 
    filters.dateRange.end || 
    filters.location ||
    filters.accessibility
  )

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      {/* Header Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-light tracking-tight text-gray-900">
            Filter Events
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing <span className="font-semibold text-gray-900">{filteredCount}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalEvents}</span> events
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-all duration-300 hover:shadow-sm"
            >
              Clear All
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-300"
            aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
          >
            <svg 
              className={`w-5 h-5 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Filter Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Location Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300"
          />
        </div>

        {/* Category / Accessibility Select */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <select 
            value={filters.accessibility}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full pl-12 pr-10 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none hover:border-gray-300 cursor-pointer"
          >
            <option value="" className="text-gray-400">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="text-gray-900">
                {cat.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Time Period Select */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <select 
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="w-full pl-12 pr-10 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none hover:border-gray-300 cursor-pointer"
          >
            <option value="" className="text-gray-400">Time Period</option>
            <option value="week" className="text-gray-900">This Week</option>
            <option value="month" className="text-gray-900">This Month</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Custom Date Range */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100 pt-8 border-t border-gray-100 mt-8' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="max-w-2xl mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-6 text-center">Custom Date Range</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}