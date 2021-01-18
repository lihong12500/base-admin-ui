import router from './router'
import store from './store'
import { getToken } from '@/utils/auth'

let asyncRouterFlag = 0

const whiteList = ['/login', '/auth-redirect']

router.beforeEach(async (to, from, next) => {
  const token = getToken()
  console.log('get to path using judge')
  console.log(to.path)
  // 路由在白名单中
  if (whiteList.indexOf(to.path) > -1) {
    asyncRouterFlag = 0
    if (token) {
      next({ path: '/' })
    } else {
      next()
    }
  } else {
    // 访问路径不在白名单中
    if (token) {
      // todo 后台获取菜单信息，添加动态路由,代码有问题？
      if (!asyncRouterFlag) {
        asyncRouterFlag++
        const accessRoutes = await store.dispatch('router/generateRoutes')
        router.addRoutes(accessRoutes)
        next({ ...to, replace: true })
      } else {
        next()
      }
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
  console.log('router afterEach')
  console.log(asyncRouterFlag)
})
