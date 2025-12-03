'use client'

import { useState } from 'react'

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
  categories: string[]
}

export default function EventFilter({ 
  filters, 
  onFilterChange, 
  totalEvents,
  filteredCount,
  categories
}: EventFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getPeriodFromDateRange = (start: string, end: string): string => {
    if (!start || !end) return ''
    
    const now = new Date()
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

  const handleCategoryChange = (value: string) => {
    onFilterChange({
      ...filters,
      accessibility: value
    })
  }

  const handlePeriodChange = (value: string) => {
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
  }

  const hasActiveFilters = Boolean(
    filters.dateRange.start || 
    filters.dateRange.end || 
    filters.location ||
    filters.accessibility
  )

  return (
    <div className="bg-white rounded-4xl shadow-xl border border-gray-100 p-8 transition-all hover:shadow-2xl duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <span className="w-1.5 h-8 bg-red-600 rounded-full inline-block"></span>
            Filter Events
          </h2>
          <p className="text-sm text-gray-500 mt-1 ml-4">
            Menampilkan <span className="font-bold text-red-600">{filteredCount}</span> dari{' '}
            <span className="font-semibold text-gray-700">{totalEvents}</span> event tersedia
          </p>
        </div>
        
        <div className="flex items-center space-x-3 ml-4 lg:ml-0">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="group flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-red-200"
            >
              <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Reset Filter
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-300 border border-transparent hover:border-red-100 ${isExpanded ? 'bg-red-50 text-red-600 rotate-180' : ''}`}
            aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
          >
            <svg 
              className="w-5 h-5 transform transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-2">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-hover:text-red-500 transition-colors duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari Lokasi..."
            value={filters.location}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full pl-14 pr-5 py-4 bg-gray-50/50 hover:bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all duration-300 hover:border-red-200 shadow-sm"
          />
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-hover:text-red-500 transition-colors duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <select 
            value={filters.accessibility}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full pl-14 pr-10 py-4 bg-gray-50/50 hover:bg-white border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all duration-300 appearance-none hover:border-red-200 cursor-pointer shadow-sm"
          >
            <option value="" className="text-gray-400">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="text-gray-900 py-2">
                {cat.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-gray-400 group-hover:text-red-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-hover:text-red-500 transition-colors duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <select 
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="w-full pl-14 pr-10 py-4 bg-gray-50/50 hover:bg-white border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all duration-300 appearance-none hover:border-red-200 cursor-pointer shadow-sm"
          >
            <option value="" className="text-gray-400">Waktu Pelaksanaan</option>
            <option value="week" className="text-gray-900">Minggu Ini</option>
            <option value="month" className="text-gray-900">Bulan Ini</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-gray-400 group-hover:text-red-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Custom Date Range */}
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'
        }`}
      >
        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide opacity-70 text-center flex items-center justify-center gap-2">
            {/* PERBAIKAN: h-[1px] -> h-px */}
            <span className="w-8 h-px bg-red-200"></span>
            Rentang Tanggal Custom
            {/* PERBAIKAN: h-[1px] -> h-px */}
            <span className="w-8 h-px bg-red-200"></span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="space-y-2 group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-red-500 transition-colors">
                Dari Tanggal
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all duration-300 hover:border-red-200 shadow-sm cursor-pointer"
                />
              </div>
            </div>
            <div className="space-y-2 group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-red-500 transition-colors">
                Sampai Tanggal
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all duration-300 hover:border-red-200 shadow-sm cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}