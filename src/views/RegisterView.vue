<template>
  <div class="main-container">
    <div class="header">
      <div class="pro-name">智慧通 - 注册</div>
    </div>

    <div class="register-box">
      <el-form 
        ref="registerForm"
        :model="formData"
        :rules="rules"
        label-position="top"
        class="register-form"
      >
        <div class="card-container">
          <!-- 左侧卡片：主要注册信息 -->
          <el-card class="info-card left-card">
            <div class="card-header">
              <el-icon><Lock /></el-icon>
              <span>账号信息</span>
            </div>
            
            <el-form-item prop="phone" label="手机号码">
              <el-input 
                v-model="formData.phone" 
                placeholder="请输入手机号码" 
                prefix-icon="Iphone"
              />
            </el-form-item>
            
            <el-form-item prop="email" label="邮箱">
              <el-input 
                v-model="formData.email" 
                placeholder="请输入邮箱" 
                prefix-icon="Message"
              />
            </el-form-item>
            
            <el-form-item prop="password" label="密码">
              <el-input 
                v-model="formData.password" 
                type="password" 
                placeholder="请输入密码"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item prop="confirmPassword" label="确认密码">
              <el-input 
                v-model="formData.confirmPassword" 
                type="password" 
                placeholder="确认密码"
                prefix-icon="Key"
                show-password
              />
            </el-form-item>
            
            <!-- 注册按钮移动到左侧卡片底部 -->
            <div class="action-area">
              <el-button type="primary" class="register-button" @click="handleRegister">注 册</el-button>
              <div class="login-link">
                已有账号？<el-link type="primary" @click="goToLogin">返回登录</el-link>
              </div>
            </div>
          </el-card>
          
          <!-- 右侧卡片：个人信息 -->
          <el-card class="info-card right-card">
            <div class="card-header">
              <el-icon><User /></el-icon>
              <span>个人信息</span>
            </div>
            
            <!-- 身份选择器移到此处 -->
            <div class="identity-selector-container">
              <div class="identity-label">选择身份</div>
              <div 
                class="identity-selector"
                :class="{ 'teacher': selectedIdentity === 'teacher' }"
              >
                <div 
                  v-for="option in identityOptions"
                  :key="option.value"
                  :class="['identity-option', { active: selectedIdentity === option.value }]"
                  @click="selectIdentity(option.value)"
                >
                  <el-icon size="24">
                    <avatar v-if="option.value === 'student'" />
                    <reading v-if="option.value === 'teacher'" />
                    <magic-stick v-if="option.value === 'admin'" />
                  </el-icon>
                  <span>{{ option.label }}</span>
                </div>
              </div>
            </div>
            
            <!-- 使用transition-group为表单项添加动画效果 -->
            <transition-group 
              name="form-fields" 
              tag="div" 
              class="form-fields-container"
              mode="out-in"
            >
              <!-- 学生特有字段 -->
              <template v-if="selectedIdentity === 'student'">
                <el-form-item key="school-student" prop="school" label="学校">
                  <el-select
                    v-model="formData.school"
                    filterable
                    placeholder="请选择学校"
                    class="full-width"
                  >
                    <el-option
                      v-for="item in schoolOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
                
                <el-form-item key="major" prop="major" label="专业">
                  <el-select
                    v-model="formData.major"
                    filterable
                    placeholder="请选择专业"
                    class="full-width"
                  >
                    <el-option
                      v-for="item in majorOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
                
                <el-form-item key="studentNumber" prop="studentNumber" label="学号">
                  <el-input 
                    v-model="formData.studentNumber" 
                    placeholder="请输入学号"
                    prefix-icon="DocumentCopy"
                  />
                </el-form-item>
                
                <el-form-item key="className" prop="className" label="班级">
                  <el-input 
                    v-model="formData.className" 
                    placeholder="请输入班级"
                    prefix-icon="School"
                  />
                </el-form-item>
              </template>
              
              <!-- 教师特有字段 -->
              <template v-else-if="selectedIdentity === 'teacher'">
                <el-form-item key="teacherNumber" prop="teacherNumber" label="教师工号">
                  <el-input 
                    v-model="formData.teacherNumber" 
                    placeholder="请输入教师工号"
                    prefix-icon="DocumentCopy"
                  />
                </el-form-item>
                
                <el-form-item key="realName" prop="realName" label="真实姓名">
                  <el-input 
                    v-model="formData.realName" 
                    placeholder="请输入真实姓名"
                    prefix-icon="User"
                  />
                </el-form-item>
                
                <el-form-item key="idCard" prop="idCard" label="身份证号">
                  <el-input 
                    v-model="formData.idCard" 
                    placeholder="请输入身份证号"
                    prefix-icon="Postcard"
                  />
                </el-form-item>
                
                <el-form-item key="school-teacher" prop="school" label="所属学校">
                  <el-select
                    v-model="formData.school"
                    filterable
                    placeholder="请选择学校"
                    class="full-width"
                  >
                    <el-option
                      v-for="item in schoolOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </template>
            </transition-group>
          </el-card>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import { 
  Iphone, 
  Message, 
  Lock, 
  Key, 
  DocumentCopy, 
  School, 
  Avatar, 
  Reading, 
  MagicStick,
  User,
  Postcard
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { register_method } from '../api/axios';

const router = useRouter();
const registerForm = ref<FormInstance>();

// 表单数据
const formData = reactive({
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  school: '',
  major: '',
  studentNumber: '',
  className: '',
  teacherNumber: '',
  realName: '',
  idCard: ''
});

// 表单校验规则
const validatePass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'));
  } else {
    if (formData.confirmPassword !== '') {
      if (!registerForm.value) return;
      registerForm.value.validateField('confirmPassword', () => undefined);
    }
    callback();
  }
};

