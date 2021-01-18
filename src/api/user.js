import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/api/v1/pub/login',
    method: 'post',
    data
  })
}

export function getUserInfo() {
  return request({
    url: '/api/v1/pub/current/user',
    method: 'get'
  })
}

export function getUserMenu() {
  return request({
    url: '/api/v1/pub/current/menutree',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/api/v1/pub/login/exit',
    method: 'post'
  })
}
