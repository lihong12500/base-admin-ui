import request from '@/utils/request'

// 查询用户列表
export function getUserList(query) {
  return request({
    url: '/api/v1/users',
    method: 'get',
    params: query
  })
}

// 添加用户列表
export function addUser(data) {
  return request({
    url: '/api/v1/users',
    method: 'post',
    data: data
  })
}

// 修改用户
export function updateUser(data, userId) {
  return request({
    url: '/api/v1/users/' + userId,
    method: 'put',
    data: data
  })
}

// 根据id查找用户
export function getUserById(userId) {
  return request({
    url: '/api/v1/users/' + userId,
    method: 'get'
  })
}

// 修改用户状态
export function changeStatusById(userId, flag) {
  const status = flag !== 1 ? 'enable' : 'disable'
  return request({
    url: '/api/v1/users/' + userId + '/' + status,
    method: 'patch'
  })
}

// 删除用户
export function deleteUser(userId) {
  return request({
    url: '/api/v1/users/' + userId,
    method: 'delete'
  })
}
