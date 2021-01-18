import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import { parseTime, resetForm, addDateRange, selectDictLabel, download } from '@/utils/costum'

// 导入elementui
import './plugins/element.js'
import './styles/element-variables.scss'

/** 导入全局样式 */
import '@/styles/index.scss' // global css
import '@/styles/admin.scss'

import VueParticles from 'vue-particles'
Vue.use(VueParticles)

// //引入axios
import axios from 'axios'
import VueAxios from 'vue-axios'

import './icons' // icon
// 引入路由导航
import '@/permission'

import BasicLayout from '@/views/layout/BasicLayout'
import Pagination from '@/components/Pagination'

// 全局组件挂载
Vue.component('Pagination', Pagination)
Vue.component('BasicLayout', BasicLayout)

// 全局方法挂载
Vue.prototype.parseTime = parseTime
Vue.prototype.resetForm = resetForm
Vue.prototype.addDateRange = addDateRange
Vue.prototype.selectDictLabel = selectDictLabel
Vue.prototype.download = download

Vue.prototype.msgSuccess = function(msg) {
  this.$message({ showClose: true, message: msg, type: 'success' })
}

Vue.prototype.msgError = function(msg) {
  this.$message({ showClose: true, message: msg, type: 'error' })
}

Vue.prototype.msgInfo = function(msg) {
  this.$message.info(msg)
}

Vue.use(VueAxios, axios)

Vue.config.productionTip = false
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
