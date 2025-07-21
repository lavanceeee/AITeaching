<template>
  <div class="course-detail-container">
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading" size="28"><Loading /></el-icon>
      <p>正在加载课程数据...</p>
    </div>
    <el-empty
      v-else-if="!course"
      description="未能加载课程信息，请稍后重试。"
    />
    <div v-else class="course-content">
      <!-- 顶部 Header -->
      <div class="course-header">
        <div class="header-image-wrapper">
          <img :src="course.cover" :alt="course.name" class="header-image" />
          <div class="header-overlay"></div>
        </div>
        <div class="header-info">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/teacher/project' }"
              >课程管理</el-breadcrumb-item
            >
            <el-breadcrumb-item>课程详情</el-breadcrumb-item>
          </el-breadcrumb>
          <h1 class="course-title">{{ course.name }}</h1>
          <div class="header-meta">
            <el-tag
              :type="getStatusType(course.status)"
              effect="light"
              size="small"
              >{{ course.statusDesc }}</el-tag
            >
            <span class="meta-item"
              ><el-icon><User /></el-icon> {{ course.teacherName }}</span
            >
            <span class="meta-item"
              ><el-icon><School /></el-icon> {{ course.school }} -
              {{ course.major }}</span
            >
          </div>
        </div>
      </div>

      <!-- 主体内容区 -->
      <div class="main-layout">
        <div class="left-panel">
          <el-tabs v-model="activeTab" class="details-tabs">
            <el-tab-pane label="课程大纲" name="outline">
              <div class="panel-card">
                <div class="panel-header">
                  <h3>课程大纲</h3>
                  <!-- 添加上传按钮 -->
                  <el-button
                    type="primary"
                    :icon="Upload"
                    @click="showUploadOutlineDialog"
                  >
                    上传材料并使用AI生成
                  </el-button>
                </div>
                <div class="panel-body">
                  <p class="course-description">{{ course.description }}</p>
                  
                  <!-- 大纲生成中的加载动画 -->
                  <div v-if="generatingOutline" class="outline-generating">
                    <el-progress 
                      :percentage="generationProgress" 
                      :status="generationProgress >= 100 ? 'success' : ''"
                      :stroke-width="10"
                    />
                    <div class="generation-status">
                      <el-icon class="is-loading" size="24"><Loading /></el-icon>
                      <span>{{ generationMessage || '正在生成课程大纲...' }}</span>
                    </div>
                  </div>
                  
                  <!-- 大纲内容展示 -->
                  <el-timeline v-else-if="courseOutline && courseOutline.length > 0" style="margin-top: 20px;">
                    <el-timeline-item 
                      v-for="(chapter, index) in courseOutline" 
                      :key="index"
                      :timestamp="chapter.title" 
                      placement="top"
                    >
                      {{ chapter.content }}
                    </el-timeline-item>
                  </el-timeline>
                  
                  <!-- 无大纲时的提示 -->
                  <el-empty 
                    v-else 
                    description="暂无课程大纲，请点击上方按钮上传课程材料生成大纲" 
                    :image-size="100"
                  />
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="班级列表" name="students">
              <div class="panel-card">
                <div class="panel-header">
                  <h3>班级与学生</h3>
                  <el-button
                    type="primary"
                    :icon="Plus"
                    @click="isSelectClassDialogVisible = true"
                  >
                    添加班级
                  </el-button>
                </div>
                <div class="panel-body">
                  <div v-if="associatedClassesLoading" class="loading-state">
                    <el-icon class="is-loading" size="24"><Loading /></el-icon>
                    <span>正在加载班级...</span>
                  </div>
                  <div
                    v-else-if="associatedClasses.length > 0"
                    class="associated-class-grid"
                  >
                    <div
                      v-for="cls in associatedClasses"
                      :key="cls.id"
                      class="associated-class-card"
                    >
                      <div class="card-icon">
                        <el-icon :size="20"><Reading /></el-icon>
                      </div>
                      <div class="card-info">
                        <div class="class-name">{{ cls.name }}</div>
                        <div class="class-meta">
                          {{ cls.major }} · {{ cls.grade }}
                        </div>
                      </div>
                      <div class="class-actions">
                        <el-button type="primary" link size="small"
                          >查看</el-button
                        >
                      </div>
                    </div>
                  </div>
                  <el-empty
                    v-else
                    description="暂未关联任何班级，请点击右上角按钮添加。"
                  />
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="课程作业" name="homework">
              <div class="panel-card">
                <el-empty description="作业功能开发中" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="设置" name="settings">
              <div class="panel-card">
                <el-empty description="设置功能开发中" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="right-panel">
          <div class="panel-card sticky-card">
            <div class="panel-header">
              <h3>核心信息</h3>
              <el-button
                type="primary"
                link
                :icon="Edit"
                @click="isEditCourseDialogVisible = true"
                >编辑</el-button
              >
            </div>
            <div class="panel-body">
              <div class="info-list">
                <div class="info-item-row">
                  <span>课程代码</span><strong>{{ course.courseCode }}</strong>
                </div>
                <div class="info-item-row">
                  <span>所属年级</span><strong>{{ course.grade }}</strong>
                </div>
                <div class="info-item-row">
                  <span>课程学分</span
                  ><strong>{{ course.credits }} 学分</strong>
                </div>
                <div class="info-item-row">
                  <span>总学时</span><strong>{{ course.hours }} 小时</strong>
                </div>
                <div class="info-item-row">
                  <span>课程容量</span
                  ><strong
                    >{{ course.enrolledCount }} / {{ course.capacity }}</strong
                  >
                </div>
                <div class="info-item-row">
                  <span>开课时间</span>
                  <strong>{{ course.startTime }}</strong>
                </div>
                <div class="info-item-row">
                  <span>结课时间</span>
                  <strong>{{ course.endTime }}</strong>
                </div>
              </div>
              <div class="course-tags">
                <el-tag
                  v-for="tag in course.tags.split(',')"
                  :key="tag"
                  class="tag-item"
                  disable-transitions
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <select-class
      v-model="isSelectClassDialogVisible"
      :associated-class-ids="associatedClassIds"
      @confirm="handleConfirmAddClasses"
    />
    <edit-course
      v-if="course"
      v-model="isEditCourseDialogVisible"
      :course-data="course"
      @update-success="handleUpdateSuccess"
    />

    <!-- 上传课程大纲对话框 -->
    <el-dialog
      v-model="isUploadOutlineDialogVisible"
      title="上传课程文件"
      width="500px"
      @closed="resetUploadForm"
    >
      <el-form
        :model="uploadForm"
        ref="uploadFormRef"
        :rules="uploadRules"
        label-width="100px"
      >
        <el-form-item label="课程大纲" prop="file">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            :on-exceed="handleExceed"
            :on-change="handleFileChange"
            :before-upload="beforeUpload"
            :file-list="uploadForm.fileList"
            accept=".doc,.docx,.pdf,.txt,.md"
            class="outline-uploader"
          >
            <el-button type="primary" :icon="Document">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                仅支持 Word、PDF、TXT 或 Markdown 文件，大小不超过 120MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="isUploadOutlineDialogVisible = false"
            >取 消</el-button
          >
          <el-button type="primary" @click="submitUpload" :loading="uploading"
            >上 传</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent, computed, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import {
  getCourseDetails_method,
  queryClassesByCourseId_method,
  addClass2Course_method,
} from "../../api/axios";
import { ElMessage, ElLoading } from "element-plus";
import {
  Loading,
  User,
  School,
  Edit,
  Plus,
  Reading,
  Upload,
  Document,
} from "@element-plus/icons-vue";
import { uploadFile2AI } from "../../api/axios";

