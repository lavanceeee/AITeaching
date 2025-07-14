<template>
  <div class="settings-view">
    <!-- General Settings -->
    <div class="settings-section">
      <h2 class="section-title">通用设置</h2>
      <div class="top-buttons">
        <el-button :icon="Refresh" plain>同步数据</el-button>
        <el-button :icon="Lock" plain>账号安全</el-button>
        <el-button :icon="Brush" plain>主题设置</el-button>
        <el-button :icon="Folder" plain>下载管理</el-button>
      </div>
    </div>

    <!-- Profile -->
    <div class="settings-section">
      <div class="section-header">
        <h2 class="section-title">个人资料</h2>
        <el-button :icon="Plus" text>切换账号</el-button>
      </div>
      <div class="profile-card">
        <div class="profile-info">
          <el-avatar :size="48" :src="userInfo.avatar"/>
          <div class="info-text">
            <span class="profile-detail">姓名：{{ userInfo.username }}</span>
            <span class="profile-detail">学号: {{ userInfo.studentNumber }}</span>
          </div>
        </div>
        <div class="profile-actions">
          <el-button :icon="Edit" circle plain title="编辑" @click="showUpdateInfoDialog" />
          <el-button :icon="Delete" circle plain title="删除" />
          <el-button @click="handleLogout" plain>退出登录</el-button>
        </div>
      </div>
      <div class="settings-list-item" @click="showUpdateInfoDialog" style="margin-top: 0.5rem;">
        <div class="item-content">
          <el-icon><User /></el-icon>
          <span>管理我的智慧通账号</span>
        </div>
        <el-icon><TopRight /></el-icon>
      </div>
    </div>

    <!-- Detailed Info (Collapsible) -->
    <div class="settings-section">
      <h2 class="section-title">详细资料设置</h2>
      <p class="section-description">以下是您的详细个人资料，部分信息可能无法自行修改。</p>
      
      <div class="collapsible-container">
        <div class="settings-list-item" @click="toggleDetails">
          <div class="item-content">
            <el-icon><Memo /></el-icon>
            <span>详细个人信息</span>
          </div>
          <el-icon class="chevron-icon" :class="{ 'is-expanded': isDetailsVisible }"><ArrowRight /></el-icon>
        </div>
        
        <el-collapse-transition>
          <div v-show="isDetailsVisible" class="details-content">
            <!-- Personal Info -->
            <div class="detail-category">
              <h4>基础信息</h4>
              <div class="detail-item"><span>真实姓名</span><span>{{ userInfo.realName }}</span></div>
              <div class="detail-item"><span>昵称</span><span>{{ userInfo.nickname }}</span></div>
              <div class="detail-item"><span>性别</span><span>{{ formatGender(userInfo.gender) }}</span></div>
              <div class="detail-item"><span>生日</span><span>{{ formatDate(userInfo.birthday) }}</span></div>
              <div class="detail-item"><span>身份证号</span><span>{{ userInfo.idCard }}</span></div>
            </div>
            
            <!-- Contact Info -->
            <div class="detail-category">
              <h4>联系方式</h4>
              <div class="detail-item"><span>邮箱</span><span>{{ userInfo.email }}</span></div>
              <div class="detail-item"><span>手机号</span><span>{{ userInfo.phone}}</span></div>
            </div>

            <!-- Academic Info -->
            <div class="detail-category">
              <h4>学籍信息</h4>
              <div class="detail-item"><span>学校</span><span>{{ userInfo.school }}</span></div>
              <div class="detail-item"><span>学院</span><span>{{ userInfo.college }}</span></div>
              <div class="detail-item"><span>年级</span><span>{{ userInfo.grade }}</span></div>
              <div class="detail-item"><span>专业</span><span>{{ userInfo.major }}</span></div>
              <div class="detail-item"><span>班级</span><span>{{ userInfo.className }}</span></div>
              <div class="detail-item"><span>入学日期</span><span>{{ formatDate(userInfo.enrollmentDate) }}</span></div>
              <div class="detail-item"><span>毕业日期</span><span>{{ formatDate(userInfo.graduationDate) }}</span></div>
            </div>

             <!-- Bio -->
            <div class="detail-category">
              <h4>个人简介</h4>
              <p class="bio">{{ userInfo.bio || '暂无简介' }}</p>
            </div>
          </div>
        </el-collapse-transition>
      </div>
    </div>

  </div>
  <!-- <div v-else class="loading-state">
    <p>正在加载用户信息...</p>
  </div> -->
  
  <!-- Update Info Dialog -->
  <UpdateInfo v-model:visible="isUpdateInfoVisible" />
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStudentInfoStore } from '../../../store/studentInfoStore';
import { ElMessage } from 'element-plus';
import {
  Delete, Operation, Brush, Download, Plus, Edit, User, TopRight, ArrowRight, Memo,
  Refresh, Lock, Folder
} from '@element-plus/icons-vue';
import UpdateInfo from '../../../components/studentCom/UpdateInfo.vue';
import router from '../../../router';

