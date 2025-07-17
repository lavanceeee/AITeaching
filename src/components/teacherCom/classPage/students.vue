<template>
  <div class="students-container">
    <div class="students-header">
      <div class="search-and-filter">
        <el-input
          v-model="searchQuery"
          placeholder="搜索学生"
          prefix-icon="Search"
          clearable
          class="search-input"
        />
        <el-select v-model="sortOption" placeholder="排序方式" class="sort-select">
          <el-option label="姓名升序" value="name-asc" />
          <el-option label="姓名降序" value="name-desc" />
          <el-option label="学号升序" value="id-asc" />
          <el-option label="学号降序" value="id-desc" />
          <el-option label="加入时间" value="join-time" />
        </el-select>
      </div>
      <div class="action-buttons">
        <el-button type="primary" plain @click="showImportDialog = true">
          <el-icon><Upload /></el-icon>
          导入学生
        </el-button>
        <el-button type="primary" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          添加学生
        </el-button>
      </div>
    </div>
    
    <div class="students-body">
      <el-table
        v-if="filteredStudents.length > 0"
        :data="filteredStudents"
        style="width: 100%"
        border
        stripe
        :highlight-current-row="true"
      >
        <el-table-column type="index" width="60" align="center" />
        <el-table-column prop="realname" label="姓名" min-width="120">
          <template #default="scope">
            <div class="student-name-cell">
              <el-avatar :size="30" :src="scope.row.avatar || defaultAvatar"></el-avatar>
              <span class="student-name">{{ scope.row.realname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="studentNumber" label="学号" min-width="120" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="scope">
            {{ scope.row.gender === 1 ? '男' : scope.row.gender === 2 ? '女' : '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" min-width="120" show-overflow-tooltip />
        <el-table-column prop="joinTime" label="加入时间" min-width="180">
          <template #default="scope">
            {{ formatDate(scope.row.joinTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="100">
          <template #default="scope">
            <div class="operation-column">
              <el-dropdown trigger="click" @command="(command) => handleCommand(command, scope.row)">
                <span class="operation-trigger">
                  操作 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="message" :icon="Message">发送消息</el-dropdown-item>
                    <el-dropdown-item command="homework" :icon="Document">查看作业</el-dropdown-item>
                    <el-dropdown-item divided command="remove" :icon="Delete" class="danger-item">移出班级</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-else description="暂无学生数据" />
    </div>
    
    <!-- 导入学生对话框 -->
    <el-dialog
      v-model="showImportDialog"
      title="导入学生"
      width="600px"
    >
      <div class="import-container">
        <el-upload
          class="upload-demo"
          drag
          action="#"
          :auto-upload="false"
          :limit="1"
          accept=".xlsx,.xls,.csv"
        >
          <el-icon class="el-icon--upload"><Upload /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 Excel、CSV 格式文件，请确保文件包含必要的学生信息字段
            </div>
          </template>
        </el-upload>
        
        <div class="import-template">
          <span>没有模板？</span>
          <el-button type="primary" link>下载导入模板</el-button>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showImportDialog = false">取消</el-button>
          <el-button type="primary" @click="handleImportStudents">
            开始导入
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 添加学生对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="添加学生"
      width="500px"
    >
      <div class="add-student-form">
        <el-form :model="newStudent" label-width="80px">
          <el-form-item label="姓名">
            <el-input v-model="newStudent.name" />
          </el-form-item>
          <el-form-item label="学号">
            <el-input v-model="newStudent.studentId" />
          </el-form-item>
          <el-form-item label="性别">
            <el-radio-group v-model="newStudent.gender">
              <el-radio :label="1">男</el-radio>
              <el-radio :label="2">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="newStudent.email" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="newStudent.phone" />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="handleAddStudent">
            确认添加
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Search, 
  Upload, 
  Plus,
  Delete,
  Document,
  Message,
  ArrowDown
} from '@element-plus/icons-vue';

const props = defineProps({
  classData: {
    type: Object,
    required: true
  }
});

const searchQuery = ref('');
const sortOption = ref('name-asc');
const showImportDialog = ref(false);
const showAddDialog = ref(false);
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

const newStudent = ref({
  name: '',
  studentId: '',
  gender: 1,
  email: '',
  phone: ''
});

// 根据搜索和排序过滤学生
const filteredStudents = computed(() => {
  if (!props.classData || !props.classData.students) return [];
  
  // 搜索过滤
  let result = props.classData.students;
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(student => 
      student.realname?.toLowerCase().includes(query) || 
      student.studentNumber?.includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.phone?.includes(query)
    );
  }
  
  // 排序
  switch (sortOption.value) {
    case 'name-asc':
      return result.slice().sort((a, b) => a.realname?.localeCompare(b.realname));
    case 'name-desc':
      return result.slice().sort((a, b) => b.realname?.localeCompare(a.realname));
    case 'id-asc':
      return result.slice().sort((a, b) => a.studentNumber?.localeCompare(b.studentNumber));
    case 'id-desc':
      return result.slice().sort((a, b) => b.studentNumber?.localeCompare(a.studentNumber));
    case 'join-time':
      return result.slice().sort((a, b) => new Date(b.joinTime) - new Date(a.joinTime));
    default:
      return result;
  }
});

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '未知';
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 统一处理下拉菜单操作
const handleCommand = (command, student) => {
  switch (command) {
    case 'message':
      handleSendMessage(student);
      break;
    case 'homework':
      handleViewHomework(student);
      break;
    case 'remove':
      handleRemoveStudent(student);
      break;
  }
};

// 处理学生相关操作
const handleSendMessage = (student) => {
  ElMessage.success(`即将发送消息给 ${student.realname}`);
  // 实际实现消息发送功能
};

const handleViewHomework = (student) => {
  ElMessage.success(`查看 ${student.realname} 的作业记录`);
  // 跳转到该学生的作业页面
};

const handleRemoveStudent = (student) => {
  ElMessageBox.confirm(
    `确定要将 ${student.realname} 移出该班级吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 实际移除学生的API调用
    ElMessage.success(`已将 ${student.realname} 移出班级`);
  }).catch(() => {
    // 用户取消操作
  });
};

// 导入学生
const handleImportStudents = () => {
  // 实际导入学生的逻辑
  ElMessage.success('学生导入已开始，请稍候...');
  showImportDialog.value = false;
};

// 添加单个学生
const handleAddStudent = () => {
  // 表单验证和API调用
  if (!newStudent.value.name || !newStudent.value.studentId) {
    ElMessage.warning('姓名和学号为必填项');
    return;
  }
  
  // 实际添加学生的API调用
  ElMessage.success(`学生 ${newStudent.value.name} 添加成功`);
  showAddDialog.value = false;
  
  // 重置表单
  newStudent.value = {
    name: '',
    studentId: '',
    gender: 1,
    email: '',
    phone: ''
  };
};
</script>

<style scoped>
.students-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.students-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.search-and-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  width: 240px;
}

.sort-select {
  width: 160px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.students-body {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.student-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-name {
  vertical-align: middle;
}

/* 操作栏样式优化 */
.operation-column {
  display: flex;
  justify-content: center;
}

.operation-trigger {
  cursor: pointer;
  color: #409EFF;
  font-size: 13px;
  display: flex;
  align-items: center;
}

.operation-trigger:hover {
  color: #66b1ff;
}

.danger-item {
  color: #F56C6C;
}

.import-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.import-template {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 768px) {
  .students-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-and-filter,
  .action-buttons {
    width: 100%;
    justify-content: space-between;
  }
  
  .search-input,
  .sort-select {
    width: 100%;
  }
  
  .action-buttons .el-button {
    flex: 1;
  }
  
  .students-body {
    padding: 16px;
  }
}
</style>
