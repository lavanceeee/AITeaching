<template>
  <el-dialog v-model="dialogVisible" title="对话历史" width="75%" @open="onDialogOpen" top="10vh" custom-class="history-dialog">
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
              <!-- Header -->
              <div class="item-header">
                <p class="item-title" :title="item.title">{{ item.title }}</p>
                <div class="item-tags" v-if="item.tags">
                  <el-tag v-for="tag in item.tags.split(',')" :key="tag" size="small" round effect="plain">{{ tag }}</el-tag>
                </div>
              </div>
              <!-- Body -->
              <div class="item-body">
                <span><el-icon><CollectionTag /></el-icon> {{ item.courseName || '通用' }}</span>
                <el-tooltip content="已启用知识库增强" placement="top" v-if="item.enableRag">
                  <span class="rag-indicator"><el-icon><Cpu /></el-icon> RAG</span>
                </el-tooltip>
              </div>
            </div>
            <el-button type="primary" link @click="selectConversation(item.id)">继续对话</el-button>
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
import { CollectionTag, Cpu } from '@element-plus/icons-vue';
import { getHistory_method } from '../../api/axios';
import { useAIChatStore } from '../../store/AIChatStore';
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

const selectConversation = async (id) => {
  console.log("即将加载会话:", id);

    //更新store中的信息为当前会话
  const conversation = historyList.value.find(item => item.id === id);

  emit('select-conversation', conversation); 
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
  height: 70vh; /* Increased height */
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
  padding: 1.1rem 1.5rem; /* Adjusted padding */
  margin-bottom: 1rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.history-item:hover {
  /* transform: translateY(-2px); // Removed animation */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-color: #d1e3ff;
}

.item-main {
  display: flex;
  flex-direction: column;
  gap: 0.6rem; /* Adjusted gap */
  overflow: hidden;
  width: calc(100% - 100px);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.item-title {
  font-weight: 600;
  font-size: 1.1rem; /* Increased font size */
  color: #1f2937; /* Darker title */
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

.item-body {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem; /* Adjusted gap */
  font-size: 0.9rem;
  color: #4b5563;
  align-items: center;
}

.item-body span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.rag-indicator {
  color: #3b82f6; /* Blue for RAG */
  font-weight: 500;
  border: 1px solid #bfdbfe;
  padding: 2px 6px;
  border-radius: 999px;
  background-color: #eff6ff;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 1rem 0 0.5rem 0;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
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

