import request from './request'

export interface LoginReq {
  email: string
  password: string
}

export interface RegisterReq {
  email: string
  code: string
  password: string
  username: string
}

export interface SendCodeReq {
  email: string
}

export const sendCode = (data: SendCodeReq) => {
  return request<any, any>({
    url: '/login/send-code',
    method: 'post',
    data,
  })
}

export interface UserInfo {
  id: string
  email: string
  username: string
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

export interface GetProfileResp {
  id: string
  email: string
  username: string
  rating: number
}

export interface UpdateProfileReq {
  username: string
}

export const getProfile = () => {
  return request<any, GetProfileResp>({
    url: '/common/profile',
    method: 'get',
  })
}

export const updateProfile = (data: UpdateProfileReq) => {
  return request<any, any>({
    url: '/common/profile',
    method: 'post',
    data,
  })
}
