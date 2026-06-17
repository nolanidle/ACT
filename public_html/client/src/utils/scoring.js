/**
 * ACT raw-to-scale score conversion utilities.
 * Lookup tables approximate the official ACT conversion charts.
 */

// English: 75 questions → scale 1-36
const englishTable = [1,1,1,2,3,4,5,6,7,8,9,10,11,12,12,13,14,14,15,15,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,30,30,31,31,32,32,33,33,34,34,35,35,35,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36]

// Math: 60 questions → scale 1-36
const mathTable = [1,1,1,1,2,3,4,5,6,7,8,9,10,10,11,12,13,13,14,15,15,16,16,17,17,18,18,19,19,20,20,21,21,22,23,23,24,24,25,25,26,27,27,28,28,29,29,30,30,31,32,32,33,33,34,34,35,35,36,36,36]

// Reading: 40 questions → scale 1-36
const readingTable = [1,1,2,3,5,6,7,9,10,11,12,13,14,15,16,17,18,18,19,20,21,22,23,24,25,25,26,27,28,29,30,30,31,32,33,33,34,35,35,36,36]

// Science: 40 questions → scale 1-36
const scienceTable = [1,1,2,3,4,5,7,8,9,10,11,12,13,14,15,15,16,17,18,19,19,20,21,22,23,24,24,25,26,27,28,28,29,30,31,32,33,34,35,36,36]

/**
 * Convert raw score to ACT scale score (1-36).
 * @param {string} section - 'english' | 'math' | 'reading' | 'science'
 * @param {number} rawScore - number of correct answers
 * @returns {number} scale score 1-36
 */
export function rawToScale(section, rawScore) {
  const raw = Math.max(0, Math.round(rawScore))

  switch (section.toLowerCase()) {
    case 'english': {
      const idx = Math.min(raw, englishTable.length - 1)
      return englishTable[idx]
    }
    case 'math': {
      const idx = Math.min(raw, mathTable.length - 1)
      return mathTable[idx]
    }
    case 'reading': {
      const idx = Math.min(raw, readingTable.length - 1)
      return readingTable[idx]
    }
    case 'science': {
      const idx = Math.min(raw, scienceTable.length - 1)
      return scienceTable[idx]
    }
    default:
      return 1
  }
}

/**
 * Compute ACT composite from four section scale scores.
 * @param {{ english: number, math: number, reading: number, science: number }} scores
 * @returns {number} composite score 1-36
 */
export function compositeScore({ english = 0, math = 0, reading = 0, science = 0 }) {
  const avg = (english + math + reading + science) / 4
  return Math.round(avg)
}

/**
 * Return a Tailwind color class based on the ACT scale score.
 * @param {number} score
 * @returns {string}
 */
export function getScoreColor(score) {
  if (score >= 31) return 'text-emerald-400'
  if (score >= 25) return 'text-brand-blue-light'
  if (score >= 18) return 'text-amber-400'
  return 'text-rose-400'
}

/**
 * Return a background color class for score badges.
 * @param {number} score
 * @returns {string}
 */
export function getScoreBgColor(score) {
  if (score >= 31) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  if (score >= 25) return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  if (score >= 18) return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
}

/**
 * Percentage correct for a section.
 */
export function accuracyPercent(correct, total) {
  if (!total) return 0
  return Math.round((correct / total) * 100)
}
