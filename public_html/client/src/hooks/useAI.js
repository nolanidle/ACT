import { useState, useCallback } from 'react'
import api from '../utils/api'

/**
 * Generic hook for AI generation API calls.
 * @param {string} endpoint - the API path to POST to
 * @returns {{ generate: Function, loading: boolean, error: string|null, data: any }}
 */
export function useAI(endpoint) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const generate = useCallback(
    async (payload) => {
      setLoading(true)
      setError(null)
      try {
        const { data: responseData } = await api.post(endpoint, payload)
        setData(responseData)
        return responseData
      } catch (err) {
        const msg =
          err?.response?.data?.message || err?.message || 'AI generation failed.'
        setError(msg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [endpoint]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
  }, [])

  return { generate, loading, error, data, reset }
}

export default useAI
