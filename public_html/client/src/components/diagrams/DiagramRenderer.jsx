import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const CHART_COLORS = {
  blue: '#3b82f6',
  violet: '#7c3aed',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
}

const darkChartOptions = (extraOptions = {}) => ({
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { size: 12 } },
    },
    tooltip: {
      backgroundColor: '#1a2236',
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      borderColor: '#2d3a4f',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: { color: '#64748b' },
      grid: { color: '#2d3a4f' },
    },
    y: {
      ticks: { color: '#64748b' },
      grid: { color: '#2d3a4f' },
    },
  },
  ...extraOptions,
})

/* ─── Table ─────────────────────────────────────────────────── */
function TableDiagram({ data }) {
  const { headers = [], rows = [] } = data || {}
  return (
    <div className="overflow-x-auto rounded-xl border border-space-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-space-surface border-b border-space-border">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-space-border/50 hover:bg-white/2 transition-colors"
            >
              {(Array.isArray(row) ? row : Object.values(row)).map((cell, ci) => (
                <td key={ci} className="px-4 py-2.5 text-slate-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─── Coordinate Plane ───────────────────────────────────────── */
function CoordinatePlane({ data }) {
  const {
    elements = [],
    xRange = [-6, 6],
    yRange = [-6, 6],
    width = 300,
    height = 300,
  } = data || {}

  const pad = 30
  const w = width
  const h = height
  const [xMin, xMax] = xRange
  const [yMin, yMax] = yRange

  function toSvgX(x) {
    return pad + ((x - xMin) / (xMax - xMin)) * (w - 2 * pad)
  }
  function toSvgY(y) {
    return h - pad - ((y - yMin) / (yMax - yMin)) * (h - 2 * pad)
  }

  const originX = toSvgX(0)
  const originY = toSvgY(0)

  // Grid lines
  const xTicks = []
  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
    xTicks.push(x)
  }
  const yTicks = []
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
    yTicks.push(y)
  }

  return (
    <div className="flex justify-center">
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className="rounded-xl bg-space-surface border border-space-border"
      >
        {/* Grid */}
        {xTicks.map((x) => (
          <line
            key={`gx${x}`}
            x1={toSvgX(x)}
            y1={pad}
            x2={toSvgX(x)}
            y2={h - pad}
            stroke="#2d3a4f"
            strokeWidth={1}
          />
        ))}
        {yTicks.map((y) => (
          <line
            key={`gy${y}`}
            x1={pad}
            y1={toSvgY(y)}
            x2={w - pad}
            y2={toSvgY(y)}
            stroke="#2d3a4f"
            strokeWidth={1}
          />
        ))}

        {/* Axes */}
        <line x1={pad} y1={originY} x2={w - pad} y2={originY} stroke="#4a5568" strokeWidth={1.5} />
        <line x1={originX} y1={pad} x2={originX} y2={h - pad} stroke="#4a5568" strokeWidth={1.5} />

        {/* Tick labels */}
        {xTicks
          .filter((x) => x !== 0)
          .map((x) => (
            <text
              key={`tx${x}`}
              x={toSvgX(x)}
              y={originY + 14}
              textAnchor="middle"
              fontSize={9}
              fill="#64748b"
            >
              {x}
            </text>
          ))}
        {yTicks
          .filter((y) => y !== 0)
          .map((y) => (
            <text
              key={`ty${y}`}
              x={originX - 10}
              y={toSvgY(y) + 4}
              textAnchor="end"
              fontSize={9}
              fill="#64748b"
            >
              {y}
            </text>
          ))}

        {/* Axis labels */}
        <text x={w - pad + 10} y={originY + 4} fontSize={11} fill="#94a3b8" textAnchor="start">
          x
        </text>
        <text x={originX + 4} y={pad - 8} fontSize={11} fill="#94a3b8" textAnchor="start">
          y
        </text>

        {/* Elements */}
        {elements.map((el, i) => {
          switch (el.type) {
            case 'line': {
              // { type:'line', x1, y1, x2, y2, color? }
              return (
                <line
                  key={i}
                  x1={toSvgX(el.x1)}
                  y1={toSvgY(el.y1)}
                  x2={toSvgX(el.x2)}
                  y2={toSvgY(el.y2)}
                  stroke={el.color || '#3b82f6'}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              )
            }
            case 'point': {
              // { type:'point', x, y, color?, label? }
              return (
                <g key={i}>
                  <circle
                    cx={toSvgX(el.x)}
                    cy={toSvgY(el.y)}
                    r={4}
                    fill={el.color || '#60a5fa'}
                    stroke="#0a0e1a"
                    strokeWidth={1.5}
                  />
                  {el.label && (
                    <text
                      x={toSvgX(el.x) + 8}
                      y={toSvgY(el.y) - 5}
                      fontSize={10}
                      fill={el.color || '#94a3b8'}
                    >
                      {el.label}
                    </text>
                  )}
                </g>
              )
            }
            case 'label': {
              // { type:'label', x, y, text, color? }
              return (
                <text
                  key={i}
                  x={toSvgX(el.x)}
                  y={toSvgY(el.y)}
                  fontSize={11}
                  fill={el.color || '#94a3b8'}
                  textAnchor="middle"
                >
                  {el.text}
                </text>
              )
            }
            case 'segment': {
              return (
                <line
                  key={i}
                  x1={toSvgX(el.x1)}
                  y1={toSvgY(el.y1)}
                  x2={toSvgX(el.x2)}
                  y2={toSvgY(el.y2)}
                  stroke={el.color || '#a78bfa'}
                  strokeWidth={2}
                  strokeDasharray={el.dashed ? '5,3' : undefined}
                />
              )
            }
            default:
              return null
          }
        })}
      </svg>
    </div>
  )
}

/* ─── Rectangle ─────────────────────────────────────────────── */
function RectangleDiagram({ data }) {
  const { width = 120, height = 80, widthLabel, heightLabel, color = '#3b82f6' } = data || {}
  const svgW = 200
  const svgH = 160
  const pad = 40
  const rectW = svgW - 2 * pad
  const rectH = svgH - 2 * pad

  return (
    <div className="flex justify-center">
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
        <rect
          x={pad}
          y={pad}
          width={rectW}
          height={rectH}
          fill={color + '20'}
          stroke={color}
          strokeWidth={2}
          rx={3}
        />
        {/* Width label */}
        <text
          x={svgW / 2}
          y={svgH - 10}
          textAnchor="middle"
          fontSize={12}
          fill="#94a3b8"
        >
          {widthLabel || width}
        </text>
        {/* Height label */}
        <text
          x={12}
          y={svgH / 2}
          textAnchor="middle"
          fontSize={12}
          fill="#94a3b8"
          transform={`rotate(-90, 12, ${svgH / 2})`}
        >
          {heightLabel || height}
        </text>
      </svg>
    </div>
  )
}

/* ─── Circle ─────────────────────────────────────────────────── */
function CircleDiagram({ data }) {
  const { radius, radiusLabel, color = '#7c3aed' } = data || {}
  const svgS = 180
  const cx = svgS / 2
  const cy = svgS / 2
  const r = 60

  return (
    <div className="flex justify-center">
      <svg width={svgS} height={svgS} viewBox={`0 0 ${svgS} ${svgS}`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={color + '18'}
          stroke={color}
          strokeWidth={2}
        />
        {/* Radius line */}
        <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={color} strokeWidth={1.5} strokeDasharray="4,2" />
        <circle cx={cx} cy={cy} r={3} fill={color} />
        <text x={cx + r / 2} y={cy - 6} textAnchor="middle" fontSize={11} fill="#94a3b8">
          {radiusLabel || `r = ${radius}`}
        </text>
      </svg>
    </div>
  )
}

/* ─── Line Chart ─────────────────────────────────────────────── */
function LineChartDiagram({ data }) {
  const { labels = [], datasets = [] } = data || {}
  const chartData = {
    labels,
    datasets: datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      borderColor: Object.values(CHART_COLORS)[i % 5],
      backgroundColor: Object.values(CHART_COLORS)[i % 5] + '20',
      tension: 0.4,
      fill: ds.fill || false,
      pointBackgroundColor: Object.values(CHART_COLORS)[i % 5],
      pointRadius: 4,
    })),
  }
  return (
    <div className="p-3 rounded-xl bg-space-surface border border-space-border">
      <Line data={chartData} options={darkChartOptions()} />
    </div>
  )
}

/* ─── Bar Chart ─────────────────────────────────────────────── */
function BarChartDiagram({ data }) {
  const { labels = [], datasets = [] } = data || {}
  const chartData = {
    labels,
    datasets: datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: Object.values(CHART_COLORS)[i % 5] + 'cc',
      borderColor: Object.values(CHART_COLORS)[i % 5],
      borderWidth: 1,
      borderRadius: 4,
    })),
  }
  return (
    <div className="p-3 rounded-xl bg-space-surface border border-space-border">
      <Bar data={chartData} options={darkChartOptions()} />
    </div>
  )
}

/* ─── Main Switcher ──────────────────────────────────────────── */
/**
 * Renders a visual/diagram based on visual.type.
 *
 * @param {{ type: string, [key: string]: any }} visual - the visual_json object
 * @param {string} className
 */
export default function DiagramRenderer({ visual, className = '' }) {
  if (!visual || !visual.type) return null

  let content
  switch (visual.type) {
    case 'table':
      content = <TableDiagram data={visual} />
      break
    case 'coordinate_plane':
      content = <CoordinatePlane data={visual} />
      break
    case 'line_chart':
      content = <LineChartDiagram data={visual} />
      break
    case 'bar_chart':
      content = <BarChartDiagram data={visual} />
      break
    case 'rectangle':
      content = <RectangleDiagram data={visual} />
      break
    case 'circle':
      content = <CircleDiagram data={visual} />
      break
    default:
      content = (
        <div className="text-xs text-slate-500 italic p-3">
          [Diagram type "{visual.type}" not supported]
        </div>
      )
  }

  return (
    <div className={`diagram-renderer my-4 ${className}`}>
      {visual.caption && (
        <p className="text-xs text-slate-500 text-center mb-2 italic">{visual.caption}</p>
      )}
      {content}
    </div>
  )
}
