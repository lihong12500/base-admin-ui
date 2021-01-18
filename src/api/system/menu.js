import request from '@/utils/request'

// 获取菜单树
export function getMenuTree() {
  return request({
    url: '/api/v1/menus.tree',
    method: 'get'
  })
}

// 获取菜单树
export function getMenuList() {
  return request({
    url: '/api/v1/menus',
    method: 'get'
  })
}

// 获取菜单信息通过ID
export function getMenuById(menuId) {
  return request({
    url: '/api/v1/menus/' + menuId,
    method: 'get'
  })
}

// 添加菜单
export function addMenu(data) {
  return request({
    url: '/api/v1/menus',
    method: 'post',
    data: data
  })
}

// 修改菜单
export function editMenu(data, menuId) {
  return request({
    url: '/api/v1/menus/' + menuId,
    method: 'put',
    data: data
  })
}

// 删除菜单
export function delMenuById(menuId) {
  return request({
    url: '/api/v1/menus/' + menuId,
    method: 'delete'
  })
}

// 修改状态
export function changeStatusById(menuId, flag) {
  const status = flag !== 1 ? 'enable' : 'disable'
  return request({
    url: '/api/v1/menus/' + menuId + '/' + status,
    method: 'patch'
  })
}
