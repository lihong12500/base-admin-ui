import request from '@/utils/request'

// 获取验证码
export function getCodeId() {
  return request({
    url: '/api/v1/pub/login/captchaid',
    method: 'get'
  })
}
