import storage from './storage'
const TokenKey = 'Badmin-Token'

export function getToken() {
  return storage.get(TokenKey)
}

export function setToken(token) {
  return storage.set(TokenKey, token)
}

export function removeToken() {
  return storage.remove(TokenKey)
}

export function clear() {
  return storage.clear()
}
