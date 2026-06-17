import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

/**
 * Fetches all progress data for the current user.
 * Returns dashboard summary, score trend, and per-skill data.
 */
export function useProgress() {
  const [dashboard, setDashboard] = useState(null)
  const [trend, setTrend] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [dashRes, trendRes, skillsRes] = await Promise.all([
        api.get('/progress/dashboard'),
        api.get('/progress/score-trend'),
        api.get('/progress/skills'),
      ])
      setDashboard(dashRes.data)
      setTrend(trendRes.data)
      setSkills(skillsRes.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load progress data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return { dashboard, trend, skills, loading, error, refetch: fetchAll }
}

export default useProgress
