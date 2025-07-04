'use client'

import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useEffect, useState } from 'react'
import MetricsDataService from '../services/metrics'

type Metric = {
  id: string
  name: string
  value: number
  timestamp: string
}

export default function MetricsChart() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
         const response = await MetricsDataService.getMetrics()
         if (response.status !== 200) {
           throw new Error('Failed to fetch metrics')
         }
         const data: Metric[] = response.data
         console.log('Fetched metrics:', data)
        setMetrics(data)
      } catch (err) {
        setError('Failed to load chart data')
      }
    }
    fetchData()
  }, [])

  // Group metrics by name (e.g., LCP, FCP, INP)
  const seriesMap: { [key: string]: [number, number][] } = {}
  metrics.forEach((m) => {
    const ts = new Date(m.timestamp).getTime()
    if (!seriesMap[m.name]) seriesMap[m.name] = []
    seriesMap[m.name].push([ts, m.value])
  })

  const series = Object.entries(seriesMap).map(([name, data]) => ({
    type: 'line' as const,
    name,
    data: data.sort((a, b) => a[0] - b[0]), // sort by timestamp
  }))

  const options: Highcharts.Options = {
    title: { text: 'Web Performance Metrics Over Time' },
    xAxis: {
      type: 'datetime',
      title: { text: 'Time' },
    },
    yAxis: {
      title: { text: 'Metric Value (ms)' },
    },
    tooltip: {
      shared: true,
      xDateFormat: '%b %e, %Y %H:%M',
    },
    series: series,
    // chart: {
    //   zoomType: 'x',
    // },
  }

  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div className="mt-8">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  )
}
