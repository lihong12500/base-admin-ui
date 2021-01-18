<template>
  <el-button plain :size="size" :type="typeVal" :loading="loading" v-if="hasPerms(perms)" @click="handleClick">
    {{ label }}
  </el-button>
</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'PButton',
  props: {
    size: {
      // 按钮尺寸
      type: String,
      default: 'small'
    },
    loading: {
      // 按钮加载标识
      type: Boolean,
      default: false
    },
    disabled: {
      // 按钮是否禁用
      type: Boolean,
      default: false
    },
    perms: {
      // 按钮权限标识，外部使用者传入
      type: String,
      default: null
    }
  },
  data() {
    return {
      typeVal: 'primary',
      label: 'Button'
    }
  },
  methods: {
    handleClick() {
      // 按钮操作处理函数
      this.$emit('click', {})
    },
    hasPerms(code) {
      // 根据权限标识和外部指示状态进行权限判断
      const btactions = this.actions[this.$route.path]
      if (btactions) {
        for (let i = 0; i < btactions.length; i += 1) {
          if (btactions[i].code === code) {
            return true
          }
        }
      }
      return false
    },
    showType(code) {
      switch (code) {
        case 'edit':
          this.typeVal = 'success'
          this.label = '编辑'
          break
        case 'add':
          this.typeVal = 'primary'
          this.label = '新增'
          break
        case 'del':
          this.typeVal = 'danger'
          this.label = '删除'
          break
        case 'enable':
          this.typeVal = 'waring'
          this.label = '启用'
          break
        case 'disable':
          this.typeVal = 'danger'
          this.label = '禁用'
          break
        default:
          return 'primary'
      }
    }
  },
  computed: {
    ...mapState({
      actions: state => state.router.menuActions
    })
  },
  created() {
    this.showType(this.perms)
  }
}
</script>
