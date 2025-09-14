import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import api from '../lib/axios'

const AxiosAuthProvider = () => {
  const { getToken } = useAuth()

  useEffect(() => {
    const id = api.interceptors.request.use(async (config) => {
      try {
        const token = await getToken()
        if (token) {
          config.headers = config.headers || {}
          config.headers.Authorization = `Bearer ${token}`
          if (import.meta.env.MODE === 'development') {
            // eslint-disable-next-line no-console
            console.debug('[AxiosAuth] Attached token', token.slice(0, 12) + '...')
          }
        } else if (import.meta.env.MODE === 'development') {
          // eslint-disable-next-line no-console
          console.debug('[AxiosAuth] No token available')
        }
      } catch {}
      return config
    })
    return () => api.interceptors.request.eject(id)
  }, [getToken])

  return null
}

export default AxiosAuthProvider
