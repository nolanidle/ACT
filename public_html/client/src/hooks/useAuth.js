import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import useAuthStore from '../store/authStore'

export function useAuth() {
  const { user, accessToken, isAuthenticated, setAuth, setToken, clearAuth } =
    useAuthStore()
  const navigate = useNavigate()

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    setAuth(data.user, data.accessToken)
    return data
  }, [setAuth])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore errors on logout
    } finally {
      clearAuth()
      navigate('/login')
    }
  }, [clearAuth, navigate])

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    setAuth(data.user, data.accessToken)
    return data
  }, [setAuth])

  const refresh = useCallback(async () => {
    const { data } = await api.post('/auth/refresh')
    setToken(data.accessToken)
    return data.accessToken
  }, [setToken])

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.post('/auth/refresh')
      // Also fetch the current user profile
      const profileRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${data.accessToken}` },
      })
      setAuth(profileRes.data.user || profileRes.data, data.accessToken)
    } catch {
      clearAuth()
    }
  }, [setAuth, clearAuth])

  return {
    user,
    accessToken,
    isAuthenticated,
    login,
    logout,
    register,
    refresh,
    checkAuth,
  }
}

export default useAuth
