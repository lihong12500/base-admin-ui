<template>
  <el-dialog :title="title" :visible.sync="innerVisible" @open="initForm()">
    <el-form ref="form" :model="form" :rules="rules" label-width="85px" size="small" :inline="true">
      <el-form-item label="接口路径" prop="path">
        <el-input v-model="form.path" placeholder="请输入" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleOperation('confirm')">确认</el-button>
      <el-button @click="handleOperation('cancel')">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      title: '快速创建模板',
      // 表单校验
      rules: {
        path: [{ required: true, message: '接口路径不能为空', trigger: 'blur' }]
      },
      form: {}
    }
  },
  props: {
    isShowTplDialog: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    innerVisible: {
      get() {
        return this.isShowTplDialog
      },
      set(val) {
        this.$emit('update:isShowTplDialog', val)
      }
    }
  },
  methods: {
    handleTplSubmit(path) {
      const tplData = [
        {
          code: 'add',
          name: '新增',
          resources: [{ method: 'POST', path }]
        },
        {
          code: 'edit',
          name: '编辑',
          resources: [
            { method: 'GET', path: `${path}/:id` },
            { method: 'PUT', path: `${path}/:id` }
          ]
        },
        {
          code: 'del',
          name: '删除',
          resources: [{ method: 'DELETE', path: `${path}/:id` }]
        },
        {
          code: 'view',
          name: '查看',
          resources: [{ method: 'GET', path: `${path}/:id` }]
        },
        {
          code: 'query',
          name: '查询',
          resources: [{ method: 'GET', path }]
        }
      ]
      return tplData
    },
    handleOperation(val) {
      if (val === 'confirm') {
        this.$refs['form'].validate(valid => {
          if (valid) {
            this.$emit('getActionTplData', this.handleTplSubmit(this.form.path))
            this.innerVisible = false
          }
        })
      } else if (val === 'cancel') {
        this.innerVisible = false
      }
    },
    // 重置表单
    initForm() {
      this.resetForm('form')
    }
  }
}
</script>

<style></style>
