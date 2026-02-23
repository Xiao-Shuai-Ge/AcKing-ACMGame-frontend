import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, type LoginReq, type UserInfo } from '../api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  const login = async (data: LoginReq) => {
    const res = await loginApi(data)
    // Assuming the structure is { token: '...', user: { ... } }
    // But my request interceptor returns res.data.
    // If backend returns { code: 20000, data: { token: ..., user: ... } }
    // Then res is { token: ..., user: ... }
    
    token.value = res.token
    userInfo.value = res.user
    
    localStorage.setItem('token', res.token)
    localStorage.setItem('userInfo', JSON.stringify(res.user))
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
  }
})
