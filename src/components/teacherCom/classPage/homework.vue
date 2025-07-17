<template>
  <div class="homework-container">
    <div class="homework-header">
      <div class="search-filter">
        <el-input
          v-model="searchQuery"
          placeholder="搜索作业"
          prefix-icon="Search"
          clearable
          class="search-input"
        />
        <el-select v-model="statusFilter" placeholder="状态" class="status-filter">
          <el-option label="全部状态" value="" />
          <el-option label="进行中" value="active" />
          <el-option label="已结束" value="ended" />
          <el-option label="未开始" value="pending" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          class="date-range"
        />
      </div>
      <div class="action-buttons">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          发布作业
        </el-button>
      </div>
    </div>
    
    <div class="homework-body">
      <!-- 作业列表 -->
      <div v-if="filteredHomework.length > 0" class="homework-list">
        <div v-for="(homework, index) in filteredHomework" :key="index" class="homework-card">
          <div class="homework-card-header">
            <div class="homework-title">
              <h3>{{ homework.title }}</h3>
              <div class="homework-tags">
                <el-tag 
                  :type="getStatusType(homework.status)" 
                  size="small"
                >
                  {{ getStatusText(homework.status) }}
                </el-tag>
                <el-tag 
                  v-if="homework.isImportant" 
                  type="danger" 
                  effect="dark"
                  size="small"
                >
                  重要
                </el-tag>
              </div>
            </div>
            <div class="homework-actions">
              <el-dropdown trigger="click">
                <el-button type="primary" text>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleEditHomework(homework)">
                      <el-icon><Edit /></el-icon>编辑
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleViewSubmissions(homework)">
                      <el-icon><Document /></el-icon>查看提交
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleArchiveHomework(homework)">
                      <el-icon><Folder /></el-icon>归档
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleDeleteHomework(homework)" class="text-danger">
                      <el-icon><Delete /></el-icon>删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          
          <div class="homework-content">
            <div class="homework-description">
              {{ homework.description }}
            </div>
            
            <div class="homework-attachments" v-if="homework.attachments && homework.attachments.length">
              <div class="attachment-label">
                <el-icon><Document /></el-icon>
                <span>附件:</span>
              </div>
              <div class="attachment-list">
                <el-tag 
                  v-for="(attachment, i) in homework.attachments" 
                  :key="i"
                  class="attachment-tag"
                  effect="plain"
                >
                  <el-icon><Document /></el-icon>
                  {{ attachment.name }}
                </el-tag>
              </div>
            </div>
          </div>
          
          <div class="homework-footer">
            <div class="homework-meta">
              <div class="date-range">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(homework.startDate) }} - {{ formatDate(homework.endDate) }}</span>
              </div>
              <div class="homework-stats">
                <div class="submission-stat">
                  <el-icon><Collection /></el-icon>
                  <span>{{ homework.submitted }}/{{ homework.total }}人已提交</span>
                </div>
                <div class="progress-bar">
                  <el-progress 
                    :percentage="calculateProgress(homework)" 
                    :status="getProgressStatus(homework)"
                    :stroke-width="8"
                    :show-text="false"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <el-empty v-else description="暂无作业数据" />
    </div>
    
    <!-- 创建作业对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="发布新作业"
      width="700px"
    >
      <div class="create-homework-form">
        <el-form :model="newHomework" label-width="100px">
          <el-form-item label="作业标题" required>
            <el-input v-model="newHomework.title" placeholder="请输入作业标题" />
          </el-form-item>
          
          <el-form-item label="作业描述">
            <el-input 
              v-model="newHomework.description" 
              type="textarea" 
              :rows="4" 
              placeholder="请输入作业详情描述"
            />
          </el-form-item>
          
          <el-form-item label="起止时间" required>
            <el-date-picker
              v-model="newHomework.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="截止时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="date-time-range"
            />
          </el-form-item>
          
          <el-form-item label="作业附件">
            <el-upload
              class="homework-upload"
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
                  支持 Word、PDF、图片等多种格式，单个文件不超过 10MB
                </div>
              </template>
            </el-upload>
          </el-form-item>
          
          <el-form-item label="重要程度">
            <el-switch
              v-model="newHomework.isImportant"
              :active-value="true"
              :inactive-value="false"
              inline-prompt
              active-text="重要"
              inactive-text="普通"
            />
          </el-form-item>
          
          <el-form-item label="允许补交">
            <el-switch
              v-model="newHomework.allowLate"
              :active-value="true"
              :inactive-value="false"
              inline-prompt
              active-text="是"
              inactive-text="否"
            />
          </el-form-item>
          
          <el-form-item label="通知学生">
            <el-checkbox v-model="newHomework.notifyStudents">发布后立即通知全体学生</el-checkbox>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleCreateHomework">发布作业</el-button>
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
  Calendar, 
  Document, 
  Upload,
  Plus, 
  Edit, 
  Delete, 
  MoreFilled,
  Collection,
  Folder
} from '@element-plus/icons-vue';

const props = defineProps({
  classData: {
    type: Object,
    required: true
  }
});

// 查询和过滤状态
const searchQuery = ref('');
const statusFilter = ref('');
const dateRange = ref([]);
const showCreateDialog = ref(false);

