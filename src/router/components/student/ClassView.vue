<template>
  <div class="class-view-container">
    <!-- 顶部导航区 -->
    <div class="top-header">
      <div class="title-area">
        <h2 class="page-title">我的班级</h2>
      </div>
      <div class="action-buttons">
        <el-button type="primary" size="small" @click="showJoinClassDialog">
          <el-icon><Plus /></el-icon>加入班级
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 班级信息卡片区 -->
      <div class="sidebar-container" :class="{'collapsed': isSidebarCollapsed}">
        <div class="sidebar-header" @click="toggleSidebar">
          <span v-if="!isSidebarCollapsed">班级列表</span>
          <span v-else>班级</span>
          <el-icon :class="{ 'is-collapsed': isSidebarCollapsed }">
            <ArrowRight v-if="isSidebarCollapsed" />
            <ArrowLeft v-else />
          </el-icon>
        </div>
        
        <!-- 展开状态加载中 -->
        <div class="loading-box" v-if="loading && !isSidebarCollapsed">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        
        <!-- 折叠状态加载中 -->
        <div class="mini-loading" v-if="loading && isSidebarCollapsed">
          <el-icon class="loading-icon"><Loading /></el-icon>
        </div>
        
        <!-- 展开状态空数据 -->
        <div class="empty-class-list" v-if="!loading && classList.length === 0 && !isSidebarCollapsed">
          <el-empty :image-size="60" description="暂无班级" />
        </div>
        
        <!-- 折叠状态空数据 -->
        <div class="mini-empty" v-if="!loading && classList.length === 0 && isSidebarCollapsed">
          <el-icon><InfoFilled /></el-icon>
        </div>
        
        <div class="class-cards-container" v-show="!isSidebarCollapsed" v-if="!loading && classList.length > 0">
          <div 
            v-for="classItem in classList" 
            :key="classItem.id"
            class="class-card"
            @click="selectClass(classItem)"
            :class="{'active-card': selectedClass && selectedClass.id === classItem.id}"
          >
            <div class="class-card-header">
              <span class="class-name">{{ classItem.name }}</span>
              <el-tag size="small" effect="light">{{ classItem.major }}</el-tag>
            </div>
            <div class="class-card-content">
              <div class="class-info">
                <div class="info-item">
                  <el-icon><User /></el-icon>
                  <span>老师：{{ classItem.teacherName }}</span>
                </div>
                <div class="info-item">
                  <el-icon><School /></el-icon>
                  <span>{{ classItem.school }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ classItem.grade }}级</span>
                </div>
                <div class="info-item">
                  <el-icon><UserFilled /></el-icon>
                  <span>{{ classItem.studentCount }}名学生</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 折叠时显示的迷你列表 -->
        <div class="mini-class-list" v-show="isSidebarCollapsed" v-if="!loading && classList.length > 0">
          <div 
            v-for="classItem in classList" 
            :key="classItem.id"
            class="mini-class-item"
            @click="selectClass(classItem)"
            :class="{'active-mini-card': selectedClass && selectedClass.id === classItem.id}"
            :title="classItem.name"
          >
            <el-avatar :size="32" :src="null" :class="{'active-avatar': selectedClass && selectedClass.id === classItem.id}">{{ classItem.name.slice(0, 2) }}</el-avatar>
          </div>
        </div>
      </div>

      <!-- 班级详情区或空状态 -->
      <div v-if="!loading && classList.length === 0" class="empty-state">
        <el-empty description="您还没有加入任何班级">
          <el-button type="primary" @click="showJoinClassDialog">立即加入班级</el-button>
        </el-empty>
      </div>

      <div v-else-if="!loading && selectedClass" class="class-detail-container">
        <div class="class-detail-header">
          <div class="detail-title">
            <h3>{{ selectedClass.name }}</h3>
            <div class="detail-subtitle">{{ selectedClass.major }} · {{ selectedClass.grade }}级</div>
          </div>
          <div class="detail-actions">
            <el-button size="small" plain>班级公告</el-button>
            <el-button size="small" plain>班级任务</el-button>
          </div>
        </div>

        <div class="teacher-section">
          <div class="section-title">
            <span>任课教师</span>
          </div>
          <div class="teacher-info">
            <div class="avatar-container">
              <el-avatar :size="40" :src="selectedClass.teacherAvatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
            </div>
            <div class="teacher-detail">
              <div class="teacher-name">{{ selectedClass.teacherName }}</div>
              <div class="teacher-email">{{ selectedClass.teacherEmail }}</div>
            </div>
          </div>
        </div>
        
        <div class="classmates-section">
          <div class="section-title">
            <span>班级同学</span>
            <span class="student-count">共{{ selectedClass.students.length }}人</span>
          </div>
          <div class="student-list">
            <div v-for="student in selectedClass.students" :key="student.id" class="student-item">
              <el-avatar :size="36" :src="student.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
              <div class="student-info">
                <div class="student-name">{{ student.name }}</div>
                <div class="student-id">{{ student.studentId }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div class="loading-state" v-if="loading">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span>正在加载班级信息...</span>
      </div>
    </div>

    <!-- 加入班级弹窗 -->
    <el-dialog v-model="joinClassDialogVisible" title="加入班级" width="400px">
      <el-form :model="joinForm" :rules="joinFormRules" ref="joinFormRef" label-width="80px">
        <el-form-item label="班级码" prop="classCode">
          <el-input v-model="joinForm.classCode" placeholder="请输入19位班级邀请码" maxlength="19" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="joinClassDialogVisible = false" size="small">取消</el-button>
        <el-button type="primary" @click="handleJoinClass" size="small" :loading="isJoining">申请加入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  Plus, 
  User, 
  School, 
  Calendar, 
  UserFilled, 
  Loading,
  ArrowRight,
  ArrowLeft,
  InfoFilled
} from '@element-plus/icons-vue';
import { joinClass_method } from '../../../api/axios';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const isJoining = ref(false);
const classList = ref([]);
const selectedClass = ref(null);
const joinClassDialogVisible = ref(false);
const joinFormRef = ref(null);
const isSidebarCollapsed = ref(false);

