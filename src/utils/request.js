import axios from 'axios'
import { getToken } from '@/utils/auth'
import { Loading, Message } from 'element-ui'
import store from '@/store'
import router from '@/router'

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 10000
})

let activeAxios = 0
let loadingInstance
let timer
const showLoading = () => {
  activeAxios++
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
    if (activeAxios > 0) {
      loadingInstance = Loading.service({ fullscreen: true })
    }
  }, 400)
}

const closeLoading = () => {
  activeAxios--
  if (activeAxios <= 0) {
    clearTimeout(timer)
    loadingInstance && loadingInstance.close()
  }
}

// request interceptor
service.interceptors.request.use(
  config => {
    showLoading()
    const token = getToken()
    config.data = JSON.stringify(config.data)
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  error => {
    closeLoading()
    Message({
      showClose: true,
      message: error,
      type: 'error'
    })
    return Promise.reject(error)
  }
)

// reponse interceptor
service.interceptors.response.use(
  response => {
    closeLoading()
    if (response.data.code === 200 || response.headers.success === 'true') {
      return response.data
    } else {
      Message({
        showClose: true,
        message: response.data.error.message,
        type: 'error'
      })
      return Promise.reject(response.data)
    }
  },
  error => {
    if (error.message === 'Network Error') {
      Message({
        message: '服务器连接异常，请检查服务器！',
        type: 'error',
        duration: 5 * 1000
      })
    }

    const { response } = error
    const { status, data } = response
    if (status === 401 && data.data.error.code === 9999) {
      store.dispatch('user/logout').then(() => {
        Message({
          message: '登陆过期,请重新登陆',
          type: 'error',
          duration: 5 * 1000
        })
        // 跳转到登陆页面
        router.push({
          path: '/login'
        })
      })
    }
    closeLoading()
    Message({
      showClose: true,
      message: data.data.error.message,
      type: 'error'
    })
    return Promise.reject(error)
  }
)

export default service
