<template>
  <div class="class-management-container">
    <!-- 1. 顶部通用功能按钮 -->
    <div class="top-actions">
      <h2 class="page-title">我管理的班级</h2>
      <div class="action-buttons">
        <el-button :icon="Filter" plain>筛选班级</el-button>
        <el-button :icon="CopyDocument" plain>批量选择</el-button>
        <el-button :icon="Delete" type="danger" plain>删除选中</el-button>
      </div>
    </div>

    <!-- 2. 班级列表 -->
    <div class="class-list">
      <div v-for="clazz in classes" :key="clazz.id" class="class-row">
        <div class="class-info">
          <div class="class-title">
            <el-icon class="class-icon"><UserFilled /></el-icon>
            <span class="class-name">{{ clazz.name }}</span>
          </div>
          <div class="class-meta">
            <el-tag size="small" effect="light" round>{{ clazz.grade }}级</el-tag>
            <span class="class-major">{{ clazz.major }}</span>
            <span class="class-school">{{ clazz.school }}</span>
          </div>
        </div>
        <div class="class-actions">
          <el-button circle :icon="MoreFilled" class="more-options-btn"></el-button>
        </div>
      </div>
    </div>

    <!-- 3. 右下角悬浮新建按钮 -->
    <div class="fab-container" @click="handleCreateClass">
      <div class="fab-plus-icon">
        <el-icon><Plus /></el-icon>
      </div>
    </div>

    <!-- 新建班级弹窗 -->
    <el-dialog v-model="isCreateClassDialogVisible" title="新建班级" width="500px" :close-on-click-modal="false">
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
        <el-button @click="handleCancelCreate">取消</el-button>
        <el-button type="primary" @click="handleSubmitCreate" :loading="isSubmitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import {
  Filter,
  CopyDocument,
  Delete,
  MoreFilled,
  UserFilled,
  Plus
} from '@element-plus/icons-vue';
import { createClass_method } from '../../../api/axios';
import { ElMessage } from 'element-plus';

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
    // fetchClasses();
    
  } catch (error) {
    console.error('创建班级失败:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.class-management-container {
  padding: 24px 32px;
  background-color: #f7f8fa;
  height: 100%;
  overflow-y: auto;
  position: relative;
}

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

.class-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.class-row {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 28px;
  transition: box-shadow 0.3s;
}
.class-row:hover {
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}

.class-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.class-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}
.class-icon {
  color: #4096ff;
  font-size: 20px;
}
.class-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 13px;
  color: #7f8c8d;
}
.class-major, .class-school {
  background: #f0f2f5;
  border-radius: 4px;
  padding: 2px 8px;
  margin-left: 0;
}

.class-actions {
  display: flex;
  align-items: center;
}
.more-options-btn {
  --el-button-size: 30px;
  background: rgba(255,255,255,0.8);
  border: none;
}
.more-options-btn:hover {
  background: #fff;
}

.fab-container {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 52px;
  height: 52px;
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
  font-size: 26px;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.fab-container:hover .fab-plus-icon {
  transform: rotate(180deg);
}
</style>