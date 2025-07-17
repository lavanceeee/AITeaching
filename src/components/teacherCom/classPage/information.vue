<template>
  <div class="information-container">
    <div class="information-header">
      <div class="search-area">
        <el-input
          v-model="searchQuery"
          placeholder="搜索通知"
          prefix-icon="Search"
          clearable
          class="search-input"
        />
        <el-select v-model="typeFilter" placeholder="通知类型" class="type-filter">
          <el-option label="全部类型" value="" />
          <el-option label="公告" value="announcement" />
          <el-option label="消息" value="message" />
          <el-option label="活动" value="activity" />
        </el-select>
      </div>
      <div class="action-buttons">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          发布通知
        </el-button>
      </div>
    </div>
    
    <div class="information-body">
      <div v-if="filteredNotices.length > 0" class="notice-list">
        <div v-for="(notice, index) in filteredNotices" :key="index" class="notice-item">
          <div class="notice-header">
            <div class="notice-type-icon" :class="getTypeClass(notice.type)">
              <el-icon>
                <component :is="getTypeIcon(notice.type)"></component>
              </el-icon>
            </div>
            <div class="notice-info">
              <div class="notice-title">
                <span class="title-text">{{ notice.title }}</span>
                <el-tag 
                  v-if="notice.pinned" 
                  type="danger" 
                  effect="dark"
                  size="small"
                  class="pin-tag"
                >
                  置顶
                </el-tag>
              </div>
              <div class="notice-meta">
                <span class="publish-time">{{ formatDate(notice.publishTime) }}</span>
                <span class="publisher">{{ notice.publisher }}</span>
                <span class="read-count">{{ notice.readCount }} 人已读</span>
              </div>
            </div>
            <div class="notice-actions">
              <el-dropdown trigger="click">
                <el-button type="primary" text>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleEditNotice(notice)">
                      <el-icon><Edit /></el-icon>编辑
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleTogglePin(notice)">
                      <el-icon><Top /></el-icon>{{ notice.pinned ? '取消置顶' : '置顶' }}
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleViewReadStatus(notice)">
                      <el-icon><View /></el-icon>查看已读情况
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleDeleteNotice(notice)" class="text-danger">
                      <el-icon><Delete /></el-icon>删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          
          <div class="notice-content">
            <div class="notice-text" v-html="notice.content"></div>
            
            <div v-if="notice.attachments && notice.attachments.length" class="notice-attachments">
              <div class="attachment-list">
                <div 
                  v-for="(attachment, i) in notice.attachments" 
                  :key="i"
                  class="attachment-item"
                >
                  <el-icon><Document /></el-icon>
                  <span class="attachment-name">{{ attachment.name }}</span>
                  <el-button type="primary" link size="small" @click="downloadAttachment(attachment)">
                    下载
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <el-empty v-else description="暂无通知信息" />
      
      <!-- 分页控件 -->
      <div class="pagination-container" v-if="filteredNotices.length > 0">
        <el-pagination
          v-model:currentPage="currentPage"
          :page-size="pageSize"
          layout="prev, pager, next"
          :total="totalNotices"
          @current-change="handlePageChange"
        />
      </div>
    </div>
    
    <!-- 创建通知对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="发布通知"
      width="700px"
    >
      <div class="create-notice-form">
        <el-form :model="newNotice" label-width="100px">
          <el-form-item label="通知标题" required>
            <el-input v-model="newNotice.title" placeholder="请输入通知标题" />
          </el-form-item>
          
          <el-form-item label="通知类型" required>
            <el-radio-group v-model="newNotice.type">
              <el-radio label="announcement">公告</el-radio>
              <el-radio label="message">消息</el-radio>
              <el-radio label="activity">活动</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="通知内容" required>
            <div class="editor-container">
              <!-- 这里可以集成富文本编辑器，如wangEditor, TinyMCE等 -->
              <el-input 
                v-model="newNotice.content" 
                type="textarea" 
                :rows="6" 
                placeholder="请输入通知内容"
              />
            </div>
          </el-form-item>
          
          <el-form-item label="附件">
            <el-upload
              class="notice-upload"
              multiple
              :limit="5"
              action="#"
              :auto-upload="false"
            >
              <el-button type="primary" plain>
                <el-icon><Upload /></el-icon>添加附件
              </el-button>
              <template #tip>
                <div class="upload-tip">
                  支持各种格式文件，单个文件不超过 10MB
                </div>
              </template>
            </el-upload>
          </el-form-item>
          
          <el-form-item label="置顶通知">
            <el-switch
              v-model="newNotice.pinned"
              :active-value="true"
              :inactive-value="false"
            />
            <span class="switch-hint">置顶通知将始终显示在列表顶部</span>
          </el-form-item>
          
          <el-form-item label="推送方式">
            <el-checkbox-group v-model="newNotice.pushMethods">
              <el-checkbox label="app">应用内推送</el-checkbox>
              <el-checkbox label="email">邮件通知</el-checkbox>
              <el-checkbox label="sms">短信通知</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleCreateNotice">发布通知</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 查看已读情况对话框 -->
    <el-dialog
      v-model="showReadStatusDialog"
      title="已读情况"
      width="600px"
    >
      <div v-if="currentNotice" class="read-status-content">
        <div class="read-summary">
          <div class="read-stat-item">
            <div class="stat-number">{{ currentNotice.readCount }}</div>
            <div class="stat-label">已读人数</div>
          </div>
          <div class="read-stat-item">
            <div class="stat-number">{{ currentNotice.total - currentNotice.readCount }}</div>
            <div class="stat-label">未读人数</div>
          </div>
          <div class="read-stat-item">
            <div class="stat-number">{{ ((currentNotice.readCount / currentNotice.total) * 100).toFixed(0) }}%</div>
            <div class="stat-label">已读比例</div>
          </div>
        </div>
        
        <el-tabs v-model="readStatusTab">
          <el-tab-pane label="已读学生" name="read">
            <div class="student-list">
              <div v-for="(student, index) in readStudents" :key="index" class="student-item">
                <el-avatar :size="30" :src="student.avatar"></el-avatar>
                <span class="student-name">{{ student.name }}</span>
                <span class="read-time">{{ formatDate(student.readTime) }}</span>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="未读学生" name="unread">
            <div class="student-list">
              <div v-for="(student, index) in unreadStudents" :key="index" class="student-item">
                <el-avatar :size="30" :src="student.avatar"></el-avatar>
                <span class="student-name">{{ student.name }}</span>
                <span class="student-id">{{ student.studentId }}</span>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
        
        <div class="read-actions">
          <el-button @click="handleSendReminder" type="primary" plain>
            <el-icon><Bell /></el-icon>
            发送提醒
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Search, 
  Plus, 
  Edit, 
  Delete, 
  MoreFilled, 
  Document, 
  Upload,
  Bell,
  View,
  ChatDotSquare,
  Top,
  Calendar,
  Notification,
  Picture
} from '@element-plus/icons-vue';

