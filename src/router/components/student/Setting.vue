<template>
  <div class="settings-view" v-if="userInfo">
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
          <el-avatar :size="48" src="/src/assets/icons/mainPageStu/StudentAvatar.svg" />
          <div class="info-text">
            <span class="profile-name">{{ userInfo.username }}</span>
            <span class="profile-detail">学号: {{ userInfo.studentNumber }}</span>
          </div>
        </div>
        <div class="profile-actions">
          <el-button :icon="Edit" circle plain title="编辑" />
          <el-button :icon="Delete" circle plain title="删除" />
          <el-button @click="handleLogout" plain>退出登录</el-button>
        </div>
      </div>
      <div class="settings-list-item">
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
              <div class="detail-item"><span>昵称</span><span>{{ userInfo.nickname || '未设置' }}</span></div>
              <div class="detail-item"><span>性别</span><span>{{ formatGender(userInfo.gender) }}</span></div>
              <div class="detail-item"><span>生日</span><span>{{ formatDate(userInfo.birthday) }}</span></div>
              <div class="detail-item"><span>身份证号</span><span>{{ userInfo.idCard }}</span></div>
            </div>
            
            <!-- Contact Info -->
            <div class="detail-category">
              <h4>联系方式</h4>
              <div class="detail-item"><span>邮箱</span><span>{{ userInfo.email }}</span></div>
              <div class="detail-item"><span>手机号</span><span>{{ userInfo.phone || '未设置' }}</span></div>
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
              <div class="detail-item"><span>毕业日期</span><span>{{ formatDate(userInfo.graduationDate) || '未毕业' }}</span></div>
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
  <div v-else class="loading-state">
    <p>正在加载用户信息...</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStudentInfoStore } from '../../../store/studentInfoStore';
import { ElMessage } from 'element-plus';
import {
  Delete, Operation, Brush, Download, Plus, Edit, User, TopRight, ArrowRight, Memo,
  Refresh, Lock, Folder
} from '@element-plus/icons-vue';

const store = useStudentInfoStore();
store.setTestInfo();
const userInfo = computed(() => store.userInfo);

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
  // 在这里添加登出逻辑
  ElMessage.info('Sign out button clicked.');
  // 例如：
  // localStorage.removeItem('token');
  // router.push('/login');
};
</script>

<style scoped>
.settings-view {
  padding: 2rem 15%;
  background-color: #202124;
  color: #e8eaed;
  height: 100%;
  overflow-y: auto;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #9aa0a6;
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
  color: #e8eaed;
}

.section-description {
  font-size: 0.875rem;
  color: #9aa0a6;
  margin-top: -0.8rem;
  margin-bottom: 1rem;
}

.top-buttons {
  display: flex;
  gap: 0.8rem;
}

.el-button.is-plain {
  --el-button-bg-color: transparent;
  --el-button-border-color: #5f6368;
  --el-button-hover-border-color: #9aa0a6;
  --el-button-hover-bg-color: #2d2e31;
  --el-button-text-color: #e8eaed;
}

.el-button.is-text {
  color: #8ab4f8;
}
.el-button.is-text:hover {
  background-color: rgba(138, 180, 248, 0.1);
}

.profile-card {
  background-color: #2d2e31;
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.profile-name {
  font-size: 1rem;
  font-weight: 500;
}

.profile-detail {
  font-size: 0.875rem;
  color: #9aa0a6;
}

.profile-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.settings-list-item {
  background-color: #2d2e31;
  border-radius: 8px;
  padding: 0.8rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background-color 0.2s;
}

.settings-list-item:hover {
  background-color: #3c4043;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
}

.item-content .el-icon {
  color: #9aa0a6;
}

.collapsible-container {
  background-color: #2d2e31;
  border-radius: 8px;
  overflow: hidden;
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
  border-top: 1px solid #3c4043;
}
.detail-category:first-child {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.detail-category h4 {
  font-size: 0.9rem;
  font-weight: 500;
  color: #8ab4f8;
  margin: 0 0 1rem 0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.875rem;
}

.detail-item span:first-child {
  color: #9aa0a6;
}

.bio {
  font-size: 0.875rem;
  color: #e8eaed;
  line-height: 1.5;
  margin: 0;
}
</style>
