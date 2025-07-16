<template>
  <div class="course-management-container">
    <!-- 1. 顶部通用功能按钮 -->
    <div class="top-actions">
      <h2 class="page-title">我教授的课程</h2>
      <div class="action-buttons">
        <el-button :icon="Filter" plain>筛选课程</el-button>
        <el-button :icon="CopyDocument" plain>批量选择</el-button>
        <el-button :icon="Delete" type="danger" plain>删除选中</el-button>
      </div>
    </div>

    <!-- 2. 课程卡片列表 -->
    <div class="course-grid">
      <!-- 这是一个示例卡片，后续将通过 v-for 循环生成 -->
      <div v-for="course in courses" :key="course.id" class="course-card">
        <div class="card-cover">
          <img :src="course.cover || 'https://images.unsplash.com/photo-1543286386-71314a4e9203?w=500&q=80'" alt="Course Cover"/>
          <div class="card-overlay">
            <el-button circle :icon="MoreFilled" class="more-options-btn"></el-button>
          </div>
        </div>
        <div class="card-body">
          <div class="card-header">
            <h3 class="course-name">{{ course.name }}</h3>
            <el-tag :type="getStatusType(course.status)" size="small" effect="light" round>
              {{ course.statusDesc }}
            </el-tag>
          </div>
          <p class="course-description">{{ course.description }}</p>
          <div class="course-info">
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span>{{ course.startTime }} 至 {{ course.endTime }}</span>
            </div>
            <div class="info-item">
              <el-icon><CollectionTag /></el-icon>
              <span>{{ course.enrolledCount }} / {{ course.capacity }} 人</span>
            </div>
          </div>
          <div class="course-tags">
            <el-tag v-for="tag in course.tags.split(',')" :key="tag" class="tag-item" disable-transitions>
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
       <!-- 更多卡片... -->
    </div>

    <!-- 3. 右下角悬浮新建按钮 -->
    <div class="fab-container" @click="handleCreateCourse">
      <div class="fab-plus-icon">
        <el-icon><Plus /></el-icon>
      </div>
    </div>

    <!-- 新建课程弹窗 -->
    <CreateCourseDialog
      v-model:visible="isCreateCourseDialogVisible"
      @created="handleCourseCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue';
import {
  Filter,
  CopyDocument,
  Delete,
  MoreFilled,
  User,
  Calendar,
  CollectionTag,
  Plus
} from '@element-plus/icons-vue';
import { queryCourses_method } from '../../../api/axios';
import { useTeacherInfoStore } from '../../../store/teacherInfoStore';
import { ElMessage } from 'element-plus';

// 异步加载弹窗组件，优化初始加载性能
const CreateCourseDialog = defineAsyncComponent(() => 
  import('../../../components/teacherCom/uploadProject.vue')
);

const isCreateCourseDialogVisible = ref(false);

// 课程数据将从API获取
const courses = ref([]);

onMounted(() => {
  // 在组件挂载后获取当前教师的课程列表
  fetchCourses();
});

const fetchCourses = async () => {
  const teacherStore = useTeacherInfoStore();
  // 模拟登录时，可以手动设置测试信息
  if (!teacherStore.userInfo.id) {
    teacherStore.setTestInfo();
  }
  const teacherId = teacherStore.userInfo.id;
  if (!teacherId) {
    ElMessage.warning('无法获取教师ID，请确保已登录');
    return;
  }
  try {
    const response = await queryCourses_method({ teacherId, pageSize: 20 });
    // 后端返回的数据在 response.data.records 中
    if (response.data && response.data.records) {
        courses.value = response.data.records;
    } else {
        courses.value = []; // 清空以防数据格式错误
    }
  } catch (error) {
    console.error("获取课程列表失败:", error);
    ElMessage.error("获取课程列表失败，请稍后再试");
  }
};

const getStatusType = (status) => {
  switch (status) {
    case 0: return 'info'; // 草稿
    case 1: return 'success'; // 已发布
    case 2: return ''; // 进行中 (默认主题色)
    case 3: return 'warning'; // 已结束
    case 4: return 'danger'; // 已取消
    default: return 'info';
  }
};

const handleCreateCourse = () => {
  isCreateCourseDialogVisible.value = true;
};

const handleCourseCreated = () => {
  // 课程创建成功后，重新获取课程列表以显示最新数据
  fetchCourses();
};

</script>

<style scoped>
.course-management-container {
  padding: 24px 32px;
  background-color: #f7f8fa;
  height: 100%;
  overflow-y: auto;
  position: relative;
}

/* 1. 顶部操作栏 */
.top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

/* 2. 课程卡片网格 */
.course-grid {
  display: grid;
  /* 调整卡片最小宽度，使其更小 */
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px; /* 减小间距 */
}

.course-card {
  background-color: #ffffff;
  border-radius: 10px; /* 统一圆角 */
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
}

.course-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.card-cover {
  position: relative;
  height: 140px; /* 降低封面高度 */
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.course-card:hover .card-cover img {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 50%);
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 10px; /* 减小内边距 */
}

.more-options-btn {
  --el-button-size: 30px; /* 调整按钮大小 */
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  border: none;
}
.more-options-btn:hover {
  background: white;
}

.card-body {
  padding: 16px; /* 减小内边距 */
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px; /* 减小间距 */
}

.course-name {
  font-size: 16px; /* 减小字体大小 */
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  line-height: 1.3;
}

.course-description {
  font-size: 13px; /* 减小字体大小 */
  color: #7f8c8d;
  line-height: 1.5;
  margin: 0 0 12px; /* 减小间距 */
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-info {
  font-size: 12px; /* 减小字体大小 */
  color: #34495e;
  margin-bottom: 12px; /* 减小间距 */
  display: flex;
  flex-direction: column;
  gap: 6px; /* 减小间距 */
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px; /* 减小间距 */
}

.info-item .el-icon {
  color: #95a5a6;
  font-size: 14px;
}

.course-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px; /* 减小间距 */
  margin-top: auto;
  padding-top: 12px; /* 减小间距 */
  border-top: 1px solid #f0f2f5;
}

.tag-item {
  --el-tag-font-size: 11px; /* 调整标签字体大小 */
  height: 22px; /* 调整标签高度 */
  padding: 0 8px;
  background-color: #f0f2f5;
  color: #7f8c8d;
  border-color: transparent;
}


/* 3. 悬浮操作按钮 (FAB) */
.fab-container {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 52px; /* 减小尺寸 */
  height: 52px; /* 减小尺寸 */
  background: linear-gradient(135deg, #4096ff, #5b9dff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 5px 16px rgba(64, 150, 255, 0.35);
  z-index: 100;
  transition: all 0.3s ease;
}

.fab-container:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 7px 22px rgba(64, 150, 255, 0.45);
}

.fab-container:active {
  transform: translateY(0) scale(1);
}

.fab-plus-icon {
  color: white;
  font-size: 26px; /* 减小图标大小 */
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.fab-container:hover .fab-plus-icon {
  transform: rotate(180deg);
}

</style>