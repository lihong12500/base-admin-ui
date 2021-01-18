import { getUserMenu } from '@/api/user'
import { constantRoutes, asyncRoutes } from '@/router'
// import TempLayout from '@/views/templayout'
import Layout from '@/views/layout'

export const loadView = type => {
  // 路由懒加载
  return resolve => require([`@/views${type}/index`], resolve)
  //   return () => import(`@/views${view}`)
}

export function changeNotChildrenMenu(routes, data) {
  data.forEach(item => {
    const changeMenu = {
      path: item.path,
      component: Layout,
      // hidden: false,
      children: []
      // meta: {
      //   title: item.name + 'test',
      //   icon: item.icon,
      //   noCache: true
      // }
    }
    if (item.children && item.children.length === 0) {
      changeMenu.children.push(item)
      routes.push(changeMenu)
    } else {
      routes.push(item)
    }
  })
}

export function formatRouter(routes, data) {
  data.forEach(item => {
    const menu = {
      path: item.router === '' ? '/' : item.router,
      children: [],
      name: item.name,
      component: item.router === '' ? Layout : loadView(item.router),
      hidden: item.show_status === '1',
      meta: {
        title: item.name,
        icon: item.icon,
        noCache: true
      }
    }
    if (item.children && item.children.length > 0) {
      formatRouter(menu.children, item.children)
    }
    routes.push(menu)
  })
}

// 获取当前用户的菜单按钮权限
export function getMenusActions(actionsArry, data) {
  data.forEach(item => {
    if (item.actions) {
      actionsArry[item.router] = item.actions
    }
    if (item.children && item.children.length > 0) {
      getMenusActions(actionsArry, item.children)
    }
  })
}

const state = {
  routes: [],
  addRoutes: [],
  menuActions: []
}

const mutations = {
  SET_ROUTES(state, route) {
    state.addRoutes = route
    // state.routes = route
    state.routes = constantRoutes.concat(route)
  },
  SET_MENUSACTIONS(state, actionsArry) {
    state.menuActions = actionsArry
  }
}
const actions = {
  generateRoutes({ commit }) {
    return new Promise(resolve => {
      const loadMenuData = []
      const actionsArry = []
      getUserMenu()
        .then(res => {
          let data = res
          if (res.code !== 200) {
            this.$message({
              message: '菜单数据加载异常',
              type: 0
            })
          } else {
            data = res.data.list
            getMenusActions(actionsArry, data)
            Object.assign(loadMenuData, data)
            const childrenRoutes = []
            formatRouter(childrenRoutes, loadMenuData)
            // asyncRoutes[0].children = childrenRoutes
            commit('SET_MENUSACTIONS', actionsArry)
            changeNotChildrenMenu(asyncRoutes, childrenRoutes)
            asyncRoutes.push({ path: '*', redirect: '/404', hidden: true })
            commit('SET_ROUTES', asyncRoutes)
            resolve(asyncRoutes)
          }
        })
        .catch(error => {
          console.log(error)
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
