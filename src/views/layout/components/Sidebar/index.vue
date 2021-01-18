<template>
  <div :class="{ 'has-logo': showLogo }">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="$store.state.settings.themeStyle === 'light' ? variables.menuLightBg : variables.menuBg"
        :text-color="$store.state.settings.themeStyle === 'light' ? 'rgba(0,0,0,.65)' : '#fff'"
        :active-text-color="$store.state.settings.theme"
        :unique-opened="true"
        :collapse-transition="false"
      >
        <!-- <template v-for="item in routes">
          <aside-component :key="item.name" :routerInfo="item" v-if="!item.hidden" />
        </template> -->
        <sidebar-item v-for="route in routes" :key="route.name" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import AsideComponent from '@/views/layout/components/Sidebar/sideComponent'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'
import Logo from './Logo'
export default {
  components: {
    Logo,
    SidebarItem
  },
  computed: {
    ...mapGetters(['sidebar', 'routes']),
    activeMenu() {
      const route = this.$route
      const { path } = route
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  }
}
</script>
