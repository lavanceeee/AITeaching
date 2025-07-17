<template>
  <div class="class-details-container">
    <div v-if="loading" class="loading-state">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>正在加载班级信息...</span>
    </div>
    
    <template v-else-if="classData">
      <!-- 优化后的顶栏 -->
      <div class="class-header">
        <div class="header-main">
          <div class="header-left">
            <router-link to="/teacher/class" class="back-link">
              <el-icon><ArrowLeft /></el-icon>
            </router-link>
            <div class="title-container">
              <h2>{{ classData.baseInfo.name }}</h2>
              <div class="class-meta">
                <span class="tag-item">{{ classData.baseInfo.major }}</span>
                <span class="separator">•</span>
                <span class="tag-item">{{ classData.baseInfo.grade }}级</span>
                <span class="separator">•</span>
                <span class="tag-item">{{ classData.baseInfo.school }}</span>
                <span class="status-badge" :class="classData.baseInfo.status === 1 ? 'active' : 'inactive'">
                  {{ classData.baseInfo.status === 1 ? '已激活' : '未激活' }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="header-actions">
            <el-button type="primary" plain class="action-btn">班级公告</el-button>
            <el-dropdown trigger="click">
              <el-button class="action-btn">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>编辑班级</el-dropdown-item>
                  <el-dropdown-item>班级设置</el-dropdown-item>
                  <el-dropdown-item divided type="danger">删除班级</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <!-- 导航栏 -->
        <div class="class-nav">
          <div class="nav-container">
            <router-link 
              :to="`/teacher/class/${classId}/classInfo`" 
              class="nav-item" 
              active-class="active"
            >
              <el-icon><InfoFilled /></el-icon>
              <span>班级信息</span>
            </router-link>
            <router-link 
              :to="`/teacher/class/${classId}/students`" 
              class="nav-item" 
              active-class="active"
            >
              <el-icon><UserFilled /></el-icon>
              <span>学生管理</span>
            </router-link>
            <router-link 
              :to="`/teacher/class/${classId}/homework`" 
              class="nav-item" 
              active-class="active"
            >
              <el-icon><Document /></el-icon>
              <span>作业管理</span>
            </router-link>
            <router-link 
              :to="`/teacher/class/${classId}/information`" 
              class="nav-item" 
              active-class="active"
            >
              <el-icon><MessageBox /></el-icon>
              <span>信息通知</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- 路由出口 -->
      <div class="class-content">
        <router-view :class-data="classData" />
      </div>
    </template>
    
    <div v-else class="empty-state">
      <el-empty description="未找到班级数据" />
      <el-button type="primary" @click="$router.push('/teacher/class')">返回班级列表</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  Loading, 
  InfoFilled, 
  DocumentCopy, 
  Edit, 
  Delete, 
  MoreFilled, 
  Message, 
  Document, 
  CircleClose,
  ArrowLeft,
  ArrowDown,
  Bell,
  Setting,
  MessageBox,
  UserFilled
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getClassInfoById } from '../../api/axios';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const classData = ref(null);

// 获取班级ID
const classId = computed(() => route.params.id);

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

// 复制班级码
const copyClassCode = (code) => {
  navigator.clipboard.writeText(code)
    .then(() => {
      ElMessage({
        message: '班级码已复制到剪贴板',
        type: 'success',
        duration: 2000
      });
    })
    .catch(err => {
      console.error('复制失败:', err);
      ElMessage({
        message: '复制失败，请手动复制',
        type: 'error',
        duration: 2000
      });
    });
};

// 加载班级数据
const fetchClassData = async () => {
  loading.value = true;
  try {
    const data = await getClassInfoById(classId.value);
    classData.value = data;
    
    // 如果当前路径是具体班级页但没有子路由，则默认跳转到班级信息页
    if (route.path === `/teacher/class/${classId.value}`) {
      router.replace(`/teacher/class/${classId.value}/classInfo`);
    }
  } catch (error) {
    console.error('获取班级信息失败:', error);
    ElMessage.error('获取班级信息失败');
    classData.value = null;
  } finally {
    loading.value = false;
  }
};

// 监听路由变化重新获取数据
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId) {
    fetchClassData();
  }
});

// 页面加载时获取数据
onMounted(() => {
  fetchClassData();
});
</script>

<style scoped>
.class-details-container {
  padding: 0; /* 移除顶部填充 */
  height: 100%;
}

/* 顶栏样式 */
.class-header {
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-link {
  color: #909399;
  transition: all 0.2s;
  font-size: 18px;
}

.back-link:hover {
  color: #409eff;
}

.title-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title-container h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.class-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  color: #606266;
  font-size: 14px;
}

.tag-item {
  color: #606266;
}

.separator {
  margin: 0 8px;
  color: #dcdfe6;
}

.status-badge {
  margin-left: 12px;
  font-size: 13px;
  border-radius: 10px;
  padding: 2px 10px;
  display: inline-block;
}

.status-badge.active {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.status-badge.inactive {
  background-color: rgba(144, 147, 153, 0.1);
  color: #909399;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 9px 20px;
  font-weight: 500;
}

/* 导航栏样式 */
.class-nav {
  border-top: 1px solid #f0f0f0;
  background-color: #fff;
}

.nav-container {
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  color: #606266;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  position: relative;
  transition: color 0.2s;
}

.nav-item:hover {
  color: #409eff;
}

.nav-item.active {
  color: #409eff;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #409eff;
}

/* 内容区样式 */
.class-content {
  padding: 0 24px;
  max-width: 1200px;
  margin: 0 auto;
  height: calc(100% - 140px);
  overflow-y: auto;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}

.loading-icon {
  font-size: 32px;
  animation: spin 1.2s infinite linear;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .header-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .action-btn {
    padding: 9px 15px;
  }
  
  .class-details-container {
    padding: 0;
  }
  
  .nav-container {
    overflow-x: auto;
    padding: 0 16px;
  }
  
  .nav-item {
    padding: 12px 10px;
    white-space: nowrap;
  }
}
</style>
