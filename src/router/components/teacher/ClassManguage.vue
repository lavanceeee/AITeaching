<template>
  <div class="class-management-container">
    <!-- 顶部操作区 -->
    <div class="top-actions">
      <div class="title-area">
        <h2 class="page-title">我管理的班级</h2>
        <span class="subtitle">共管理 {{ total }} 个班级</span>
      </div>
      <div class="action-buttons">
        <el-button :icon="Filter" plain size="small">筛选</el-button>
        <el-button :icon="CopyDocument" plain size="small">批量选择</el-button>
        <el-button :icon="Delete" type="danger" plain size="small">删除选中</el-button>
      </div>
    </div>
    <!-- 主内容区 -->
    <div class="main-content">
      <div class="class-list-container">
        <div v-if="loading" class="loading-box">
          <el-icon><Loading /></el-icon> 加载中...
        </div>
        <div v-else-if="Object.keys(groupedClasses).length === 0" class="empty-state">
          <el-empty description="暂无班级数据" />
          <el-button type="primary" @click="handleCreateClass" class="create-first-btn">创建第一个班级</el-button>
        </div>
        <div v-else>
          <!-- 按专业分组展示 -->
          <div v-for="(classes, major) in groupedClasses" :key="major" class="major-group">
            <div class="major-header">
              <h3 class="major-title">{{ major }}</h3>
              <div class="major-count">{{ classes.length }}个班级</div>
            </div>
            <div class="classes-container">
              <div v-for="clazz in classes" :key="clazz.id" class="class-card">
                <div class="class-card-header">
                  <div class="class-title">
                    <el-icon class="class-icon"><UserFilled /></el-icon>
                    <span class="class-name">{{ clazz.name }}</span>
                  </div>
                  <el-button circle :icon="MoreFilled" class="more-options-btn"></el-button>
                </div>
                <div class="class-card-content">
                  <div class="class-meta">
                    <div class="meta-item">
                      <span class="meta-label">年级</span>
                      <el-tag size="small" effect="light" round>{{ clazz.grade }}</el-tag>
                    </div>
                    <div class="meta-item">
                      <span class="meta-label">学校</span>
                      <span class="meta-value">{{ clazz.school }}</span>
                    </div>
                    <div class="meta-item class-id-item">
                      <span class="meta-label">班级号</span>
                      <div class="class-id-wrapper">
                        <el-tooltip
                          content="用于学生加入班级"
                          placement="top"
                          :show-after="300"
                        >
                          <span class="class-id">{{ clazz.id }}</span>
                        </el-tooltip>
                        <el-button
                          class="copy-btn"
                          :icon="CopyDocument"
                          size="small"
                          circle
                          @click="copyClassId(clazz.id)"
                        ></el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="pagination-container" v-if="total > 0">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="(size)=>{pageSize=size;fetchClasses(1);}"
        />
      </div>
    </div>
    <!-- 悬浮新建按钮 -->
    <div class="fab-container" @click="handleCreateClass">
      <div class="fab-plus-icon">
        <el-icon><Plus /></el-icon>
      </div>
    </div>
    <!-- 新建班级弹窗 ... -->
    <el-dialog v-model="isCreateClassDialogVisible" title="新建班级" width="460px" :close-on-click-modal="false">
      <el-form :model="classForm" :rules="classRules" ref="classFormRef" label-width="80px">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="classForm.name" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="classForm.major" placeholder="请输入专业名称" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-input v-model="classForm.grade" placeholder="请输入年级，如：2023" />
        </el-form-item>
        <el-form-item label="学校" prop="school">
          <el-input v-model="classForm.school" placeholder="请输入学校名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCancelCreate" size="small">取消</el-button>
        <el-button type="primary" @click="handleSubmitCreate" :loading="isSubmitting" size="small">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import {
  Filter,
  CopyDocument,
  Delete,
  MoreFilled,
  UserFilled,
  Plus,
  Loading
} from '@element-plus/icons-vue';
import { createClass_method, queryClasses_method } from '../../../api/axios';
import { ElMessage } from 'element-plus';
import { onMounted } from 'vue';
 
const classList = ref([]);
const total = ref(0);
const pageSize = ref(10);
const currentPage = ref(1);
const loading = ref(false);

// 按专业分组
const groupedClasses = computed(() => {
  const groups = {};
  classList.value.forEach(clazz => {
    if (!groups[clazz.major]) {
      groups[clazz.major] = [];
    }
    groups[clazz.major].push(clazz);
  });
  return groups;
});

const fetchClasses = async (page = 1) => {
  loading.value = true;
  try {
    const params = {
      pageNum: page,
      pageSize: pageSize.value
    };
    const data = await queryClasses_method(params);
    classList.value = data.records;
    total.value = data.total;
    currentPage.value = data.current;
  } catch (e) {
    classList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchClasses();
});

const handlePageChange = (page) => {
  fetchClasses(page);
};

// 复制班级ID
const copyClassId = (id) => {
  navigator.clipboard.writeText(id).then(() => {
    ElMessage({
      message: '班级号已复制到剪贴板',
      type: 'success',
      duration: 2000
    });
  }).catch(() => {
    ElMessage({
      message: '复制失败，请手动复制',
      type: 'error',
      duration: 2000
    });
  });
};