const validatePass2 = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== formData.password) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
};

// 身份证号码验证
const validateIdCard = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请输入身份证号码'));
  } else {
    const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (reg.test(value)) {
      callback();
    } else {
      callback(new Error('请输入正确的身份证号码'));
    }
  }
};

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  school: [
    { required: true, message: '请选择学校', trigger: 'change' }
  ],
  major: [
    { required: true, message: '请选择专业', trigger: 'change' }
  ],
  studentNumber: [
    { required: true, message: '请输入学号', trigger: 'blur' }
  ],
  className: [
    { required: true, message: '请输入班级', trigger: 'blur' }
  ],
  // 教师相关字段验证
  teacherNumber: [
    { required: true, message: '请输入教师工号', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  idCard: [
    { required: true, validator: validateIdCard, trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ]
});

// 身份选项
const identityOptions = [
  {
    label: "学生",
    value: "student",
    icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    elIcon: "Avatar"
  },
  {
    label: "教师",
    value: "teacher",
    icon: "M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z",
    elIcon: "Reading"
  }
];

// 学校选项
const schoolOptions = [
  { value: '清华大学', label: '清华大学' },
  { value: '北京大学', label: '北京大学' },
  { value: '复旦大学', label: '复旦大学' },
  { value: '上海交通大学', label: '上海交通大学' },
  { value: '浙江大学', label: '浙江大学' },
  { value: '南京大学', label: '南京大学' },
  { value: '中国人民大学', label: '中国人民大学' },
  { value: '武汉大学', label: '武汉大学' }
];

// 专业选项
const majorOptions = [
  { value: '计算机科学与技术', label: '计算机科学与技术' },
  { value: '软件工程', label: '软件工程' },
  { value: '人工智能', label: '人工智能' },
  { value: '网络工程', label: '网络工程' },
  { value: '电子信息工程', label: '电子信息工程' },
  { value: '通信工程', label: '通信工程' },
  { value: '数据科学与大数据技术', label: '数据科学与大数据技术' },
  { value: '信息安全', label: '信息安全' }
];

// 当前选中的身份
const selectedIdentity = ref("student");

// 选择身份的方法
const selectIdentity = (identity: string) => {
  // 如果点击的是当前已选身份，不做任何操作
  if (selectedIdentity.value === identity) return;
  
  selectedIdentity.value = identity;
  
  // 重置表单验证
  if (registerForm.value) {
    registerForm.value.clearValidate();
  }
};

// 注册方法
const handleRegister = async () => {
  if (!registerForm.value) return;

  await registerForm.value.validate((valid, fields) => {
    if (valid) {
      // 验证通过，执行注册逻辑
      const registerData = {
        identity: selectedIdentity.value,
        formData: formData
      };
      register_method(registerData);
    } else {
      // 验证失败
      ElMessage.error('请检查表单中所有必填项是否都已正确填写。');
      console.log('error submit!', fields);
    }
  });
};

// 返回登录页
const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background-color: #f5f7fa;
  font-family: "PingFang SC", "Helvetica Neue", Helvetica, "Microsoft YaHei", Arial, sans-serif;
}

