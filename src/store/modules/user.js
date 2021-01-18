import { login, getUserInfo, logout } from '@/api/user'
import { getToken, setToken, removeToken, clear } from '@/utils/auth'

const state = {
  token: getToken(),
  expiresAt: '',
  userInfo: {
    userid: '',
    username: '',
    real_name: '',
    role: []
  }
}
const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
  },
  SET_USERINFO(state, userInfo) {
    state.userInfo = userInfo
  },
  SET_EXPIRESAt(state, expiresAt) {
    state.expiresAt = expiresAt
  }
}
const actions = {
  login({ commit }, loginInfo) {
    return new Promise((resolve, reject) => {
      login(loginInfo)
        .then(res => {
          if (res.code === 200) {
            const token = res.data.access_token
            const expiresAt = res.data.expires_at
            commit('SET_TOKEN', token)
            commit('SET_EXPIRESAt', expiresAt)
            setToken(token)
            // 获取用户信息
            return getUserInfo()
          }
        })
        .then(info => {
          if (info.code === 200) {
            commit('SET_USERINFO', info.data)
          }
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // exiting
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token)
        .then(() => {
          commit('SET_TOKEN', '')
          removeToken()
          clear()
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