// 假数据
const classes = ref([
  {
    id: 1,
    name: '软件工程1班',
    grade: '2023',
    major: '软件工程',
    school: '华中科技大学'
  },
  {
    id: 2,
    name: '人工智能2班',
    grade: '2022',
    major: '人工智能',
    school: '清华大学'
  },
  {
    id: 3,
    name: '计算机科学3班',
    grade: '2021',
    major: '计算机科学与技术',
    school: '北京大学'
  },
  {
    id: 4,
    name: '大数据4班',
    grade: '2023',
    major: '大数据技术',
    school: '浙江大学'
  }
]);

const isCreateClassDialogVisible = ref(false);
const isSubmitting = ref(false);
const classFormRef = ref();

// 表单数据
const classForm = reactive({
  name: '',
  major: '',
  grade: '',
  school: ''
});

// 表单验证规则
const classRules = {
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    { min: 2, max: 20, message: '班级名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  major: [
    { required: true, message: '请输入专业名称', trigger: 'blur' },
    { min: 2, max: 20, message: '专业名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  grade: [
    { required: true, message: '请输入年级', trigger: 'blur' },
    { pattern: /^\d{4}$/, message: '年级格式为4位数字，如：2023', trigger: 'blur' }
  ],
  school: [
    { required: true, message: '请输入学校名称', trigger: 'blur' },
    { min: 2, max: 30, message: '学校名称长度在 2 到 30 个字符', trigger: 'blur' }
  ]
};

const handleCreateClass = () => {
  isCreateClassDialogVisible.value = true;
  // 重置表单
  Object.assign(classForm, {
    name: '',
    major: '',
    grade: '',
    school: ''
  });
};

const handleCancelCreate = () => {
  isCreateClassDialogVisible.value = false;
  classFormRef.value?.resetFields();
};

const handleSubmitCreate = async () => {
  if (!classFormRef.value) return;
  
  try {
    await classFormRef.value.validate();
    isSubmitting.value = true;
    
    // 调用创建班级接口
    await createClass_method(classForm);
    
    // 创建成功后关闭弹窗并刷新列表
    isCreateClassDialogVisible.value = false;
    
    //刷新数据
    fetchClasses();
    
  } catch (error) {
    console.error('创建班级失败:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.class-management-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
  padding: 0;
  overflow: hidden;
}
.top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px 12px 32px;
  background: #f7f8fa;
}
.title-area {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}
.subtitle {
  color: #909399;
  font-size: 14px;
}
.action-buttons {
  display: flex;
  gap: 8px;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 0 32px 0 32px;
  overflow: hidden;
}
.class-list-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 12px 0;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}
.create-first-btn {
  margin-top: 20px;
}
.major-group {
  margin-bottom: 24px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  border: 1px solid #ebeef5;
}
.major-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f2f5;
  background-color: #fafafa;
}
.major-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.major-title:before {
  content: '';
  display: block;
  width: 4px;
  height: 16px;
  background: #4096ff;
  border-radius: 2px;
}
.major-count {
  font-size: 13px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 12px;
}
.classes-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  padding: 16px;
}
.class-card {
  background: #fff;
  border-radius: 6px;
  border: 1px solid #ebeef5;
  transition: all 0.25s;
}
.class-card:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}
.class-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f2f5;
}
.class-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.class-icon {
  color: #4096ff;
  font-size: 16px;
  background: rgba(64, 150, 255, 0.1);
  padding: 4px;
  border-radius: 4px;
}
.class-name {
  font-size: 15px;
  font-weight: 500;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.class-card-content {
  padding: 12px 16px;
}
.class-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.meta-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.class-id-item {
  margin-top: 4px;
}
.class-id-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}
.class-id {
  font-family: monospace;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  border: 1px dashed #dcdfe6;
}
.copy-btn {
  --el-button-size: 24px;
  font-size: 12px;
  color: #909399;
  padding: 0;
}
.copy-btn:hover {
  color: #409EFF;
  background: rgba(64, 158, 255, 0.1);
}
.meta-label {
  font-size: 13px;
  color: #909399;
}
.meta-value {
  font-size: 13px;
  color: #606266;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}
.more-options-btn {
  --el-button-size: 24px;
  background: transparent;
  border: none;
  padding: 0;
  color: #909399;
}
.more-options-btn:hover {
  background: #f5f7fa;
  color: #606266;
}
.loading-box {
  text-align: center;
  padding: 40px 0;
  width: 100%;
}
.pagination-container {
  width: 100%;
  padding: 20px 0;
  margin-top: 10px;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}
:deep(.el-pagination) {
  display: flex;
  align-items: center;
  justify-content: center;
}
.fab-container {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 48px;
  height: 48px;
  background: #4096ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(64, 150, 255, 0.3);
  z-index: 100;
  transition: all 0.25s ease;
}
.fab-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 150, 255, 0.4);
  background: #2a85f0;
}
.fab-container:active {
  transform: translateY(0) scale(0.98);
}
.fab-plus-icon {
  color: white;
  font-size: 22px;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.fab-container:hover .fab-plus-icon {
  transform: rotate(135deg);
}
@media (max-width: 600px) {
  .main-content {
    padding: 0 12px;
  }
  .top-actions {
    padding: 16px 16px 12px 16px;
  }
  .pagination-container {
    padding: 16px 0;
  }
  .fab-container {
    right: 16px;
    bottom: 16px;
    width: 42px;
    height: 42px;
  }
  .classes-container {
    grid-template-columns: 1fr;
    padding: 12px;
  }
  .major-group {
    margin-bottom: 16px;
  }
}
</style>