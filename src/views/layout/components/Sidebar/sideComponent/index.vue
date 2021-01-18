<template>
  <component :is="menuComponent" :routerInfo="routerInfo" v-if="!routerInfo.hidden">
    <template v-if="routerInfo.children && routerInfo.children.length">
      <AsideComponent :key="item.name" :routerInfo="item" v-for="item in routerInfo.children" />
    </template>
  </component>
</template>

<script>
import MenuItem from './menuItem'
import SubMenu from './subMenu'
export default {
  name: 'AsideComponent',
  components: {
    MenuItem,
    SubMenu
  },
  computed: {
    menuComponent() {
      if (this.routerInfo.children && this.routerInfo.children.filter(item => !item.hidden).length) {
        return 'SubMenu'
      } else {
        return 'MenuItem'
      }
    }
  },
  props: {
    routerInfo: {
      default: function() {
        return null
      },
      type: Object
    }
  }
}
</script>

<style></style>
