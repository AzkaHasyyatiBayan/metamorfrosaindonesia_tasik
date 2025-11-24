'use client'

import { useState } from 'react'

interface FilterState {
  category: string[]
  dateRange: {
    start: string
    end: string
  }
  location: string
  accessibility: string
}

interface EventFilterProps {
  categories: string[]
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  totalEvents: number
  filteredCount: number
}

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
  </svg>
)

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

// AccessibilityIcon sekarang digunakan di select dropdown
const AccessibilityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
  </svg>
)

export default function EventFilter({ 
  categories, 
  filters, 
  onFilterChange, 
  totalEvents,
  filteredCount 
}: EventFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.category.includes(category)
      ? filters.category.filter(c => c !== category)
      : [...filters.category, category]
    
    onFilterChange({
      ...filters,
      category: newCategories
    })
  }

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    onFilterChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    })
  }

  const handleLocationChange = (value: string) => {
    onFilterChange({
      ...filters,
      location: value
    })
  }

  const handleAccessibilityChange = (value: string) => {
    onFilterChange({
      ...filters,
      accessibility: value
    })
  }

  const clearFilters = () => {
    onFilterChange({
      category: [],
      dateRange: { start: '', end: '' },
      location: '',
      accessibility: ''
    })
  }

  const hasActiveFilters = filters.category.length > 0 || 
    filters.dateRange.start || 
    filters.dateRange.end || 
    filters.location ||
    filters.accessibility

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <FilterIcon />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Filter Event</h3>
            <p className="text-sm text-gray-600">
              {filteredCount} dari {totalEvents} event tersedia
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors border border-red-200"
            >
              Hapus Filter
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg 
              className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Search & Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Location Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Cari lokasi..."
            value={filters.location}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Accessibility Filter - SEKARANG DENGAN ICON */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <AccessibilityIcon />
          </div>
          <select 
            value={filters.accessibility}
            onChange={(e) => handleAccessibilityChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none bg-white"
          >
            <option value="">Semua Aksesibilitas</option>
            <option value="sign_language">Bahasa Isyarat</option>
            <option value="wheelchair">Akses Kursi Roda</option>
            <option value="subtitles">Dengan Subtitle</option>
            <option value="audio_description">Deskripsi Audio</option>
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Date Quick Filter - SEKARANG DENGAN ICON */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CalendarIcon />
          </div>
          <select 
            onChange={(e) => {
              const value = e.target.value
              const today = new Date().toISOString().split('T')[0]
              let start = '', end = ''
              
              if (value === 'week') {
                start = today
                const nextWeek = new Date()
                nextWeek.setDate(nextWeek.getDate() + 7)
                end = nextWeek.toISOString().split('T')[0]
              } else if (value === 'month') {
                start = today
                const nextMonth = new Date()
                nextMonth.setMonth(nextMonth.getMonth() + 1)
                end = nextMonth.toISOString().split('T')[0]
              }
              
              onFilterChange({
                ...filters,
                dateRange: { start, end }
              })
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none bg-white"
          >
            <option value="">Pilih Periode</option>
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-6 border-t pt-6">
          {/* Categories */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Kategori Event
            </h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    filters.category.includes(category)
                      ? 'bg-red-500 text-white border-red-500 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  {category.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <CalendarIcon />
              <span className="ml-2">Rentang Tanggal Kustom</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}