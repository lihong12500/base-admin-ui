<template>
  <el-menu-item :index="routerInfo.path">
    <i :class="'el-icon-' + routerInfo.meta.icon"></i>
    <span slot="title">{{ routerInfo.meta.title }}</span>
  </el-menu-item>
</template>

<script>
export default {
  name: 'MenuItem',
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

<style lang="scss" scoped></style>
