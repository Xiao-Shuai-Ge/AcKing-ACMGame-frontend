import axios from 'axios'
import { ElMessage } from 'element-plus'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const service = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 如果存在 token，则添加到请求头中
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 根据后端响应结构进行调整
    if (res.code !== 20000) { // 假设 20000 表示成功
        // 如果需要，可以处理特定的错误代码
        ElMessage.error(res.message || '错误')
        return Promise.reject(new Error(res.message || '错误'))
    }
    return res.data
  },
  (error) => {
    ElMessage.error(error.message || '请求错误')
    return Promise.reject(error)
  }
)

export default service
