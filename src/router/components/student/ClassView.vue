<template>
  <div class="class-view-container">
    <div class="page-header">
      <h1>我的班级</h1>
      <p>您已加入的班级</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading" size="28"><Loading /></el-icon>
      <p>正在加载班级数据...</p>
    </div>

    <!-- 空状态 -->
    <el-empty v-else-if="!classList.length" description="您尚未加入任何班级">
      <el-button type="primary" @click="goToJoinClass">去加入班级</el-button>
    </el-empty>

    <!-- 主内容区 -->
    <div v-else class="main-content">
      <!-- 左侧可折叠班级列表 -->
      <div class="sidebar-container" :class="{'collapsed': isSidebarCollapsed}">
        <div class="sidebar-header" @click="toggleSidebar">
          <span v-if="!isSidebarCollapsed">班级列表</span>
          <span v-else>班级</span>
          <el-icon :class="{ 'is-collapsed': isSidebarCollapsed }">
            <ArrowRight v-if="isSidebarCollapsed" />
            <ArrowLeft v-else />
          </el-icon>
        </div>
        
        <!-- 展开状态的班级列表 -->
        <div class="class-cards-container" v-show="!isSidebarCollapsed">
          <div 
            v-for="cls in classList" 
            :key="cls.id"
            class="class-card"
            @click="selectClass(cls)"
            :class="{'active-card': selectedClass && selectedClass.id === cls.id}"
          >
            <div class="class-card-header">
              <span class="class-name">{{ cls.name }}</span>
              <el-tag size="small" effect="light">{{ cls.major }}</el-tag>
            </div>
            <div class="class-card-content">
              <div class="class-info">
                <div class="info-item">
                  <el-icon><School /></el-icon>
                  <span>{{ cls.school }}</span>
                </div>
                <div class="info-item">
                  <el-icon><User /></el-icon>
                  <span>{{ cls.studentCount }}名学生</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 折叠状态的班级列表 -->
        <div class="mini-class-list" v-show="isSidebarCollapsed">
          <div 
            v-for="cls in classList" 
            :key="cls.id"
            class="mini-class-item"
            @click="selectClass(cls)"
            :class="{'active-mini-card': selectedClass && selectedClass.id === cls.id}"
            :title="cls.name"
          >
            <el-avatar :size="32" :src="null" :class="{'active-avatar': selectedClass && selectedClass.id === cls.id}">
              {{ cls.name.slice(0, 2) }}
            </el-avatar>
          </div>
        </div>
      </div>

      <!-- 右侧班级详情 -->
      <div class="class-detail-container" v-if="selectedClassDetails">
        <div class="class-detail-header">
          <div class="detail-title">
            <h3>{{ selectedClassDetails.baseInfo.name }}</h3>
            <div class="detail-subtitle">{{ selectedClassDetails.baseInfo.major }} · {{ selectedClassDetails.baseInfo.grade }}</div>
          </div>
          <div class="detail-actions">
            <el-button size="small" plain>班级公告</el-button>
            <el-button size="small" plain>班级任务</el-button>
          </div>
        </div>

        <!-- 班级信息卡片 -->
        <div class="class-info-card">
          <div class="info-card-header">
            <h4>基本信息</h4>
          </div>
          <div class="info-card-body">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">班级ID</span>
                <span class="info-value">{{ selectedClassDetails.baseInfo.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">所属学校</span>
                <span class="info-value">{{ selectedClassDetails.baseInfo.school }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">专业</span>
                <span class="info-value">{{ selectedClassDetails.baseInfo.major }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">年级</span>
                <span class="info-value">{{ selectedClassDetails.baseInfo.grade }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">学生数量</span>
                <span class="info-value">{{ selectedClassDetails.baseInfo.studentCount }}人</span>
              </div>
              <div class="info-item">
                <span class="info-label">状态</span>
                <span class="info-value">
                  <el-tag :type="selectedClassDetails.baseInfo.status === 0 ? 'success' : 'info'" size="small">
                    {{ selectedClassDetails.baseInfo.status === 0 ? '正常' : '归档' }}
                  </el-tag>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">创建时间</span>
                <span class="info-value">{{ formatDate(selectedClassDetails.baseInfo.createTime) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">更新时间</span>
                <span class="info-value">{{ formatDate(selectedClassDetails.baseInfo.updateTime) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 班级学生列表 -->
        <div class="students-section">
          <div class="section-header">
            <h4>班级成员</h4>
            <span class="student-count">共{{ selectedClassDetails.students.length }}人</span>
          </div>
          <div class="students-grid">
            <div v-for="student in selectedClassDetails.students" :key="student.id" class="student-card">
              <el-avatar :size="40" :src="student.avatar || ''">
                {{ student.realname ? student.realname.slice(0, 1) : '?' }}
              </el-avatar>
              <div class="student-info">
                <div class="student-name">{{ student.realname }}</div>
                <div class="student-id">{{ student.studentNumber }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧加载状态 -->
      <div v-else-if="loadingDetails" class="class-detail-loading">
        <el-icon class="is-loading" size="28"><Loading /></el-icon>
        <p>正在加载班级详情...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useStudentInfoStore } from '../../../store/studentInfoStore';
import { queryClassesByStudentId_method, getClassInfoById } from '../../../api/axios';
import { School, User, Tickets, OfficeBuilding, Loading, ArrowLeft, ArrowRight } from '@element-plus/icons-vue';

const router = useRouter();
const studentStore = useStudentInfoStore();
const classList = ref([]);
const loading = ref(true);
const loadingDetails = ref(false);
const selectedClass = ref(null);
const selectedClassDetails = ref(null);
const isSidebarCollapsed = ref(false);

// 获取学生所有班级列表
const fetchClassList = async () => {
  loading.value = true;
  const studentId = studentStore.userInfo?.id;

  if (!studentId) {
    ElMessage.error('无法获取学生信息，请重新登录。');
    loading.value = false;
    return;
  }

  try {
    const data = await queryClassesByStudentId_method(studentId);
    classList.value = data || [];
    
    // 如果有班级，自动选择第一个并加载详情
    if (classList.value.length > 0) {
      selectClass(classList.value[0]);
    }
  } catch (error) {
    console.error('获取班级列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 获取班级详情
const fetchClassDetails = async (classId) => {
  loadingDetails.value = true;
  try {
    const data = await getClassInfoById(classId);
    selectedClassDetails.value = data;
  } catch (error) {
    console.error('获取班级详情失败:', error);
  } finally {
    loadingDetails.value = false;
  }
};

// 选择班级
const selectClass = (cls) => {
  selectedClass.value = cls;
  fetchClassDetails(cls.id);
};

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const goToJoinClass = () => {
  router.push({ name: 'StudentJoinClass' });
};

onMounted(() => {
  // 确保store中已有用户信息
  if (studentStore.userInfo?.id) {
    fetchClassList();
  } else {
    // 如果没有，可能需要等待或触发一个action来获取
    const unwatch = watch(() => studentStore.userInfo, (newInfo) => {
      if (newInfo?.id) {
        fetchClassList();
        unwatch(); // 获取到信息后停止监听
      }
    });
  }
});
</script>

<style scoped>
.class-view-container {
  padding: 24px;
  background-color: #f7f8fa;
  min-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.page-header p {
  font-size: 14px;
  color: #909399;
}

.loading-state, .class-detail-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 50vh;
  color: #909399;
}

.main-content {
  display: flex;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

/* 左侧侧边栏样式 */
.sidebar-container {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  transition: width 0.3s;
  width: 280px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-container.collapsed {
  width: 64px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f2f5;
  font-weight: 500;
  color: #303133;
  cursor: pointer;
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
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  max-height: 600px;
  overflow-y: auto;
}

.class-card {
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  transition: all 0.2s;
  cursor: pointer;
  overflow: hidden;
}

.class-card:hover {
  border-color: #c0c4cc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.active-card {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.class-card-header {
  padding: 12px;
  background: #f7f8fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.class-name {
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.class-card-content {
  padding: 12px;
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

/* 折叠状态的迷你列表 */
.mini-class-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  gap: 16px;
  max-height: 600px;
  overflow-y: auto;
}

.mini-class-item {
  position: relative;
  cursor: pointer;
}

.mini-class-item:hover .el-avatar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.active-mini-card::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  background: #409EFF;
  border-radius: 50%;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
}

.active-avatar {
  border: 2px solid #409EFF;
}

/* 右侧详情区域 */
.class-detail-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

.class-detail-header {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-title h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.detail-subtitle {
  color: #909399;
  font-size: 14px;
}

.class-info-card, .students-section {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
}

.info-card-header, .section-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f2f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-card-header h4, .section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.info-card-body {
  padding: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 13px;
  color: #909399;
}

.info-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  padding: 20px;
}

.student-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #f0f2f5;
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.student-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.student-id {
  font-size: 12px;
  color: #909399;
}

.student-count {
  font-size: 13px;
  color: #909399;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .sidebar-container {
    width: 100%;
    margin-bottom: 16px;
  }
  
  .sidebar-container.collapsed {
    width: 100%;
    height: 60px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .students-grid {
    grid-template-columns: 1fr;
  }
}
</style>
