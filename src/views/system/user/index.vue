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
              @keyup.enter.native="getList"
            />
          </el-form-item>
          <el-form-item label="所属角色" prop="roleId">
            <el-select v-model="queryParams.roleId" size="small" clearable placeholder="请选择角色信息" @change="$forceUpdate()">
              <el-option v-for="item in roleOptions" :key="item.id" :label="item.name" :value="item.id" />
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
        </el-row>
        <!-- 表格区域 -->
        <el-table
          :data="userList"
          highlight-current-row
          @selection-change="handleCurrentChange"
          style="width: 100%"
          border
          stripe
        >
          <el-table-column type="selection" width="45" align="center" />
          <el-table-column type="index" label="编号"></el-table-column>
          <el-table-column prop="user_name" label="用户名"></el-table-column>
          <el-table-column prop="real_name" label="真实姓名"></el-table-column>
          <el-table-column prop="Roles" label="角色名称" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.Roles[0].name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="用户状态" width="75" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.status === 1" size="mini" type="success">启用</el-tag>
              <el-tag v-else type="warning">停用</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="手机号"></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="165" align="center">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.created_at) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-card>
      <!-- 添加或修改参数配置对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="600px">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="用户名" prop="user_name">
            <el-input v-model="form.user_name" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item v-if="form.id === undefined" label="用户密码" prop="password">
            <el-input v-model="form.password" placeholder="请输入用户密码" type="password" />
          </el-form-item>
          <el-form-item label="真实姓名" prop="real_name">
            <el-input v-model="form.real_name" placeholder="请输入真实姓名" />
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="selectRolesID" multiple placeholder="请选择" @change="$forceUpdate()">
              <el-option v-for="item in roleOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="用户状态">
            <el-radio-group v-model="form.status">
              <el-radio v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictValue">{{
                dict.dictLabel
              }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入用户邮箱" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>
    </template>
  </BasicLayout>
</template>

<script>
import { getUserList, addUser, updateUser, getUserById, changeStatusById } from '@/api/system/user'
import { getRoleList } from '@/api/system/role'

import PButton from '@/components/PermButton'
export default {
  data() {
    return {
      queryParams: {
        queryValue: '',
        roleId: '',
        pageIndex: 1, // 当前页
        pageSize: 10 // 每页条数
      },
      // 用户表格数据
      userList: null,
      // 非单个禁用
      single: true,
      // 显示条数
      total: 0,
      currentRow: null,
      // 是否显示弹出层
      open: false,
      // 弹出层标题
      title: '',
      // 表单参数
      form: {},
      // 角色选项
      roleOptions: [],
      // 角色
      selectRolesID: [],
      // 状态数据字典
      statusOptions: [
        { dictValue: 1, dictLabel: '启用' },
        { dictValue: 2, dictLabel: '停用' }
      ],
      rules: {
        user_name: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
        real_name: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
        password: [{ required: true, message: '用户密码不能为空', trigger: 'blur' }],
        email: [
          { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
          {
            type: 'email',
            message: "'请输入正确的邮箱地址",
            trigger: ['blur', 'change']
          }
        ],
        phone: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  components: {
    PButton
  },
  created() {
    this.getList()
    this.getRoles()
    // this.handleQuery()
  },
  methods: {
    handleQuery() {
      // this.btactions = this.actions[this.$route.path]
    },
    getList() {
      getUserList(this.queryParams).then(res => {
        const { list, pagination } = res.data
        this.userList = list
        this.total = pagination.Total
        this.pageIndex = pagination.current
        this.pageSize = pagination.pageSize
      })
    },
    getRoles() {
      getRoleList({}).then(res => {
        if (res.code === 200) {
          const { list } = res.data
          this.roleOptions = list
        } else {
          this.msgError('获取角色失败')
        }
      })
    },
    handleCurrentChange(val) {
      console.log(val)
      this.single = val.length !== 1
      this.currentRow = val
    },
    showButton() {
      // 判断选择数据是对应数据的状态，首先需要判断数据是否为空，为空等于一个随机值3，按钮都不显示
      if (this.currentRow[0]) {
        return this.currentRow[0].status
      }
      return 3
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加用户'
    },
    handleEdit(row) {
      getUserById(row[0].id).then(res => {
        if (res.code === 200) {
          const TmpArry = []
          res.data.user_roles.forEach(item => {
            TmpArry.push(item.role_id)
          })
          this.form = res.data
          this.form.user_roles = []
          this.selectRolesID = TmpArry
        } else {
          this.msgError('获取用户失败')
        }
      })
      this.open = true
      this.title = '编辑用户'
    },
    handleDel(row) {
      console.log('del')
      console.log(row)
    },
    // 用户状态修改
    handleStatusChange(row) {
      const text = row[0].status === 2 ? '启用' : '停用'
      this.$confirm('确认要"' + text + '""' + row[0].user_name + '"用户吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return changeStatusById(row[0].id, row[0].status)
        })
        .then(() => {
          this.msgSuccess(text + '成功')
          this.getList()
        })
        .catch(function() {
          row[0].status = row[0].status === 1 ? 2 : 1
        })
    },
    submitForm: function() {
      this.changeRoleIds()
      console.log(this.form)
      this.$refs['form'].validate(valid => {
        if (valid) {
          // update
          if (this.form.id !== undefined) {
            updateUser(this.form, this.form.id).then(response => {
              this.msgSuccess('更新成功')
              this.open = false
              this.getList()
            })
          } else {
            // add
            addUser(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
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
        user_name: undefined,
        real_name: undefined,
        password: undefined,
        phone: undefined,
        email: undefined,
        status: 1,
        remark: undefined,
        user_roles: []
      }
      this.resetForm('form')
    },
    // 将选择的roleId改成后台需要的格式
    changeRoleIds() {
      this.selectRolesID.forEach(id => {
        const row = {
          role_id: id
        }
        this.form.user_roles.push(row)
      })
    },
    // 重置查询
    resetQuery() {
      this.resetForm('queryForm')
      this.getList()
    }
  }
}
</script>

<style></style>
