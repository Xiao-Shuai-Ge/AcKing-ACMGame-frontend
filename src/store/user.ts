import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getProfile, type LoginReq, type UserInfo } from '../api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  const login = async (data: LoginReq) => {
    const res = await loginApi(data)
    
    token.value = res.token
    userInfo.value = res.user
    
    localStorage.setItem('token', res.token)
    localStorage.setItem('userInfo', JSON.stringify(res.user))
  }

  const fetchUserInfo = async () => {
    try {
      const res = await getProfile()
      userInfo.value = res
      localStorage.setItem('userInfo', JSON.stringify(res))
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      // Optional: if fetch fails (e.g. 401), logout might happen automatically via interceptor
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    login,
    logout,
    fetchUserInfo,
  }
})