.header {
  display: flex;
  align-items: center;
  height: 4rem;
  background-color: #ffffff;
  padding: 0 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.pro-name {
  color: #303133;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.register-box {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
}

.register-container {
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 1.5rem;
}

.title h2 {
  font-weight: 600;
  font-size: 1.6rem;
  margin: 0;
  color: #303133;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #409eff;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ebeef5;
}

.identity-selector-container {
  margin-bottom: 1.5rem;
}

.identity-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.identity-selector {
  display: flex;
  justify-content: space-between;
  background-color: #f5f7fa;
  border-radius: 6px;
  padding: 0.5rem;
  border: 1px solid #e4e7ed;
  position: relative;
  overflow: hidden;
}

/* 身份选择器动画增强 */
.identity-selector::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background-color: #409eff;
  border-radius: 4px;
  z-index: 1;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform: translateX(0);
}

.identity-selector.teacher::before {
  transform: translateX(100%);
}

.identity-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: #606266;
  flex: 1;
  position: relative;
  z-index: 2;
  background-color: transparent;
}

.identity-option.active {
  color: white;
  transform: scale(1.05);
}

.identity-option .el-icon {
  font-size: 22px;
  margin-bottom: 0.5rem;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.identity-option:hover .el-icon {
  transform: scale(1.1) translateY(-2px);
}

.identity-option.active .el-icon {
  transform: scale(1.2);
  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));
}

.identity-option span {
  font-weight: 500;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.identity-option.active span {
  font-weight: 600;
}

.register-form {
  margin-top: 1.5rem;
}

.left-column, .right-column {
  padding: 0 0.5rem;
}

.left-column {
  border-right: 1px solid #ebeef5;
}

.full-width {
  width: 100%;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-input__inner) {
  border-radius: 4px;
}

:deep(.el-select .el-input__inner) {
  border-radius: 4px;
}

/* 操作区样式 */
.action-area {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px dashed #e4e7ed;
}

.register-button {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 2px;
  border-radius: 4px;
  background-color: #409eff;
  border: none;
  transition: all 0.3s;
}

.register-button:hover {
  background-color: #337ecc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.login-link {
  text-align: center;
  margin-top: 1rem;
  font-size: 14px;
  color: #606266;
}

.card-container {
  display: flex;
  gap: 20px;
  margin-bottom: 1.5rem;
}

.info-card {
  flex: 1;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.info-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* 左侧卡片样式 */
.left-card {
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 500;
  color: #409eff;
  margin-bottom: 1.2rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #ebeef5;
}

.card-header .el-icon {
  font-size: 18px;
  margin-right: 8px;
}

/* 表单字段动画 - 全新优化版 */
.form-fields-container {
  position: relative;
  min-height: 320px; /* 确保容器高度足够，防止切换时页面跳动 */
  perspective: 1000px; /* 3D视角效果 */
  transform-style: preserve-3d;
  overflow: hidden;
}

/* 处理整个表单组的进出动画 */
.form-fields-enter-active {
  animation: slideInFields 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.form-fields-leave-active {
  animation: slideOutFields 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  position: absolute;
  width: 100%;
}

@keyframes slideInFields {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slideOutFields {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-40px) scale(0.95);
  }
}

/* 单个表单项的错开动画 */
.form-fields-enter-active .el-form-item {
  animation: fadeInItem 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
}

.form-fields-leave-active .el-form-item {
  animation: fadeOutItem 0.4s ease forwards;
  opacity: 1;
}

@keyframes fadeInItem {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOutItem {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}

/* 错开表单项的动画延迟 */
.form-fields-enter-active .el-form-item:nth-child(1) {
  animation-delay: 0.1s;
}

.form-fields-enter-active .el-form-item:nth-child(2) {
  animation-delay: 0.2s;
}

.form-fields-enter-active .el-form-item:nth-child(3) {
  animation-delay: 0.3s;
}

.form-fields-enter-active .el-form-item:nth-child(4) {
  animation-delay: 0.4s;
}

/* 表单控件内部的动画效果 */
:deep(.el-input),
:deep(.el-select) {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

:deep(.el-input:focus-within),
:deep(.el-select:focus-within) {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .register-box {
    margin: 1rem auto;
    max-width: 95%;
  }
  
  .identity-option {
    padding: 0.6rem 0.5rem;
  }
  
  .left-column {
    border-right: none;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
  }
  
  .left-column, .right-column {
    padding: 0;
  }

  .card-container {
    flex-direction: column;
  }
  
  .action-area {
    margin-top: 1rem;
    padding-top: 1rem;
  }
  
  .form-fields-container {
    min-height: 280px;
  }
}
</style>
