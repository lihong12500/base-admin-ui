<template>
  <div>
    <el-dialog :title="title" :visible.sync="innerVisible" @open="initForm()">
      <el-form ref="form" :model="form" :rules="rules" label-width="85px" size="small" :inline="true">
        <el-row>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="父级菜单">
              <treeselect
                v-model="form.parent_id"
                :options="menuOptions"
                :normalizer="normalizer"
                :show-count="true"
                placeholder="选择上级菜单"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="访问路由" prop="router">
              <el-input v-model="form.router" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单图标" prop="icon">
              <el-input v-model="form.icon" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否显示">
              <el-radio-group v-model="form.show_status">
                <el-radio v-for="item in showStatusOptions" :key="item.id" :label="item.id">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in statusOptions" :key="dict.id" :label="dict.id">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="排序值" prop="sequence">
              <el-input-number v-model="form.sequence" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-row>
        <div class="resource">
          <span>动作(按钮)管理</span>
        </div>
        <div class="link-top"></div>
        <div class="resource">
          <el-button type="primary" plain size="small" @click="handleAddActionManager('add')">新增</el-button>
          <el-button type="primary" plain size="small" @click="handleAddActionTpl()">快速模板</el-button>
        </div>
        <el-table
          ref="refActionTable"
          :data="form.actions"
          stripe
          :row-style="{ height: '40px' }"
          :cell-style="{ padding: '5px' }"
          style="width: 100%"
          max-height="230"
        >
          <el-table-column prop="code" label="动作编号"></el-table-column>
          <el-table-column prop="name" label="动作名称" align="center"> </el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="mini" @click="handleAddActionManager('edit', scope.row)">编辑</el-button>
              <el-popconfirm title="确定删除吗？" @confirm="handleDelRow(scope.$index)" class="popper-button">
                <el-button type="text" size="mini" slot="reference">删除</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleOperation('confirm')">{{ confirmText }}</el-button>
        <el-button @click="handleOperation('cancel')">{{ cancelText }}</el-button>
      </div>
    </el-dialog>
    <action-resource
      :isShowActionDialog.sync="actionOpen"
      :titleText="actionTitle"
      :formAction.sync="actionsResource"
      @getAction="getAction"
    ></action-resource>
    <actions-tpl :isShowTplDialog.sync="actionTplDialog" @getActionTplData="ActionTplData"></actions-tpl>
  </div>
</template>
<script>
import Treeselect from '@riophae/vue-treeselect'
import ActionResource from './actionResource.vue'
import actionsTpl from './actionsTpl.vue'

import { status, showStatus } from '@/utils/dictnaryConst.js'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  data() {
    return {
      // 新增或编辑菜单form
      form: {
        // 动作按钮列表
        actions: []
      },
      // 状态数据字典
      statusOptions: status,
      showStatusOptions: showStatus,
      // 按钮管理弹出名称
      actionTitle: '',
      // 按钮管理是否弹出
      actionOpen: false,
      // 快速模板是否弹出，
      actionTplDialog: false,
      // 资源服务列表
      actionsResource: {},
      // 表单校验
      rules: {
        name: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }]
      }
    }
  },
  components: {
    ActionResource,
    Treeselect,
    actionsTpl
  },
  props: {
    isShowDialog: {
      type: Boolean,
      default: false
    },
    titleText: {
      type: String,
      default: '提示'
    },
    menu: {
      type: Array,
      default: () => {
        return []
      }
    },
    cancelText: {
      type: String,
      default: '取 消'
    },
    confirmText: {
      type: String,
      default: '确 认'
    },
    menuRow: {
      type: Object,
      default: () => {
        return {
          name: '',
          router: '',
          icon: '',
          show_status: 1,
          status: 1,
          sequence: 0,
          remark: '',
          actions: []
        }
      }
    }
  },
  computed: {
    innerVisible: {
      get() {
        return this.isShowDialog
      },
      set(val) {
        this.$emit('update:isShowDialog', val)
      }
    },
    title: {
      get() {
        return this.titleText
      }
    },
    menuOptions: {
      get() {
        return this.menu
      }
    },
    rowData: {
      get() {
        /**
           * 如果选择一条数据点击编辑，取消后，然后再点新增，checkedData数据存在，直接在新增时
          触发函数,将需要传入的值赋值为{}空，在当前判断并且初始化
           *  */

        if (JSON.stringify(this.menuRow) === '{}') {
          return {
            name: '',
            router: '',
            icon: '',
            show_status: 1,
            status: 1,
            sequence: 0,
            remark: '',
            actions: []
          }
        } else {
          return this.menuRow
        }
      }
    }
  },
  methods: {
    // 按钮动作操作
    handleOperation(val) {
      if (val === 'confirm') {
        this.$refs['form'].validate(valid => {
          if (valid) {
            this.$emit('actions', this.form)
            this.innerVisible = false
          }
        })
      } else if (val === 'cancel') {
        this.innerVisible = false
      }
    },
    // 新增或编辑资源管理
    handleAddActionManager(flag, row) {
      if (flag === 'add') {
        this.actionsResource = {}
      } else if (flag === 'edit') {
        this.actionsResource = row
      }
      this.actionTitle = '菜单动作(按钮)管理'
      this.actionOpen = true
    },
    // 模板添加资源管理
    handleAddActionTpl() {
      this.actionsResource = {}
      this.actionTplDialog = true
    },
    // 获取资源管理菜单信息,赋值给table列表
    getAction(data) {
      if (!this.form.actions) {
        this.$set(this.form, 'actions', [])
      }
      // 删除旧值，再添加
      const index = this.form.actions.indexOf(data)
      if (index !== -1) {
        this.form.actions.splice(index, 1)
      }
      this.form.actions.push(data)
    },
    ActionTplData(data) {
      data.forEach(item => {
        this.getAction(item)
      })
    },
    // 表单重置
    initForm() {
      this.resetForm('form')
      this.form = { ...this.rowData }
    },
    // 删除行数据
    handleDelRow(index) {
      this.form.actions.splice(index, 1)
    },
    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
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
.popper-button {
  margin-left: 20px;
}
.vue-treeselect {
  width: 200px;
}
</style>
