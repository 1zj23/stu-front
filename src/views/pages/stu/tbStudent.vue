<template>
  <div class="app-container">
    <div class="search-div">
      <el-form label-width="70px" size="small">
        <el-row>
          <el-col :span="6">
            <el-form-item label="姓名">
              <el-input v-model="searchObj.name" placeholder="姓名" clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="班级">
              <el-select
                v-model="searchObj.classId"
                placeholder="班级">
                <el-option
                  v-for="tbClass in tbClassX8879a4f2List"
                  :key="tbClass.id"
                  :label="tbClass.name"
                  :value="tbClass.id"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row style="display:flex">
          <el-button type="primary" icon="el-icon-search" size="mini" @click="fetchData()">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetData">重置</el-button>
        </el-row>
      </el-form>
    </div>
    <!-- 工具条 -->
    <div class="tools-div">
      <el-button type="success" icon="el-icon-plus" size="mini" @click="add"
                >添 加
      </el-button>

      <el-upload
        class="upload-demo"
        style="display: inline;margin-left:4px"
        action="#"
        :multiple="false"
        :on-success="handleUploadSuccess"
        :before-upload="beforeImport"
        accept=".xls,.xlsx"
      >
        
      </el-upload>
    </div>
    <!-- 列表 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      :row-key="getRowKeys"
      stripe
      border
      style="width: 100%;margin-top: 10px;"
      @selection-change="handleSelectionChange">
      <el-table-column
        label="序号"
        width="70"
        align="center">
        <template slot-scope="scope">
          {{ (page - 1) * limit + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column type="selection" :reserve-selection="true"/>
      <el-table-column sortable prop="name" label="姓名"/>
      <el-table-column sortable prop="age" label="年龄"/>
      <el-table-column sortable prop="genderName" label="性别"/>
      <el-table-column sortable prop="className" label="班级名称"/>
      <el-table-column type="expand" label="...">
        <template slot-scope="props">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="姓名">
              <span>{{ props.row.name }}</span>
            </el-form-item>
            <el-form-item label="年龄">
              <span>{{ props.row.age }}</span>
            </el-form-item>
            <el-form-item label="性别">
              <span>{{ props.row.genderName }}</span>
            </el-form-item>
            <el-form-item label="班级名称">
              <span>{{ props.row.className }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="edit(scope.row.id)"
                     title="修改"/>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeDataById(scope.row.id)"
                      title="删除"/>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <el-pagination
      @size-change="sizeChangeHandle"
      :current-page="page"
      :total="total"
      :page-size="limit"
      style="padding: 30px 0; text-align: center;"
      :page-sizes="[5, 10, 50, 100]"
      layout="total,sizes, prev, pager, next, jumper"
      @current-change="fetchData"
    />
    <el-dialog title="添加/修改" :visible.sync="dialogVisible" width="30%" :close-on-click-modal="false">
      <el-form ref="dataForm" :model="tbStudent" :rules="rules" label-width="100px" size="small"
               style="padding-right: 40px;">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="tbStudent.name" clearable/>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number :min="0" v-model="tbStudent.age" controls-position="right" clearable/>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio v-model="tbStudent.gender" label="1001">男
          </el-radio>
          <el-radio v-model="tbStudent.gender" label="1002">女
          </el-radio>
        </el-form-item>
        <el-form-item label="班级" prop="classId">
          <el-select
            v-model="tbStudent.classId"
            placeholder="班级">
            <el-option
              v-for="tbClass in tbClassX8879a4f2List"
              :key="tbClass.id"
              :label="tbClass.name"
              :value="tbClass.id"/>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small" icon="el-icon-refresh-right">取 消</el-button>
        <el-button type="primary" icon="el-icon-check" @click="saveOrUpdate()" size="small">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {getToken} from '@/utils/auth'
import api from '@/api/stu/tbStudent'
import tbClassApi from '@/api/stu/tbClass'

const defaultForm = {}
export default {
  components: {},
  data() {
    return {
      listLoading: true, // 数据是否正在加载
      list: [], // banner列表
      total: 0, // 数据库中的总记录数
      page: 1, // 默认页码
      limit: 5, // 每页记录数
      searchObj: {}, // 查询表单对象
      dialogVisible: false,
      tbStudent: defaultForm,
      saveBtnDisabled: false,
      selectValue: [], //复选框选择内容封装数组
      dowTempPath: process.env.VUE_APP_BASE_API + '/temp/tbStudent.xlsx'
      , tbClassX8879a4f2List: []
      , rules: {

        name:
          [
            {required: true, message: '请输入姓名', trigger: 'blur'}
          ]
        ,
        age:
          [
            {required: true, message: '请输入年龄', trigger: 'blur'}
          ]
        ,
        gender:
          [
            {required: true, message: '请输入性别', trigger: 'blur'}
          ]
        ,
        classId:
          [
            {required: true, message: '请输入班级', trigger: 'blur'}
          ]
      }
    }
  },
  // 生命周期函数：内存准备完毕，页面尚未渲染
  created() {
    console.log('list created......')
    this.fetchData()
    this.getAllTbClassX8879a4f2()
  },
  // 生命周期函数：内存准备完毕，页面渲染成功
  mounted() {
    console.log('list mounted......')
  },
  methods: {

    //上传文件begin

    handleUploadSuccess(response, file, fileList) {
      console.log(response);
      // 处理成功响应
    },
    beforeImport(file) {
      // 在这里可以进行文件类型、大小等的校验
      // 返回 false 可以取消上传

      // 调用后端上传方法
      let formData = new FormData();
      formData.append('files', file);

      api.uploadFile(formData)
        .then((res) => {
          if (res.code == 200) {
            //提示
            this.$message({
              type: 'success',
              message: '导入成功!'
            });
            this.fetchData(this.page);
          }
          //this.refs.upload.clearFiles();
        })
        .catch((err) => {
        });

      return false; // 取消Element UI的默认上传行为
    },

    //上传文件end

    getRowKeys(row) {
      return row.id
    },
    //导出数据
    exportData() {
      window.open(process.env.VUE_APP_BASE_API + '/stu/tbStudent/export?token=' + getToken());
    },
    // 每页数
    sizeChangeHandle(val) {
      this.limit = val;
      this.page = 1;
      this.fetchData(this.page);
    },
    getAllTbClassX8879a4f2() {
      let queryObj = {}
      tbClassApi.getAllTbClass(queryObj)
        .then(response => {
          this.tbClassX8879a4f2List = response.data
        })
    },
    // 加载banner列表数据
    fetchData(page = 1) {
      debugger
      this.page = page
      api.getPageList(this.page, this.limit, this.searchObj).then(
        response => {
          //this.list = response.data.list
          this.list = response.data.records
          this.total = response.data.total
          // 数据加载并绑定成功
          this.listLoading = false
        }
      )
    },
    // 重置查询表单
    resetData() {
      console.log('重置查询表单')
      this.searchObj = {}
      this.fetchData()
    },
    // 根据id删除数据
    removeDataById(id) {
      // debugger
      this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => { // promise
        // 点击确定，远程调用ajax
        return api.removeById(id)
      }).then((response) => {
        this.fetchData(this.page)
        this.$message.success(response.message || '删除成功')
      }).catch(() => {
        this.$message.info('取消删除')
      })
    },
    //复选框发生变化执行方法
    handleSelectionChange(selection) {
      this.selectValue = selection
      //console.log(this.selectValue)
    },
    //批量删除
    batchRemove() {
      //判断
      if (this.selectValue.length == 0) {
        this.$message.warning('请选择要删除的记录！')
        return
      }
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //数组
        var idList = []
        //获取多个复选框对应id，封装到数组里面
        // [1,2,3]
        for (var i = 0; i < this.selectValue.length; i++) {
          var obj = this.selectValue[i]
          //id值
          var id = obj.id
          //放到数组里面
          idList.push(id)
        }
        api.batchRemove(idList).then(response => {
          //提示
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          //刷新
          this.fetchData()
        })
      })
    },
    //弹出添加表单
    add(row) {
      this.dialogVisible = true
      if (this.$refs.zdept) {
        this.$refs.zdept.reset_data()
      }
      this.tbStudent = {}
      this.rules.name = [{required: true, message: '请输入姓名', trigger: 'blur'}]
      this.rules.age = [{required: true, message: '请输入年龄', trigger: 'blur'}]
      this.rules.gender = [{required: true, message: '请输入性别', trigger: 'blur'}]
      this.rules.classId = [{required: true, message: '请输入班级', trigger: 'blur'}]
    },
    //编辑
    edit(id) {
      this.dialogVisible = true
      this.rules.name = [{required: true, message: '请输入姓名', trigger: 'blur'}]
      this.rules.age = [{required: true, message: '请输入年龄', trigger: 'blur'}]
      this.rules.gender = [{required: true, message: '请输入性别', trigger: 'blur'}]
      this.rules.classId = [{required: true, message: '请输入班级', trigger: 'blur'}]
      api.getById(id).then(response => {
        this.$nextTick(function () {
          this.tbStudent = response.data
          if (this.$refs.zdept) {
            this.$refs.zdept.reset_data(this.tbStudent.deptName)
          }
          if (this.$refs.eltreeDept) {
            this.$refs.eltreeDept.setCheckedKeys(this.tbStudent.deptIdList);
          }
        })
      })
    },
    //添加或更新
    saveOrUpdate() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          if (!this.tbStudent.id) {
            this.save()
          } else {
            this.update()
          }
        }
      })
    },
    //添加
    save() {
      api.save(this.tbStudent).then(response => {
        this.$message.success('操作成功')
        this.dialogVisible = false
        this.fetchData(this.page)
      })
    },
    //更新
    update() {
      api.updateById(this.tbStudent).then(response => {
        this.$message.success(response.message || '操作成功')
        this.dialogVisible = false
        this.fetchData(this.page)
      })
    }
  }
}
</script>
<style>
.demo-table-expand {
  font-size: 0;
}

.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}

.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
</style>
