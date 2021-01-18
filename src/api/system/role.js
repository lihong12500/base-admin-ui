import request from '@/utils/request'

// 查询角色列表
export function getRoleList(query) {
  return request({
    url: '/api/v1/roles.select',
    method: 'get',
    params: query
  })
}

// 查询角色列表
export function getRoles(query) {
  return request({
    url: '/api/v1/roles',
    method: 'get',
    params: query
  })
}

// 添加角色
export function addRole(data) {
  return request({
    url: '/api/v1/roles',
    method: 'post',
    data: data
  })
}

// 修改角色
export function editRole(data, roleId) {
  return request({
    url: '/api/v1/roles/' + roleId,
    method: 'put',
    data: data
  })
}

// 获取菜单树
export function getMenus() {
  return request({
    url: '/api/v1/menus.tree',
    method: 'get'
  })
}

// 获取菜单树
export function getRoleByID(roleId) {
  return request({
    url: '/api/v1/roles/' + roleId,
    method: 'get'
  })
}

// 修改状态
export function changeStatusById(roleId, flag) {
  const status = flag !== 1 ? 'enable' : 'disable'
  return request({
    url: '/api/v1/roles/' + roleId + '/' + status,
    method: 'patch'
  })
}

// 删除数据
export function delRoleByID(roleId) {
  return request({
    url: '/api/v1/roles/' + roleId,
    method: 'delete'
  })
}
