<template>
  <BasicLayout>
    <template #wrapper>
      <el-row :gutter="0.2">
        <el-col :span="5" :xs="24">
          <el-card class="box-card">
            <el-input
              v-model="menuName"
              placeholder="请输入菜单名称"
              clearable
              size="small"
              prefix-icon="el-icon-search"
              style="margin-bottom: 20px"
            />
            <el-tree
              ref="refMenuTree"
              :data="menuOptions"
              :props="defaultProps"
              :filter-node-method="filterNode"
              default-expand-all
            >
            </el-tree>
          </el-card>
        </el-col>
        <el-col :span="19" :xs="24">
          <el-card class="box-card">
            <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
              <el-form-item>
                <el-input
                  v-model="queryParams.queryValue"
                  placeholder="请输入需要查询的内容"
                  clearable
                  size="small"
                  style="width: 240px"
                  @keyup.enter.native="getMenus"
                />
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
            </el-row>
            <!-- 表格区域 -->
            <el-table
              ref="tb"
              :data="menusData"
              highlight-current-row
              @selection-change="handleSelectTableChange"
              style="width: 100%"
              border
              stripe
            >
              <el-table-column type="selection" width="45" align="center" />
              <el-table-column prop="name" label="菜单名称" align="center"> </el-table-column>
              <el-table-column prop="sequence" label="排序值" align="center"> </el-table-column>
              <el-table-column prop="icon" label="菜单图标" align="center"> </el-table-column>
              <el-table-column prop="router" label="访问路由" width="140"> </el-table-column>
              <el-table-column label="状态" align="center">
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.status === 1" size="mini" type="success">启用</el-tag>
                  <el-tag v-else size="mini" type="warning">停用</el-tag>
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
              @pagination="getMenus"
            />
          </el-card>
        </el-col>
      </el-row>
      <actions
        :isShowDialog.sync="open"
        :titleText="title"
        :menuRow="checkedMenuData"
        :menu="menuOptions"
        @actions="getActions"
      ></actions>
    </template>
  </BasicLayout>
</template>

<script>
import { getMenuList, getMenuTree, addMenu, getMenuById, editMenu, delMenuById, changeStatusById } from '@/api/system/menu'
import PButton from '@/components/PermButton'
import Actions from './actions.vue'

export default {
  data() {
    return {
      queryParams: {
        queryValue: '',
        menuId: '',
        pageIndex: 1, // 当前页
        pageSize: 10 // 每页条数
      },
      // 菜单树
      menuOptions: [],
      // 菜单列表
      menusData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      // 非单个禁用
      single: true,
      // 显示条数
      total: 0,
      currentRow: null,
      // 菜单名称
      menuName: undefined,
      // 弹窗标题
      title: '',
      // 控制是否弹窗
      open: false,
      // 选中菜单ID
      checkedMenuData: undefined
    }
  },
  components: {
    PButton,
    Actions
  },
  watch: {
    menuName(val) {
      this.$refs.refMenuTree.filter(val)
    }
  },
  created() {
    this.getMenus()
    this.getMenuTrees()
  },
  methods: {
    getMenus() {
      getMenuList(this.queryParams).then(res => {
        const { list, pagination } = res.data
        this.menusData = list
        this.total = pagination.Total
        this.pageIndex = pagination.current
        this.pageSize = pagination.pageSize
      })
    },
    getMenuTrees() {
      getMenuTree().then(res => {
        this.menuOptions = res.data.list
      })
    },
    handleAdd() {
      this.title = '新增菜单'
      this.open = true
      this.checkedMenuData = {}
    },
    handleEdit(row) {
      getMenuById(row[0].id).then(res => {
        if (res.code === 200) {
          this.checkedMenuData = res.data
          this.title = '编辑菜单'
          this.open = true
        }
      })
    },
    // 删除菜单
    handleDel(row) {
      const name = row[0].name
      this.$confirm('是否确认删除菜单: "' + name + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return delMenuById(row[0].id)
        })
        .then(() => {
          this.msgSuccess('删除成功')
          this.getMenus()
          this.getMenuTrees()
        })
        .catch(function() {})
    },
    // 修改菜单状态
    handleStatusChange(row) {
      const text = row[0].status === 2 ? '启用' : '停用'
      this.$confirm('确认要"' + text + '""' + row[0].name + '"菜单吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return changeStatusById(row[0].id, row[0].status)
        })
        .then(() => {
          this.msgSuccess(text + '成功')
          this.getMenus()
          this.getMenuTrees()
        })
        .catch(function() {
          row[0].status = row[0].status === 1 ? 2 : 1
        })
    },
    showButton() {
      // 判断选择数据是对应数据的状态，首先需要判断数据是否为空，为空等于一个随机值3，按钮都不显示
      if (this.currentRow[0]) {
        return this.currentRow[0].status
      }
      return 3
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
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    // 获取表单并提交后台
    getActions(data) {
      if (data.id && data.id > 0) {
        // edit
        editMenu(data, data.id).then(res => {
          if (res.code === 200) {
            this.getMenus()
            this.getMenuTrees()
            this.msgSuccess('修改成功')
          }
        })
      } else {
        addMenu(data).then(res => {
          if (res.code === 200) {
            this.getMenus()
            this.getMenuTrees()
            this.msgSuccess('修改成功')
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-row {
  margin-bottom: 15px;
  display: flex;
  flex-wrap: wrap;
}
.el-row .el-card {
  min-width: 100%;
  height: 100%;
  margin-right: 20px;
  transition: all 0.5s;
}
</style>