const SelectClass = defineAsyncComponent(() => import("./selectClass.vue"));
const EditCourse = defineAsyncComponent(() => import("./EditCourse.vue"));

const route = useRoute();
const course = ref(null);
const loading = ref(true);
const activeTab = ref("outline");
const isSelectClassDialogVisible = ref(false);
const isEditCourseDialogVisible = ref(false);
const isUploadOutlineDialogVisible = ref(false);
const uploading = ref(false);
const uploadRef = ref(null);
const uploadFormRef = ref(null);
const associatedClasses = ref([]);
const associatedClassesLoading = ref(false);

// 大纲生成相关状态
const generatingOutline = ref(false);
const generationProgress = ref(0);
const generationMessage = ref('');
const courseOutline = ref([]);
let wsConnection = null;
let loadingInstance = null;

const startLoading = () => {
  generatingOutline.value = true;
  generationProgress.value = 0;
  generationMessage.value = '正在初始化...';
}

const endLoading = () => {
  generationProgress.value = 100;
  setTimeout(() => {
    generatingOutline.value = false;
  }, 1000);
}

const handleProgress = (progress, message) => {
  generationProgress.value = progress;
  generationMessage.value = message;
}

const handleResult = async (message) => {
  
  ElMessage.success(message);
  
  // try {
    
  //   //结束后获取详细信息
  //   const outlineData = await getCourseOutline_method(route.params.id);
  //   courseOutline.value = outlineData;
  // } catch (error) {
  //   console.error("获取课程大纲失败:", error);
  //   ElMessage.error("获取课程大纲失败");
  // } finally {
  //   generationProgress.value = 100;
  // }
}

