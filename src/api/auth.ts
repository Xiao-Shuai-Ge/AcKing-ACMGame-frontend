import request from './request'

export interface LoginReq {
  email: string
  password: string
}

export interface RegisterReq {
  email: string
  password: string
  username: string
  avatar_url?: string
  rating?: number
}

export interface UserInfo {
  id: string
  email: string
  username: string
  avatar_url: string
  rating: number
}

export interface LoginResp {
  token: string
  user: UserInfo
}

export const login = (data: LoginReq) => {
  return request<any, LoginResp>({
    url: '/login/login',
    method: 'post',
    data,
  })
}

export const register = (data: RegisterReq) => {
  return request<any, any>({
    url: '/login/register',
    method: 'post',
    data,
  })
}