// 模拟作业数据
const homeworkList = ref([
  {
    id: 1,
    title: '第一章作业 - JavaScript基础',
    description: '完成教材第一章的所有练习题，包括变量声明、基本数据类型和函数定义等内容。按要求提交源代码和运行截图。',
    startDate: '2023-05-01',
    endDate: '2023-05-10',
    status: 'ended', // 'active', 'pending', 'ended'
    submitted: 25,
    total: 30,
    isImportant: true,
    attachments: [
      { id: 1, name: '第一章作业要求.docx' },
      { id: 2, name: '参考资料.pdf' }
    ]
  },
  {
    id: 2,
    title: '第二章作业 - DOM操作',
    description: '实现一个简单的待办事项应用，要求使用原生JavaScript进行DOM操作，不依赖任何框架。',
    startDate: '2023-05-15',
    endDate: '2023-05-25',
    status: 'active',
    submitted: 18,
    total: 30,
    isImportant: false,
    attachments: [
      { id: 3, name: '第二章作业说明.pdf' }
    ]
  },
  {
    id: 3,
    title: '期中项目 - 个人网站开发',
    description: '设计并实现一个个人网站，需包含首页、作品集和联系方式等页面。要求使用HTML5、CSS3和JavaScript实现，不使用框架。',
    startDate: '2023-06-01',
    endDate: '2023-06-20',
    status: 'pending',
    submitted: 0,
    total: 30,
    isImportant: true,
    attachments: []
  }
]);

// 新作业表单数据
const newHomework = ref({
  title: '',
  description: '',
  dateRange: [],
  isImportant: false,
  allowLate: true,
  notifyStudents: true
});

// 根据搜索和过滤条件筛选作业
const filteredHomework = computed(() => {
  let result = homeworkList.value;
  
  // 搜索关键词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(hw => 
      hw.title.toLowerCase().includes(query) || 
      hw.description.toLowerCase().includes(query)
    );
  }
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(hw => hw.status === statusFilter.value);
  }
  
  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const start = new Date(dateRange.value[0]).getTime();
    const end = new Date(dateRange.value[1]).getTime();
    
    result = result.filter(hw => {
      const hwStart = new Date(hw.startDate).getTime();
      return hwStart >= start && hwStart <= end;
    });
  }
  
  return result;
});

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '未知';
  
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 'active': return 'success';
    case 'pending': return 'info';
    case 'ended': return '';
    default: return '';
  }
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'active': return '进行中';
    case 'pending': return '未开始';
    case 'ended': return '已结束';
    default: return '未知';
  }
};

// 计算提交进度百分比
const calculateProgress = (homework) => {
  return homework.total > 0 ? (homework.submitted / homework.total) * 100 : 0;
};

// 获取进度条状态
const getProgressStatus = (homework) => {
  const percent = calculateProgress(homework);
  if (percent >= 90) return 'success';
  if (percent >= 60) return '';
  return 'exception';
};

// 处理作业相关操作
const handleEditHomework = (homework) => {
  ElMessage.success(`正在编辑作业：${homework.title}`);
  // 实现编辑功能
};

const handleViewSubmissions = (homework) => {
  ElMessage.success(`查看作业提交情况：${homework.title}`);
  // 跳转到提交详情页
};

const handleArchiveHomework = (homework) => {
  ElMessageBox.confirm(
    `确定要归档作业 "${homework.title}" 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  ).then(() => {
    ElMessage.success(`已归档作业：${homework.title}`);
    // 执行归档逻辑
  }).catch(() => {});
};

const handleDeleteHomework = (homework) => {
  ElMessageBox.confirm(
    `确定要删除作业 "${homework.title}" 吗？此操作不可恢复。`,
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success(`已删除作业：${homework.title}`);
    // 执行删除逻辑
  }).catch(() => {});
};

// 发布新作业
const handleCreateHomework = () => {
  // 表单验证
  if (!newHomework.value.title) {
    ElMessage.warning('请填写作业标题');
    return;
  }
  
  if (!newHomework.value.dateRange || newHomework.value.dateRange.length !== 2) {
    ElMessage.warning('请设置作业起止时间');
    return;
  }
  
  // 模拟创建作业
  const newId = homeworkList.value.length + 1;
  homeworkList.value.push({
    id: newId,
    title: newHomework.value.title,
    description: newHomework.value.description,
    startDate: newHomework.value.dateRange[0],
    endDate: newHomework.value.dateRange[1],
    status: 'pending',
    submitted: 0,
    total: props.classData?.baseInfo?.studentCount || 30,
    isImportant: newHomework.value.isImportant,
    attachments: []
  });
  
  ElMessage.success('作业发布成功');
  showCreateDialog.value = false;
  
  // 重置表单
  newHomework.value = {
    title: '',
    description: '',
    dateRange: [],
    isImportant: false,
    allowLate: true,
    notifyStudents: true
  };
};
</script>

<style scoped>
.homework-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.homework-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.search-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  width: 240px;
}

.status-filter {
  width: 120px;
}

.date-range {
  width: 320px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.homework-body {
  min-height: 300px;
}

.homework-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.homework-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 16px;
  transition: all 0.2s ease;
}

.homework-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.homework-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.homework-title {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.homework-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.homework-tags {
  display: flex;
  gap: 8px;
}

.homework-content {
  margin-bottom: 16px;
}

.homework-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 12px;
}

.homework-attachments {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  background-color: #f9f9fa;
  padding: 8px 12px;
  border-radius: 4px;
}

.attachment-label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
  margin-right: 8px;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attachment-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.homework-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.homework-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 14px;
}

.homework-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.submission-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 14px;
}

.progress-bar {
  margin-top: 4px;
}

.create-homework-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 16px;
}

.date-time-range {
  width: 100%;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.text-danger {
  color: #F56C6C;
}

@media (max-width: 768px) {
  .homework-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-filter,
  .action-buttons {
    width: 100%;
  }
  
  .search-input,
  .status-filter,
  .date-range {
    width: 100%;
    margin-bottom: 8px;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
  
  .homework-card-header {
    flex-direction: column;
  }
  
  .homework-actions {
    margin-top: 8px;
    align-self: flex-end;
  }
}
</style>