const joinForm = ref({
  classCode: ''
});

const joinFormRules = {
  classCode: [
    { required: true, message: '请输入班级邀请码', trigger: 'blur' },
    { pattern: /^\d{19}$/, message: '班级邀请码必须是19位数字', trigger: 'blur' }
  ]
};

// 假数据
const mockClasses = [
  {
    id: '1',
    name: '软件工程1班',
    major: '软件工程',
    grade: '2023',
    school: '华中科技大学',
    teacherName: '张教授',
    teacherEmail: 'zhang@university.edu',
    teacherAvatar: '',
    studentCount: 32,
    students: [
      { id: '1', name: '李明', studentId: '2023001', avatar: '' },
      { id: '2', name: '王华', studentId: '2023002', avatar: '' },
      { id: '3', name: '赵芳', studentId: '2023003', avatar: '' },
      { id: '4', name: '钱伟', studentId: '2023004', avatar: '' },
      { id: '5', name: '孙阳', studentId: '2023005', avatar: '' },
      { id: '6', name: '周梅', studentId: '2023006', avatar: '' },
      { id: '7', name: '吴涛', studentId: '2023007', avatar: '' },
      { id: '8', name: '郑杰', studentId: '2023008', avatar: '' },
    ]
  },
  {
    id: '2',
    name: '数据科学导论班',
    major: '数据科学',
    grade: '2023',
    school: '北京大学',
    teacherName: '李教授',
    teacherEmail: 'li@university.edu',
    teacherAvatar: '',
    studentCount: 28,
    students: [
      { id: '11', name: '张三', studentId: '2023101', avatar: '' },
      { id: '12', name: '李四', studentId: '2023102', avatar: '' },
      { id: '13', name: '王五', studentId: '2023103', avatar: '' },
      { id: '14', name: '刘六', studentId: '2023104', avatar: '' },
    ]
  },
  {
    id: '3',
    name: '人工智能基础班',
    major: '人工智能',
    grade: '2022',
    school: '清华大学',
    teacherName: '陈教授',
    teacherEmail: 'chen@university.edu',
    teacherAvatar: '',
    studentCount: 25,
    students: [
      { id: '21', name: '朱琪', studentId: '2022201', avatar: '' },
      { id: '22', name: '秦明', studentId: '2022202', avatar: '' },
      { id: '23', name: '胡文', studentId: '2022203', avatar: '' },
    ]
  }
];