const handleError = (error) => {
  ElMessage.error(error);
  generatingOutline.value = false;
}

// 文件上传表单
const uploadForm = ref({
  file: null,
  fileList: [],
});

// 上传表单验证规则
const uploadRules = {
  file: [{ required: true, message: "请选择要上传的文件", trigger: "change" }],
};

const fetchCourseDetails = async () => {
  const courseId = route.params.id;
  if (!courseId) {
    ElMessage.error("无效的课程ID");
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    const response = await getCourseDetails_method(courseId);
    if (response.code === 200 && response.data) {
      course.value = response.data;
      // 获取到课程详情后，获取关联的班级
      fetchAssociatedClasses(courseId);
    } else {
      ElMessage.error(response.message || "获取课程详情失败");
    }
  } catch (error) {
    console.error("获取课程详情失败:", error);
    // Let the UI show the empty state
  } finally {
    loading.value = false;
  }
};

const fetchAssociatedClasses = async (courseId) => {
  associatedClassesLoading.value = true;
  try {
    const data = await queryClassesByCourseId_method(courseId);
    associatedClasses.value = data || [];
  } catch (error) {
    console.error("获取关联班级列表失败：", error);
    associatedClasses.value = [];
  } finally {
    associatedClassesLoading.value = false;
  }
};

// 显示上传对话框
const showUploadOutlineDialog = () => {
  isUploadOutlineDialogVisible.value = true;
};

// 文件数量超过限制时的处理
const handleExceed = () => {
  ElMessage.warning("只能上传一个文件，请先删除当前文件再上传新文件");
};

// 文件改变时的处理
const handleFileChange = (file) => {
  uploadForm.value.file = file.raw;
};

// 文件上传前的验证
const beforeUpload = (file) => {
  // 检查文件类型
  const allowedTypes = [
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/pdf", // .pdf
    "text/plain", // .txt
    "text/markdown", // .md
  ];
  const isValidType =
    allowedTypes.includes(file.type) ||
    file.name.endsWith(".doc") ||
    file.name.endsWith(".docx") ||
    file.name.endsWith(".pdf") ||
    file.name.endsWith(".txt") ||
    file.name.endsWith(".md");
  if (!isValidType) {
    ElMessage.error("只能上传Word、PDF、TXT或Markdown文件");
    return false;
  }

  const isLt120M = file.size / 1024 / 1024 < 120;
  if (!isLt120M) {
    ElMessage.error("文件大小不能超过120MB");
    return false;
  }

  return isValidType && isLt120M;
};

// 重置上传表单
const resetUploadForm = () => {
  uploadForm.value = {
    file: null,
    fileList: [],
  };

  if (uploadFormRef.value) {
    uploadFormRef.value.resetFields();
  }

  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
};