const props = defineProps({
  classData: {
    type: Object,
    required: true
  }
});

// 查询和过滤
const searchQuery = ref('');
const typeFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const showCreateDialog = ref(false);
const showReadStatusDialog = ref(false);
const readStatusTab = ref('read');
const currentNotice = ref(null);

// 模拟通知数据
const notices = ref([
  {
    id: 1,
    title: '期末考试安排通知',
    type: 'announcement',
    content: '<p>各位同学：</p><p>期末考试将于6月20日开始，请各位同学做好复习准备。考试安排如下：</p><ol><li>计算机网络：6月20日上午9:00-11:00</li><li>数据结构：6月21日下午2:00-4:00</li><li>操作系统：6月22日上午9:00-11:00</li></ol><p>请各位同学准时参加，带好学生证和考试用品。</p>',
    publishTime: '2023-06-01 10:00:00',
    publisher: '张老师',
    readCount: 25,
    total: 30,
    pinned: true,
    attachments: [
      { id: 1, name: '期末考试座位安排.xlsx' },
      { id: 2, name: '考场规则.pdf' }
    ]
  },
  {
    id: 2,
    title: '班级团建活动通知',
    type: 'activity',
    content: '<p>各位同学：</p><p>为了增强班级凝聚力，本周六（5月15日）将组织班级团建活动，地点为市郊森林公园，请有意愿参加的同学在下方链接中报名登记。</p><p>活动内容：烧烤、游戏、交流分享</p><p>时间：上午10:00集合</p>',
    publishTime: '2023-05-10 14:30:00',
    publisher: '班主任',
    readCount: 28,
    total: 30,
    pinned: false,
    attachments: [
      { id: 3, name: '活动地点地图.jpg' }
    ]
  },
  {
    id: 3,
    title: '关于提交实习报告的通知',
    type: 'message',
    content: '<p>各位参加校外实习的同学：</p><p>请于本周五（5月5日）前提交实习报告和实习单位评价表，可通过邮件或现场交至辅导员办公室。</p><p>实习报告模板已上传至班级群文件。</p>',
    publishTime: '2023-05-02 09:15:00',
    publisher: '辅导员',
    readCount: 15,
    total: 30,
    pinned: false,
    attachments: [
      { id: 4, name: '实习报告模板.docx' },
      { id: 5, name: '实习单位评价表.pdf' }
    ]
  }
]);

// 新通知表单数据
const newNotice = ref({
  title: '',
  type: 'announcement',
  content: '',
  pinned: false,
  pushMethods: ['app']
});

// 模拟已读/未读学生数据
const readStudents = ref([
  { id: 1, name: '李明', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', readTime: '2023-06-01 10:30:00', studentId: '20210101' },
  { id: 2, name: '王芳', avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', readTime: '2023-06-01 11:15:00', studentId: '20210102' }
]);

const unreadStudents = ref([
  { id: 3, name: '张三', avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png', studentId: '20210103' },
  { id: 4, name: '李四', avatar: 'https://cube.elemecdn.com/1/8c/a0d67c2fca1eb1e2a3efef214f0a7png.png', studentId: '20210104' }
]);

// 根据搜索和过滤条件筛选通知
const filteredNotices = computed(() => {
  let result = notices.value;
  
  // 搜索关键词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(notice => 
      notice.title.toLowerCase().includes(query) || 
      notice.content.toLowerCase().includes(query)
    );
  }
  
  // 类型过滤
  if (typeFilter.value) {
    result = result.filter(notice => notice.type === typeFilter.value);
  }
  
  // 先按置顶排序，再按发布时间排序
  result = result.slice().sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.publishTime) - new Date(a.publishTime);
  });
  
  return result;
});