// 模拟加载数据
const fetchClassList = async () => {
  loading.value = true;
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 600));
    classList.value = mockClasses;
    if (classList.value.length > 0) {
      selectedClass.value = classList.value[0];
    }
  } catch (error) {
    console.error('获取班级列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const selectClass = (classItem) => {
  selectedClass.value = classItem;
};

const showJoinClassDialog = () => {
  joinClassDialogVisible.value = true;
  joinForm.value.classCode = '';
  if (joinFormRef.value) {
    joinFormRef.value.resetFields();
  }
};

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const handleJoinClass = async () => {
  if (!joinFormRef.value) return;
  
  try {
    // 验证表单
    await joinFormRef.value.validate();
    
    // 显示加载状态
    isJoining.value = true;
    
    // 调用加入班级接口
    await joinClass_method(joinForm.value.classCode);
    
    // 关闭对话框
    joinClassDialogVisible.value = false;
    
    // 刷新班级列表
    fetchClassList();
    
  } catch (error) {
    console.error('申请加入班级失败:', error);
  } finally {
    isJoining.value = false;
  }
};

onMounted(() => {
  fetchClassList();
});
</script>

<style scoped>
.class-view-container {
  /* 移除height设置，使用父容器的高度 */
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
  padding: 0;
  overflow: hidden;
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.page-title {
  font-size: 20px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 24px 32px;
  /* 移除overflow设置，使用父容器的滚动 */
  position: relative;
}

.sidebar-container {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  background: #fff;
  transition: all 0.3s ease;
  width: 280px;
  flex-shrink: 0;
  overflow: hidden;
}

.sidebar-container.collapsed {
  width: 68px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  font-weight: 500;
  color: #303133;
  user-select: none;
}

.sidebar-header:hover {
  background-color: #f5f7fa;
}

.sidebar-header .el-icon {
  transition: transform 0.3s;
}

.sidebar-header .is-collapsed {
  transform: rotate(180deg);
}

.class-cards-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding: 16px;
}

.class-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  transition: all 0.25s;
  cursor: pointer;
}

.class-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.active-card {
  border-color: #4096ff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.class-card-header {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f2f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.class-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.class-card-content {
  padding: 12px 16px;
}

.class-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #606266;
}

/* 迷你列表样式 */
.mini-class-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  overflow-y: auto;
}

.mini-class-item {
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.25s;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mini-class-item:hover {
  transform: translateY(-2px);
}

.active-mini-card::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  background: #4096ff;
  border-radius: 50%;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
}

.active-mini-card .el-avatar {
  border: 2px solid #4096ff;
}

.class-detail-container {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border: 1px solid #ebeef5;
}

.class-detail-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f2f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-title h3 {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 500;
}

.detail-subtitle {
  color: #909399;
  font-size: 13px;
}

.teacher-section, .classmates-section {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f2f5;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.student-count {
  font-size: 13px;
  color: #909399;
  font-weight: normal;
}

.teacher-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.teacher-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.teacher-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.teacher-email {
  font-size: 13px;
  color: #909399;
}

.student-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.student-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 200px;
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.student-name {
  font-size: 14px;
  color: #303133;
}

.student-id {
  font-size: 12px;
  color: #909399;
}

.empty-state {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  color: #909399;
}

.loading-icon {
  font-size: 24px;
  animation: spin 1.2s infinite linear;
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #909399;
  gap: 10px;
}

.mini-loading, .mini-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
  font-size: 20px;
}

.empty-class-list {
  padding: 20px 0;
  display: flex;
  justify-content: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 16px;
    gap: 16px;
  }
  
  .sidebar-container {
    width: 100%;
    max-height: unset;
  }
  
  .sidebar-container.collapsed {
    width: 100%;
    max-height: 48px;
  }

  .mini-class-list {
    display: none;
  }
  
  .student-list {
    gap: 16px;
  }
  
  .student-item {
    width: 100%;
  }
}
</style>
