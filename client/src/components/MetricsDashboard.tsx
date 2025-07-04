'use client'

import { useEffect, useState } from 'react'
import MetricsDataService from '../services/metrics'

type Metric = {
  id: string
  name: string
  value: number
  delta?: number
  metricId: string
  userId?: string
  timestamp: string
}

type MetricInsight = {
  rating: 'good' | 'needs-improvement' | 'poor'
  message: string
  suggestions: string[]
}

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'timestamp' | 'value'>('timestamp')

  const getPerformanceRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    switch (name) {
      case 'LCP': // Largest Contentful Paint (ms)
        return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor'
      case 'FCP': // First Contentful Paint (ms)
        return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor'
      case 'INP': // Interaction to Next Paint (ms)
        return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor'
      case 'CLS': // Cumulative Layout Shift (unitless)
        return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor'
      case 'TTFB': // Time to First Byte (ms)
        return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor'
      default:
        return 'good'
    }
  }

  const getMetricInsights = (name: string, value: number): MetricInsight => {
    const rating = getPerformanceRating(name, value)
    
    switch (name) {
      case 'LCP':
        if (rating === 'poor') {
          return {
            rating,
            message: `LCP of ${(value/1000).toFixed(1)}s is too slow`,
            suggestions: [
              'Optimize largest image (compress, use WebP/AVIF, add sizes attribute)',
              'Preload critical resources with <link rel="preload">',
              'Remove unused JavaScript and CSS',
              'Use a CDN for faster content delivery',
              'Check for slow server response times'
            ]
          }
        } else if (rating === 'needs-improvement') {
          return {
            rating,
            message: `LCP of ${(value/1000).toFixed(1)}s could be faster`,
            suggestions: [
              'Optimize images (compression, modern formats)',
              'Preload key resources',
              'Minimize render-blocking resources'
            ]
          }
        }
        return { rating, message: `LCP of ${(value/1000).toFixed(1)}s is good`, suggestions: [] }
      
      case 'FCP':
        if (rating === 'poor') {
          return {
            rating,
            message: `FCP of ${(value/1000).toFixed(1)}s is too slow`,
            suggestions: [
              'Eliminate render-blocking CSS and JavaScript',
              'Minify CSS and JavaScript',
              'Remove unused code',
              'Use critical CSS inlining'
            ]
          }
        }
        return { rating, message: `FCP of ${(value/1000).toFixed(1)}s`, suggestions: [] }
      
      case 'CLS':
        if (rating === 'poor') {
          return {
            rating,
            message: `CLS of ${value.toFixed(3)} indicates layout instability`,
            suggestions: [
              'Add width/height attributes to images and videos',
              'Reserve space for ads and dynamic content',
              'Avoid inserting content above existing content',
              'Use transform animations instead of animating layout properties'
            ]
          }
        }
        return { rating, message: `CLS of ${value.toFixed(3)}`, suggestions: [] }
      
      case 'INP':
        if (rating === 'poor') {
          return {
            rating,
            message: `INP of ${value.toFixed(0)}ms indicates slow interactions`,
            suggestions: [
              'Break up long JavaScript tasks',
              'Optimize event handlers',
              'Use web workers for heavy computations',
              'Debounce frequent events'
            ]
          }
        }
        return { rating, message: `INP of ${value.toFixed(0)}ms`, suggestions: [] }
      
      case 'TTFB':
        if (rating === 'poor') {
          return {
            rating,
            message: `TTFB of ${value.toFixed(0)}ms indicates slow server response`,
            suggestions: [
              'Optimize server response time',
              'Use a CDN',
              'Enable server-side caching',
              'Optimize database queries'
            ]
          }
        }
        return { rating, message: `TTFB of ${value.toFixed(0)}ms`, suggestions: [] }
      
      default:
        return { rating, message: '', suggestions: [] }
    }
  }

  const getRowClassName = (rating: string): string => {
    switch (rating) {
      case 'good':
        return 'bg-green-50 border-green-200'
      case 'needs-improvement':
        return 'bg-yellow-50 border-yellow-200'
      case 'poor':
        return 'bg-red-50 border-red-200'
      default:
        return ''
    }
  }

  useEffect(() => {
    let isMounted = true

    async function fetchMetrics() {
      try {
         const response = await MetricsDataService.getMetrics()
         console.log('Fetched metrics:', response.data)
         if (isMounted) {
           setMetrics(response.data)
         }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load metrics')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchMetrics()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) return <p>Loading metrics...</p>
  if (error) return <p className="text-red-600">{error}</p>

  const filteredMetrics = metrics
    .filter(m => selectedMetric === 'all' || m.name === selectedMetric)
    .sort((a, b) => {
      if (sortBy === 'value') {
        return b.value - a.value // Sort by value descending (worst first)
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime() // Sort by timestamp descending
    })

  const problemMetrics = metrics.filter(m => getPerformanceRating(m.name, m.value) === 'poor')
  const uniqueMetricNames = [...new Set(metrics.map(m => m.name))]

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Web Performance Metrics</h2>
      
      {/* Performance Summary */}
      {problemMetrics.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ Performance Issues Detected</h3>
          <p className="text-red-700 mb-3">
            {problemMetrics.length} metric{problemMetrics.length > 1 ? 's' : ''} need{problemMetrics.length === 1 ? 's' : ''} attention
          </p>
          {problemMetrics.slice(0, 3).map(m => {
            const insights = getMetricInsights(m.name, m.value)
            return (
              <div key={m.id} className="mb-3 p-3 bg-white rounded border">
                <div className="font-medium text-red-800">{insights.message}</div>
                <div className="text-sm text-red-600 mt-1">
                  <strong>Quick fixes:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {insights.suggestions.slice(0, 2).map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex gap-4 items-center flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by metric:</label>
          <select 
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="all">All metrics</option>
            {uniqueMetricNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'value')}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="timestamp">Most recent</option>
            <option value="value">Worst performance</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Metric</th>
              <th className="px-3 py-2 text-left">Value</th>
              <th className="px-3 py-2 text-left">Rating</th>
              <th className="px-3 py-2 text-left">Delta</th>
              <th className="px-3 py-2 text-left">User</th>
              <th className="px-3 py-2 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredMetrics.map((m) => {
              const rating = getPerformanceRating(m.name, m.value)
              const rowClassName = getRowClassName(rating)
              const insights = getMetricInsights(m.name, m.value)
              
              return (
                <tr key={m.id} className={`border-t ${rowClassName}`}>
                  <td className="px-3 py-2 font-medium">{m.name}</td>
                  <td className="px-3 py-2">
                    <div>{m.value.toFixed(2)}</div>
                    {insights.message && (
                      <div className="text-xs text-gray-600 mt-1">{insights.message}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rating === 'good' ? 'bg-green-100 text-green-800' :
                      rating === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {rating === 'good' ? '✓ Good' : 
                       rating === 'needs-improvement' ? '⚠ Needs Work' : 
                       '✗ Poor'}
                    </span>
                  </td>
                  <td className="px-3 py-2">{m.delta?.toFixed(2) ?? '—'}</td>
                  <td className="px-3 py-2">{m.userId || 'Anonymous'}</td>
                  <td className="px-3 py-2">{new Date(m.timestamp).toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        
        {filteredMetrics.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No metrics found for the selected filter.
          </div>
        )}
      </div>
    </div>
  )
}