// 总通知数
const totalNotices = computed(() => filteredNotices.value.length);

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '未知';
  
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取通知类型的图标和类名
const getTypeIcon = (type) => {
  switch (type) {
    case 'announcement': return Notification;
    case 'message': return ChatDotSquare;
    case 'activity': return Calendar;
    default: return Document;
  }
};

const getTypeClass = (type) => {
  return `type-${type}`;
};

// 处理分页
const handlePageChange = (page) => {
  currentPage.value = page;
};

// 通知相关操作
const handleEditNotice = (notice) => {
  ElMessage.success(`正在编辑通知：${notice.title}`);
  // 实现编辑功能
};

const handleTogglePin = (notice) => {
  notice.pinned = !notice.pinned;
  ElMessage.success(notice.pinned ? `已置顶通知：${notice.title}` : `已取消置顶：${notice.title}`);
};

const handleViewReadStatus = (notice) => {
  currentNotice.value = notice;
  showReadStatusDialog.value = true;
};

const handleDeleteNotice = (notice) => {
  ElMessageBox.confirm(
    `确定要删除通知 "${notice.title}" 吗？此操作不可恢复。`,
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    notices.value = notices.value.filter(item => item.id !== notice.id);
    ElMessage.success(`已删除通知：${notice.title}`);
  }).catch(() => {});
};

// 下载附件
const downloadAttachment = (attachment) => {
  ElMessage.success(`正在下载文件：${attachment.name}`);
  // 实现下载功能
};

// 发布新通知
const handleCreateNotice = () => {
  // 表单验证
  if (!newNotice.value.title) {
    ElMessage.warning('请填写通知标题');
    return;
  }
  
  if (!newNotice.value.content) {
    ElMessage.warning('请填写通知内容');
    return;
  }
  
  // 模拟创建通知
  const newId = notices.value.length + 1;
  const now = new Date();
  
  notices.value.unshift({
    id: newId,
    title: newNotice.value.title,
    type: newNotice.value.type,
    content: newNotice.value.content,
    publishTime: now.toISOString(),
    publisher: '当前教师', // 实际应用中应该使用当前登录的教师信息
    readCount: 0,
    total: props.classData?.baseInfo?.studentCount || 30,
    pinned: newNotice.value.pinned,
    attachments: []
  });
  
  ElMessage.success('通知发布成功');
  showCreateDialog.value = false;
  
  // 重置表单
  newNotice.value = {
    title: '',
    type: 'announcement',
    content: '',
    pinned: false,
    pushMethods: ['app']
  };
};

// 发送提醒
const handleSendReminder = () => {
  if (!currentNotice.value) return;
  
  ElMessageBox.confirm(
    `确定要向未读学生发送提醒吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  ).then(() => {
    ElMessage.success(`已向未读学生发送提醒`);
    // 实际实现提醒逻辑
  }).catch(() => {});
};
</script>

<style scoped>
.information-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.information-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.search-area {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  width: 240px;
}

.type-filter {
  width: 140px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.information-body {
  min-height: 400px;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.notice-item {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 16px;
  transition: all 0.2s ease;
}

.notice-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.notice-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.notice-type-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.type-announcement {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.type-message {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.type-activity {
  background-color: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.notice-info {
  flex: 1;
  min-width: 0;
}

.notice-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.title-text {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.pin-tag {
  margin-left: 8px;
}

.notice-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  color: #909399;
  font-size: 13px;
}

.notice-content {
  padding: 0 0 0 56px;
}

.notice-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 16px;
}

.notice-attachments {
  margin-top: 16px;
  padding: 12px;
  background-color: #f9f9fa;
  border-radius: 8px;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: white;
  border: 1px solid #ebeef5;
}

.attachment-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.create-notice-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 16px;
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.switch-hint {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.read-status-content {
  padding: 0 20px;
}

.read-summary {
  display: flex;
  justify-content: space-around;
  margin-bottom: 24px;
  text-align: center;
}

.read-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.student-list {
  max-height: 300px;
  overflow-y: auto;
}

.student-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.student-name {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

.student-id {
  color: #909399;
  font-size: 13px;
}

.read-time {
  color: #909399;
  font-size: 13px;
}

.read-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .information-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-area,
  .action-buttons {
    width: 100%;
  }
  
  .search-input,
  .type-filter {
    width: 100%;
    margin-bottom: 8px;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
  
  .notice-header {
    flex-direction: column;
  }
  
  .notice-content {
    padding: 0;
  }
  
  .notice-type-icon {
    margin-bottom: 12px;
  }
  
  .notice-actions {
    position: absolute;
    top: 16px;
    right: 16px;
  }
}
</style>