// 文件上传提交上传
const submitUpload = async () => {
  if (!uploadFormRef.value) return;

  await uploadFormRef.value.validate(async (valid) => {
    if (valid) {
      if (!uploadForm.value.file) {
        ElMessage.warning("请选择要上传的文件");
        return;
      }

      uploading.value = true;

      const formData = new FormData();

      formData.append("file", uploadForm.value.file);
      formData.append("courseId", route.params.id);

      try {
        // 上传文件并处理WebSocket连接
        wsConnection = await uploadFile2AI(formData, {
          onLoadingStart: startLoading,
          onLoadingEnd: endLoading,
          onProgress: handleProgress,
          onResult: handleResult,
          onError: handleError
        });
        
        isUploadOutlineDialogVisible.value = false;
      } catch (error) {
        console.error("文件上传失败:", error);
      } finally {
        uploading.value = false;
      }
    } else {
      ElMessage.error("请完成必填项");
    }
  });
};

// 组件卸载时关闭WebSocket连接
onUnmounted(() => {
  if (wsConnection && wsConnection.readyState !== WebSocket.CLOSED) {
    wsConnection.close();
  }
});

onMounted(() => {
  fetchCourseDetails();
});

const getStatusType = (status) => {
  switch (status) {
    case 0:
      return "info";
    case 1:
      return "success";
    case 2:
      return "primary";
    case 3:
      return "warning";
    case 4:
      return "danger";
    default:
      return "info";
  }
};

const handleUpdateSuccess = () => {
  fetchCourseDetails();
};

const handleConfirmAddClasses = async (selectedClassIds) => {
  if (!selectedClassIds || selectedClassIds.length === 0) {
    ElMessage.info("您没有选择任何新的班级。");
    return;
  }

  const courseId = route.params.id;
  try {
    await addClass2Course_method({
      courseId: courseId,
      classId: selectedClassIds,
    });
    // 添加成功后刷新班级列表
    fetchAssociatedClasses(courseId);
  } catch (error) {
    console.error("添加班级到课程失败:", error);
    // 错误消息已在axios中处理
  }
};
</script>

<style scoped>
.course-detail-container {
  background-color: #f7f8fa;
  min-height: 100vh;
}

.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80vh;
  color: #909399;
}

.course-header {
  position: relative;
  height: 280px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 32px;
}

.header-image-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.header-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.7) 20%,
    rgba(0, 0, 0, 0) 80%
  );
}

.header-info {
  position: relative;
  z-index: 1;
}

.course-title {
  font-size: 32px;
  font-weight: 600;
  margin: 8px 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 14px;
  opacity: 0.9;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.main-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  padding: 24px 32px;
}

.panel-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f2f5;
}

.panel-header h3 {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.panel-body {
  padding: 20px;
}

.course-description {
  color: #606266;
  line-height: 1.7;
}

.sticky-card {
  position: sticky;
  top: 24px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.info-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #606266;
}
.info-item-row strong {
  color: #303133;
  font-weight: 500;
}

.course-tags {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f2f5;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.el-breadcrumb__inner),
:deep(.el-breadcrumb__separator) {
  color: #e5eaf3;
  font-weight: 400;
}
:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #fff;
  font-weight: 600;
}
:deep(.el-tabs__nav-wrap::after) {
  background-color: transparent;
}
:deep(.el-tabs__header) {
  margin-bottom: 0;
}
.details-tabs {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}
:deep(.el-tabs__nav) {
  padding: 0 20px;
}

.associated-class-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.associated-class-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: #f7f8fa;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.card-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e3efff;
  color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-info {
  flex-grow: 1;
  min-width: 0;
}

.card-info .class-name {
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-info .class-meta {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.class-actions {
  flex-shrink: 0;
}

.outline-uploader {
  display: block;
  width: 100%;
}

.outline-generating {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  padding: 20px;
  background-color: #f7f8fa;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.generation-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  color: #606266;
  font-size: 14px;
}

.sub-chapters {
  margin-left: 20px;
  padding-left: 10px;
  border-left: 2px solid #e8e8e8;
}

.sub-chapter-item {
  margin-top: 10px;
}

.sub-chapter-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.sub-chapter-content {
  color: #606266;
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