const store = useStudentInfoStore();
// store.setTestInfo();
const userInfo = computed(() => store.userInfo);

const isUpdateInfoVisible = ref(false);

const showUpdateInfoDialog = () => {
  isUpdateInfoVisible.value = true;
};

const isDetailsVisible = ref(false);

const toggleDetails = () => {
  isDetailsVisible.value = !isDetailsVisible.value;
};

const formatGender = (gender) => {
  if (gender === 1) return '男';
  if (gender === 2) return '女';
  return '未知';
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString();
};

const handleLogout = () => {
  ElMessage.success('退出登录成功');
  localStorage.removeItem('token');
  localStorage.removeItem('identity');
  router.push('/login');
};
</script>

<style scoped>
.settings-view {
  padding: 2rem 15%;
  background-color: #f0f2f5;
  color: #303133;
  height: 100%;
  overflow-y: auto;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
}

.settings-section {
  margin-bottom: 2.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 400;
  color: #303133;
}

.section-description {
  font-size: 0.875rem;
  color: #909399;
  margin-top: -0.8rem;
  margin-bottom: 1rem;
}

.top-buttons {
  display: flex;
  gap: 0.8rem;
}

.el-button.is-plain {
  --el-button-bg-color: transparent;
  --el-button-border-color: #dcdfe6;
  --el-button-hover-border-color: #c6e2ff;
  --el-button-hover-bg-color: #ecf5ff;
  --el-button-text-color: #606266;
}

.el-button.is-text {
  color: #409eff;
}
.el-button.is-text:hover {
  background-color: rgba(64, 158, 255, 0.1);
}

.profile-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #dcdfe6;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-text {
  display: flex;
  flex-direction: column;
}

.profile-detail {
  font-size: 0.875rem;
  color: #909399;
}

.profile-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.settings-list-item {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 0.8rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  /* margin-top: 0.5rem; */
  transition: background-color 0.2s;
  /* border: 1px solid #dcdfe6; */
}

.settings-list-item:hover {
  background-color: #f5f7fa;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
}

.item-content .el-icon {
  color: #909399;
}

.collapsible-container {
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.details-content {
  padding: 0 1.25rem 1.25rem;
}

.chevron-icon {
  transition: transform 0.3s ease;
}

.chevron-icon.is-expanded {
  transform: rotate(90deg);
}

.detail-category {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #ebeef5;
}
.detail-category:first-child {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.detail-category h4 {
  font-size: 0.9rem;
  font-weight: 500;
  color: #409eff;
  margin: 0 0 1rem 0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.875rem;
}

.detail-item span:first-child {
  color: #909399;
}

.bio {
  font-size: 0.875rem;
  color: #606266;
  line-height: 1.5;
  margin: 0;
}
</style>
