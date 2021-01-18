<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="模糊查询" prop="queryValue">
            <el-input
              v-model="queryParams.queryValue"
              placeholder="请输入查询条件"
              clearable
              size="small"
              style="width: 240px"
              @keyup.enter.native="getRoles"
            />
          </el-form-item>
          <el-form-item label="状态" prop="roleId">
            <el-select v-model="queryParams.status" size="small" clearable placeholder="请选择状态" @change="$forceUpdate()">
              <el-option v-for="item in statusOptions" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" plain size="small" @click="getList()">查询</el-button>
            <el-button plain icon="el-icon-refresh" size="small" @click="resetQuery()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <PButton perms="add" @click="handleAdd()" />
          </el-col>
          <el-col :span="1.5">
            <div v-if="!single">
              <PButton perms="edit" @click="handleEdit(currentRow)" />
              <PButton perms="del" @click="handleDel(currentRow)" />
              <PButton v-if="showButton() === 2" perms="enable" @click="handleStatusChange(currentRow)" />
              <PButton v-if="showButton() === 1" perms="disable" @click="handleStatusChange(currentRow)" />
            </div>
          </el-col>
          <el-col :span="1.5">
            <el-button plain type="success" size="small" :disabled="single" @click="handleChangeMenuAndAction(currentRow)">
              分配权限
            </el-button>
          </el-col>
        </el-row>
        <!-- 表格区域 -->
        <el-table
          ref="tb"
          :data="roleList"
          highlight-current-row
          @selection-change="handleSelectTableChange"
          style="width: 100%"
          border
          stripe
        >
          <el-table-column type="selection" width="45" align="center" />
          <el-table-column type="index" label="编号"></el-table-column>
          <el-table-column prop="name" label="角色名称" align="center"> </el-table-column>
          <el-table-column prop="sequence" label="显示顺序" align="center"> </el-table-column>
          <el-table-column label="状态" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.status === 1" size="mini" type="success">启用</el-tag>
              <el-tag v-else type="warning">停用</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="165" align="center">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.created_at) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" align="center"> </el-table-column>
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getRoles"
        />
      </el-card>

      <!-- 添加或修改参数配置对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="600px">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px" size="small">
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入角色名称" />
          </el-form-item>
          <el-form-item label="角色顺序" prop="sequence">
            <el-input-number v-model="form.sequence" controls-position="right" :min="0" />
          </el-form-item>
          <el-form-item label="角色状态">
            <el-radio-group v-model="form.status">
              <el-radio v-for="dict in statusOptions" :key="dict.id" :label="dict.id">{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>
      <!-- 添加或编辑菜单 -->
      <el-dialog :title="title" :visible.sync="treeOpen" width="600px">
        <el-table
          ref="rightTableRef"
          :data="menuOptions"
          style="width: 100%"
          row-key="id"
          border
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="45" align="center" />
          <el-table-column prop="name" label="菜单名称" width="180"> </el-table-column>
          <el-table-column prop="actions" label="动作按钮">
            <template slot-scope="scope">
              <el-checkbox-group v-model="checkedbox">
                <el-checkbox
                  v-for="item in scope.row.actions"
                  :key="item.id"
                  :label="item.id"
                  @change="handleCheckboxs(item, scope.row)"
                  >{{ item.name }}</el-checkbox
                >
              </el-checkbox-group>
            </template>
          </el-table-column>
        </el-table>

        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitMenu">确 定</el-button>
          <el-button @click="cancelMenu">取 消</el-button>
        </div>
      </el-dialog>
    </template>
  </BasicLayout>
</template>

<script>
import { getRoles, addRole, getMenus, getRoleByID, editRole, changeStatusById, delRoleByID } from '@/api/system/role'
import PButton from '@/components/PermButton'
export default {
  data() {
    return {
      // 查询参数
      queryParams: {
        queryValue: '',
        status: undefined,
        pageIndex: 1, // 当前页
        pageSize: 10 // 每页条数
      },
      // 状态数据字典
      statusOptions: [
        { id: 1, label: '启用' },
        { id: 2, label: '停用' }
      ],
      // 非单个禁用
      single: true,
      // 显示条数
      total: 0,
      currentRow: null,
      // 是否显示弹出层
      open: false,
      // 是否显示分配菜单
      treeOpen: false,
      // 弹出层标题
      title: '',
      // 表单参数
      form: {},
      // 角色列表
      roleList: [],
      // 表单校验
      rules: {
        name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
        sequence: [{ required: true, message: '顺序不能为空', trigger: 'blur' }]
      },
      // 菜单树
      menuOptions: [],
      checkedbox: [],
      selected: false,
      // 选择的菜单
      multipleSelection: [],
      roleMenus: []
    }
  },
  components: {
    PButton
  },
  created() {
    this.getRoles()
    this.getMenuTreeselect()
  },
  methods: {
    getRoles() {
      getRoles(this.queryParams).then(res => {
        const { list, pagination } = res.data
        this.roleList = list
        this.total = pagination.Total
        this.pageIndex = pagination.current
        this.pageSize = pagination.pageSize
      })
    },
    // 查询菜单树结构
    getMenuTreeselect() {
      getMenus().then(res => {
        this.menuOptions = res.data.list
      })
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加角色'
    },
    handleEdit(row) {
      this.reset()
      getRoleByID(row[0].id).then(res => {
        this.form = res.data
        this.open = true
        this.title = '编辑角色'
      })
    },
    // 状态修改
    handleStatusChange(row) {
      const text = row[0].status === 2 ? '启用' : '停用'
      this.$confirm('确认要"' + text + '""' + row[0].name + '"角色吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return changeStatusById(row[0].id, row[0].status)
        })
        .then(() => {
          this.msgSuccess(text + '成功')
          this.getRoles()
        })
        .catch(function() {
          row[0].status = row[0].status === 1 ? 2 : 1
        })
    },
    handleDel(row) {
      const rolename = row[0].name
      this.$confirm('是否确认删除角色: "' + rolename + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return delRoleByID(row[0].id)
        })
        .then(() => {
          this.msgSuccess('删除成功')
          this.getRoles()
        })
        .catch(function() {})
    },
    // 实现单选
    handleSelectTableChange(selection) {
      this.single = selection.length !== 1
      this.currentRow = selection
      if (selection.length > 1) {
        this.$refs.tb.clearSelection()
        // selection.pop() 删除并且返回数组最后一个元素
        this.$refs.tb.toggleRowSelection(selection.pop())
      }
    },
    showButton() {
      // 判断选择数据是对应数据的状态，首先需要判断数据是否为空，为空等于一个随机值3，按钮都不显示
      if (this.currentRow[0]) {
        return this.currentRow[0].status
      }
      return 3
    },
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            // update
            editRole(this.form, this.form.id).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getRoles()
              }
            })
          } else {
            // add
            addRole(this.form).then(res => {
              if (res.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getRoles()
              } else {
                this.msgError(res.msg)
              }
            })
          }
        }
      })
    },
    cancel() {
      this.open = false
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        sequence: 0,
        remark: undefined,
        status: 1,
        role_menus: []
      }
      // 清空菜单信息
      this.roleMenus = []
      this.checkedbox = []
      this.resetForm('form')
    },
    // 菜单权限修改
    handleChangeMenuAndAction(row) {
      this.reset()
      getRoleByID(row[0].id).then(res => {
        this.form = res.data
        // 弹框前添加已经选择的选项
        this.form.role_menus.forEach(item => {
          // 设置选中的checkbox
          this.checkedbox.push(item.action_id)
          // 设置选中的table项
          this.setInitCheckedMenu(this.menuOptions, item.menu_id)
          // 设置role_mens对应选项
          this.roleMenus.push({
            menu_id: item.menu_id,
            action_id: item.action_id
          })
        })
        this.treeOpen = true
        this.title = '分配菜单'
      })
    },
    setInitCheckedMenu(allMenus, menuId) {
      allMenus.forEach(row => {
        if (row.children && row.children.length > 0) {
          this.setInitCheckedMenu(row.children, menuId)
        }
        // 获取菜单中已经包含的menu_id,如果存在设置,设置表格改行为选择状态，并且设置选中的checkbox
        if (row.id === menuId) {
          this.$nextTick(() => {
            this.$refs.rightTableRef.toggleRowSelection(row, true)
          })
        }
      })
    },
    // 提交角色按钮
    submitMenu: function() {
      // 合并有menu_id同时没有action_id的role_menus
      this.multipleSelection.forEach(item => {
        const flag = this.roleMenus.findIndex(row => row.menu_id === item.id)
        if (flag === -1) {
          this.roleMenus.push({
            menu_id: item.id
          })
        }
      })
      // 提交数据
      this.form.role_menus = this.roleMenus
      editRole(this.form, this.form.id).then(response => {
        if (response.code === 200) {
          // 更新角色列表数据
          this.getRoles()
          // todo 更新store中数据,更新时候导致路由混乱，当前更新后需要重新登录系统才能生效
          // this.$store.dispatch('router/generateRoutes')
          this.msgSuccess('修改成功')
        }
      })
      this.treeOpen = false
    },
    cancelMenu: function() {
      this.treeOpen = false
      this.$refs.rightTableRef.clearSelection()
      this.reset()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 判断checkbox 点击事件是选中还是取消选中
    handleCheckboxStatus(id) {
      const selected = this.checkedbox.length && this.checkedbox.indexOf(id) !== -1
      return selected
    },
    handleCheckboxs(item, row) {
      if (this.multipleSelection && this.multipleSelection.length === 0) {
        this.$refs.rightTableRef.toggleRowSelection(row, true)
      }
      if (this.multipleSelection && this.multipleSelection.indexOf(row) === -1) {
        this.$refs.rightTableRef.toggleRowSelection(row, true)
      }
      const roleMenuRow = {
        menu_id: item.menu_id,
        action_id: item.id
      }
      // 选中
      if (this.handleCheckboxStatus(item.id)) {
        this.roleMenus.push(roleMenuRow)
      } else {
        // 取消选中
        const index = this.roleMenus.findIndex(item => item.action_id === roleMenuRow.action_id)
        if (index !== -1) {
          this.roleMenus.splice(index, 1)
        }
      }
    }
  }
}
</script>

<style></style>
