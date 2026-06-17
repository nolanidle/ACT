/**
 * Shared formatting utilities for ACTstroyds.
 */

/**
 * Format seconds as "M:SS" or "H:MM:SS".
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Format ISO date string as "Jun 17, 2026".
 * @param {string} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

/**
 * Format ISO date string as a relative label: "just now", "2 hours ago", "3 days ago", etc.
 * @param {string} dateStr
 * @returns {string}
 */
export function formatRelative(dateStr) {
  if (!dateStr) return ''
  try {
    const now = Date.now()
    const then = new Date(dateStr).getTime()
    const diff = Math.floor((now - then) / 1000) // seconds

    if (diff < 60) return 'just now'
    if (diff < 3600) {
      const m = Math.floor(diff / 60)
      return `${m} ${m === 1 ? 'minute' : 'minutes'} ago`
    }
    if (diff < 86400) {
      const h = Math.floor(diff / 3600)
      return `${h} ${h === 1 ? 'hour' : 'hours'} ago`
    }
    if (diff < 604800) {
      const d = Math.floor(diff / 86400)
      return `${d} ${d === 1 ? 'day' : 'days'} ago`
    }
    if (diff < 2592000) {
      const w = Math.floor(diff / 604800)
      return `${w} ${w === 1 ? 'week' : 'weeks'} ago`
    }
    return formatDate(dateStr)
  } catch {
    return dateStr
  }
}

/**
 * Capitalize the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Truncate a string to `len` characters, adding ellipsis if needed.
 * @param {string} str
 * @param {number} len
 * @returns {string}
 */
export function truncate(str, len = 80) {
  if (!str) return ''
  if (str.length <= len) return str
  return str.slice(0, len).trimEnd() + '…'
}

/**
 * Return Tailwind text color class for difficulty level.
 * @param {string} d - 'easy' | 'medium' | 'hard'
 * @returns {string}
 */
export function difficultyColor(d) {
  switch ((d || '').toLowerCase()) {
    case 'easy':
      return 'text-emerald-400'
    case 'medium':
      return 'text-amber-400'
    case 'hard':
      return 'text-rose-400'
    default:
      return 'text-slate-400'
  }
}

/**
 * Return Tailwind color classes for mastery level badge/text.
 * @param {string} level
 * @returns {string}
 */
export function masteryColor(level) {
  switch ((level || '').toLowerCase()) {
    case 'not_started':
      return 'text-slate-400 bg-slate-700/40 border-slate-600/40'
    case 'learning':
      return 'text-rose-400 bg-rose-500/20 border-rose-500/30'
    case 'practicing':
      return 'text-amber-400 bg-amber-500/20 border-amber-500/30'
    case 'proficient':
      return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    case 'mastered':
      return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
    default:
      return 'text-slate-400 bg-slate-700/40 border-slate-600/40'
  }
}

/**
 * Return a human-readable label for mastery level.
 * @param {string} level
 * @returns {string}
 */
export function masteryLabel(level) {
  switch ((level || '').toLowerCase()) {
    case 'not_started':
      return 'Not Started'
    case 'learning':
      return 'Learning'
    case 'practicing':
      return 'Practicing'
    case 'proficient':
      return 'Proficient'
    case 'mastered':
      return 'Mastered'
    default:
      return capitalize(level || 'Unknown')
  }
}

/**
 * Format a number as a compact string (e.g. 1200 → "1.2K").
 * @param {number} n
 * @returns {string}
 */
export function formatNumber(n) {
  if (n === null || n === undefined) return '0'
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}
