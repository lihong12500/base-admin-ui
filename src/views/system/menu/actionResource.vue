<template>
  <el-dialog :title="actionTitle" :visible.sync="innerVisible">
    <el-form ref="refAction" :model="actionForm" :rules="rules" label-width="85px" size="small" :inline="true">
      <el-form-item label="动作编码:" prop="code">
        <el-input v-model="actionForm.code" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="动作名称:" prop="name">
        <el-input v-model="actionForm.name" placeholder="请输入" />
      </el-form-item>
      <el-row>
        <div class="resource">
          <span>资源管理(服务端口映射)</span>
        </div>
        <div class="link-top"></div>
        <div class="resource">
          <el-button type="primary" plain size="small" @click="addParameter()">新增</el-button>
        </div>
        <el-table ref="refActionResourceTable" :data="actionForm.resources" stripe style="width: 100%">
          <el-table-column prop="method" label="请求方式">
            <template slot-scope="scope">
              <el-select v-model="scope.row.method" clearable placeholder="请选择" size="small">
                <el-option v-for="item in methodOptions" :key="item.value" :label="item.value" :value="item.value"> </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="path" label="请求路径" align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.path" size="small"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-popconfirm title="确定删除吗？" @confirm="deleteRow(scope.$index)">
                <el-button type="danger" size="mini" slot="reference">删除</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="childOperation('confirm')">{{ confirmText }}</el-button>
      <el-button @click="childOperation('cancel')">{{ cancelText }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ActionResourceDialog',
  data() {
    return {
      methodsVal: '',
      // method数据
      methodOptions: [
        {
          value: 'GET'
        },
        {
          value: 'POST'
        },
        {
          value: 'DELETE'
        },
        {
          value: 'PATCH'
        },
        {
          value: 'OPTIONS'
        }
      ],
      // 表单校验
      rules: {
        code: [{ required: true, message: '动作编码不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '动作名称不能为空', trigger: 'blur' }]
      }
    }
  },
  props: {
    isShowActionDialog: {
      type: Boolean,
      default: false
    },
    formAction: {
      type: Object,
      default() {
        return {
          code: '',
          name: '',
          resources: [] // 资源服务列表
        }
      }
    },
    titleText: {
      type: String,
      default: '提示'
    },
    cancelText: {
      type: String,
      default: '取 消'
    },
    confirmText: {
      type: String,
      default: '确 认'
    }
  },
  methods: {
    childOperation(value) {
      if (value === 'confirm') {
        this.$refs['refAction'].validate(valid => {
          if (valid) {
            this.checkAndDelNull(this.actionForm.resources)
            this.innerVisible = false
            this.$emit('getAction', this.actionForm)
          }
        })
      } else if (value === 'cancel') {
        this.innerVisible = false
      }
    },
    // 动态添加行
    addParameter() {
      if (!this.actionForm.resources) {
        this.$set(this.actionForm, 'resources', [])
      }
      this.actionForm.resources.push({
        method: '',
        path: ''
      })
    },
    // 删除行操作
    deleteRow(index) {
      this.actionForm.resources.splice(index, 1)
    },
    // 删除resouce中没有添加方法或者路径的行数据
    checkAndDelNull(valArry = []) {
      if (valArry && valArry.length !== 0) {
        valArry.forEach(row => {
          if (row.method === '' || row.path === '') {
            const index = valArry.indexOf(row)
            if (index !== -1) {
              this.deleteRow(index)
            }
          }
        })
      }
    }
  },
  computed: {
    innerVisible: {
      get() {
        return this.isShowActionDialog
      },
      set(val) {
        this.$emit('update:isShowActionDialog', val)
      }
    },
    actionTitle: {
      get() {
        return this.titleText
      }
    },
    actionForm: {
      get() {
        return this.formAction
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.resource {
  font-size: 18px;
  color: #303133;
  margin-bottom: 18px;
}
.link-top {
  width: 100%;
  height: 1px;
  margin-bottom: 13px;
  border-top: solid #dfe6ec 1px;
}
</style>
