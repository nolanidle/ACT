import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { formatDate } from '../../utils/formatters'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const SECTION_COLORS = {
  english: { border: '#3b82f6', bg: '#3b82f620' },
  math: { border: '#7c3aed', bg: '#7c3aed20' },
  reading: { border: '#10b981', bg: '#10b98120' },
  science: { border: '#f59e0b', bg: '#f59e0b20' },
  composite: { border: '#f1f5f9', bg: '#f1f5f910' },
}

/**
 * Chart.js Line chart showing ACT score trend over time.
 *
 * @param {Array<{date: string, score: number, section: string}>} data
 * @param {string} className
 */
export default function ScoreTrend({ data = [], className = '' }) {
  const { labels, datasets } = useMemo(() => {
    if (!data.length) return { labels: [], datasets: [] }

    // Group by section
    const bySection = {}
    const dateSet = new Set()

    data.forEach((d) => {
      const sect = (d.section || 'composite').toLowerCase()
      if (!bySection[sect]) bySection[sect] = {}
      bySection[sect][d.date] = d.score
      dateSet.add(d.date)
    })

    const sortedDates = Array.from(dateSet).sort()
    const labels = sortedDates.map((d) => formatDate(d))

    const datasets = Object.entries(bySection).map(([section, scoreMap]) => {
      const colors = SECTION_COLORS[section] || SECTION_COLORS.composite
      return {
        label: section.charAt(0).toUpperCase() + section.slice(1),
        data: sortedDates.map((d) => scoreMap[d] ?? null),
        borderColor: colors.border,
        backgroundColor: colors.bg,
        borderWidth: 2.5,
        pointBackgroundColor: colors.border,
        pointBorderColor: '#0a0e1a',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.35,
        fill: false,
        spanGaps: true,
      }
    })

    return { labels, datasets }
  }, [data])

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { size: 12 },
          padding: 20,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: '#1a2236',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#2d3a4f',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y ?? 'N/A'}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { size: 11 } },
        grid: { color: '#1e2a3a', lineWidth: 1 },
        border: { color: '#2d3a4f' },
      },
      y: {
        min: 1,
        max: 36,
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          stepSize: 6,
        },
        grid: { color: '#1e2a3a', lineWidth: 1 },
        border: { color: '#2d3a4f' },
      },
    },
  }

  if (!data.length) {
    return (
      <div className={`flex items-center justify-center h-48 text-slate-500 text-sm ${className}`}>
        No score data yet.
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-xl bg-space-surface border border-space-border ${className}`}>
      <Line data={{ labels, datasets }} options={options} />
    </div>
  )
}
