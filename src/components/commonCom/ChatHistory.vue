<template>
  <el-dialog v-model="dialogVisible" title="对话历史" width="60%" @open="onDialogOpen" top="15vh" custom-class="history-dialog">
    <div v-if="isLoading" class="skeleton-container">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else class="history-container">
      <div v-if="historyList.length === 0" class="empty-state">
        <p>暂无历史会话</p>
      </div>
      <template v-else>
        <div class="history-list">
          <div v-for="item in historyList" :key="item.id" class="history-item">
            <div class="item-main">
              <div class="item-header">
                <p class="item-title" :title="item.title">{{ item.title }}</p>
                <div class="item-tags" v-if="item.tags">
                  <el-tag v-for="tag in item.tags.split(',')" :key="tag" size="small" type="info" effect="plain">{{ tag }}</el-tag>
                </div>
              </div>
              <div class="item-meta">
                <span><el-icon><CollectionTag /></el-icon> {{ item.courseName || '通用' }}</span>
                <span><el-icon><ChatDotRound /></el-icon> {{ item.modelName }}</span>
                <span><el-icon><Memo /></el-icon> {{ item.messageCount }} 条</span>
                <el-tooltip content="已启用知识库增强" placement="top" v-if="item.enableRag">
                  <span class="rag-indicator"><el-icon><Cpu /></el-icon> RAG</span>
                </el-tooltip>
              </div>
              <div class="item-meta item-meta-secondary">
                <span><el-icon><User /></el-icon> {{ item.createByName }}</span>
                <span><el-icon><Clock /></el-icon> {{ formatDateTime(item.createTime) }}</span>
                <span><el-icon><Refresh /></el-icon> {{ formatDateTime(item.updateTime) }}</span>
              </div>
            </div>
            <el-button type="primary" link @click="selectConversation(item.memoryId)">继续对话</el-button>
          </div>
        </div>
        <div class="pagination-container">
          <el-pagination
            background
            layout="prev, pager, next, jumper, ->, total"
            :total="pagination.total"
            :page-size="pagination.pageSize"
            :current-page="pagination.currentPage"
            @current-change="handlePageChange"
          />
        </div>
      </template>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch, reactive } from 'vue';
import { ElDialog, ElSkeleton, ElButton, ElPagination, ElTag, ElIcon, ElTooltip } from 'element-plus';
import { CollectionTag, ChatDotRound, Clock, Memo, User, Refresh, Cpu } from '@element-plus/icons-vue';
import { getHistory_method } from '../../api/axios';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'select-conversation']);

const dialogVisible = ref(props.modelValue);
const isLoading = ref(false);
const historyList = ref([]);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

watch(() => props.modelValue, (newValue) => {
  dialogVisible.value = newValue;
});

watch(dialogVisible, (newValue) => {
  if (newValue !== props.modelValue) {
    emit('update:modelValue', newValue);
  }
});

const onDialogOpen = () => {
  // Reset to first page when dialog opens
  pagination.currentPage = 1;
  fetchHistory();
}

const fetchHistory = async () => {
  isLoading.value = true;
  historyList.value = [];
  try {
    const data = await getHistory_method(pagination.currentPage, pagination.pageSize);
    historyList.value = data.records;
    pagination.total = data.total;
    pagination.currentPage = data.current;
    pagination.pageSize = data.size;
  } catch (error) {
    console.error("无法加载对话历史:", error);
    // Error will be shown via ElMessage from the api module
  } finally {
    isLoading.value = false;
  }
};

const handlePageChange = (newPage) => {
  pagination.currentPage = newPage;
  fetchHistory();
};

const selectConversation = (memoryId) => {
  emit('select-conversation', memoryId);
  dialogVisible.value = false;
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  const date = new Date(dateTimeString);
  return date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}
</script>

<style>
/* Use a global style tag to customize the dialog component itself */
.history-dialog {
  border-radius: 16px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
}
</style>

<style scoped>
.skeleton-container {
  padding: 1rem 1.5rem;
}

.history-container {
  display: flex;
  flex-direction: column;
  height: 60vh; /* Fixed height for the container */
}

.history-list {
  flex-grow: 1; /* Allow list to fill available space */
  overflow-y: auto;
  padding: 0.5rem 1.5rem 1rem 1.5rem;
  margin: 0;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
  color: #999;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.history-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #d1e3ff;
}

.item-main {
  display: flex;
  flex-direction: column;
  gap: 0.7rem; /* Adjusted gap */
  overflow: hidden;
  width: calc(100% - 100px); /* Adjust width to leave space for the button */
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.item-title {
  font-weight: 600;
  font-size: 1.05rem;
  color: #2c3e50;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
}

.item-tags {
  flex-shrink: 0;
  display: flex;
  gap: 0.5rem;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.85rem;
  color: #8a919f;
  align-items: center;
}

.item-meta-secondary {
  color: #b0b6c3;
  font-size: 0.8rem;
}

.item-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.rag-indicator {
  color: #409eff;
  font-weight: 500;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 1rem 0 0.5rem 0;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0; /* Prevent pagination from shrinking */
}

/* Custom scrollbar for the list */
.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background: transparent;
}

.history-list::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: #c7c7c7;
}
</style>
