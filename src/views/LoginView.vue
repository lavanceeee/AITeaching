<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { login_method } from "../api/axios";
import { useRouter } from "vue-router";

const router = useRouter();

// 身份选项
const identityOptions = [
  {
    label: "学生",
    value: "student",
    icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  },
  {
    label: "教师",
    value: "teacher",
    icon: "M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z",
  },
  {
    label: "管理员",
    value: "admin",
    icon: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z",
  },
];

// 当前选中的身份
const selectedIdentity = ref("student");

// 账号输入值
const accountInput = ref("");
// 密码输入值
const passwordInput = ref("");
// 记住我
const rememberMe = ref(true);

// 计算当前应该使用的字段名
const currentFieldName = computed(() => `${selectedIdentity.value}Number`);

// 登录参数，根据当前身份动态构建
const loginParams = computed(() => {
  return {
  identity: selectedIdentity.value,
    [currentFieldName.value]: accountInput.value,
    password: passwordInput.value,
    rememberMe: rememberMe.value
  };
});

// 选择身份的方法
const selectIdentity = (identity: string) => {
  selectedIdentity.value = identity;
  // 切换身份时清空账号输入，避免混淆
  accountInput.value = "";
};

// 计算滑块的样式
const sliderStyle = computed(() => {
  const index = identityOptions.findIndex(
    (option) => option.value === selectedIdentity.value
  );
  return {
    transform: `translateY(${index * 100}%)`,
  };
});

// 计算当前账号输入框的提示文本
const accountPlaceholder = computed(() => {
  const identityMap: Record<string, string> = {
    student: "请输入学号",
    teacher: "请输入教师工号",
    admin: "请输入管理员账号"
  };
  return identityMap[selectedIdentity.value];
});

//登录
const handleLogin = async () => {
  await login_method(loginParams.value);
};

// 添加注册页面导航方法
const goToRegister = () => {
  router.push("/register");
};
</script>


<template>
  <div class="main-container">
    <div class="header">
      <div class="pro-name">智慧通</div>
    </div>

    <div class="login-container-wrapper">
      <div class="login-box">
        <div class="login-container login2scan">
          <div class="login-alert">通过扫码登录</div>

          <div class="qrcard-container">
            <img src="../assets/images/qrcard.jpg" alt="qrcard" />
          </div>

          <div class="scan-info">请使用智慧通APP扫描登录</div>
        </div>

        <div class="login-container login2email">
          <div class="title-container">
            <div class="login-alert">通过邮箱登录</div>
          </div>

          <div class="form-container">
            <div class="input-group">
              <input
                type="text"
                :placeholder="accountPlaceholder"
                class="login-input"
                v-model="accountInput"
              />
            </div>

            <div class="input-group">
              <input
                type="password"
                placeholder="请输入密码"
                class="login-input"
                v-model="passwordInput"
              />
            </div>

            <button class="login-button" @click="handleLogin">登 录</button>
          </div>

          <div class="other-login-methods">
            <button class="login-method-btn">
              <img
                src="../assets/icons/login/weixin.svg"
                alt="微信"
                class="login-icon"
              />
              <div>微信</div>
            </button>
            <button class="login-method-btn">
              <img
                src="../assets/icons/login/QQ.svg"
                alt="QQ"
                class="login-icon"
              />
              <div>QQ</div>
            </button>
            <button class="login-method-btn">
              <img
                src="../assets/icons/login/shouji.svg"
                alt="手机"
                class="login-icon"
              />
              <div>手机号</div>
            </button>
          </div>
        </div>
      </div>

      <div class="side-options">
        <div class="identity-select-container">
          <div class="identity-selector">
            <div
              v-for="option in identityOptions"
              :key="option.value"
              :class="[
                'identity-option',
                { active: selectedIdentity === option.value },
              ]"
              @click="selectIdentity(option.value)"
            >
              <div class="identity-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <path fill="currentColor" :d="option.icon" />
                </svg>
              </div>
              <div class="identity-label">{{ option.label }}</div>
            </div>
            <div class="slider" :style="sliderStyle"></div>
          </div>
        </div>

        <!-- 添加注册按钮 -->
        <div class="register-container" @click="goToRegister">
          <div class="register-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path fill="none" d="M0 0h24v24H0z" />
              <path
                fill="currentColor"
                d="M15 4H5v16h14V8h-4V4zM3 2.992C3 2.444 3.447 2 3.999 2H16l5 5v13.993A1 1 0 0 1 20.007 22H3.993A1 1 0 0 1 3 21.008V2.992zM11 11V8h2v3h3v2h-3v3h-2v-3H8v-2h3z"
              />
            </svg>
          </div>
          <div class="register-label">注册</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  /* background-image: url("../assets/images/login-bg05.jpg"); */
  background-color: #796868;
  background-size: cover;
  background-position: center;
  font-family: "PingFang SC", "Helvetica Neue", Helvetica, "Microsoft YaHei",
    Arial, sans-serif;
}

.header {
  display: flex;
  align-items: center;
  height: 3rem;
  background-color: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(5px);
  padding: 0 2rem;
}

.pro-logo {
  width: 2rem;
  height: 2rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  margin-right: 0.5rem;
}

.pro-name {
  color: white;
  font-size: 1.2rem;
  font-weight: 500;
  letter-spacing: 1px;
}

.login-box {
  width: 60rem;
  height: 30rem;
  display: flex;
  gap: 4rem;
  align-items: center;
  justify-content: center;
  background-color: rgba(13, 12, 12, 0.4);
  border-radius: 12px;
  backdrop-filter: blur(15px);
  background-clip: padding-box;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin: 0;
}

.login-container {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  background-color: rgb(58, 58, 58);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.login2scan {
  display: flex;
  flex-direction: column;
  width: 40%;
  height: 90%;
}

.qrcard-container {
  width: 15rem;
  height: 15rem;
  object-fit: cover;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  background: white;
}

.qrcard-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.login-container .login-alert {
  color: white;
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.login-container .login-alert::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2rem;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4096ff, transparent);
}

.scan-info {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}
/* 
.form-container {
  width: 100%;
} */

.login-input {
  /* width: 100%; */
  padding: 0.8rem 1rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(255, 255, 255, 0.08);
  color: white;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.login-input:focus {
  border-color: #4096ff;
  box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.2);
}

.login-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.input-group {
  /* width: 100%; */
  margin-bottom: 1rem;
}

.login-button {
  width: 100%;
  padding: 0.8rem;
  background-color: #4096ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: all 0.3s;
  font-weight: 500;
  letter-spacing: 2px;
  box-shadow: 0 2px 8px rgba(64, 150, 255, 0.4);
}

.login-button:hover {
  background-color: #1677ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 150, 255, 0.5);
}

.login-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(64, 150, 255, 0.4);
}

.login2email {
  width: 22rem;
}

.title-container {
  width: 100%;
  text-align: center;
  margin-bottom: 1rem;
}

.other-login-methods {
  display: flex;
  gap: 1.8rem;
  width: 100%;
  align-items: center;
  margin-top: 2.5rem;
  justify-content: center;
  position: relative;
}

.other-login-methods::before {
  content: "其他登录方式";
  position: absolute;
  top: -1.5rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  padding: 0 0.8rem;
}

.login-method-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  cursor: pointer;
  color: #fff;
  transition: all 0.2s ease;
}

.login-method-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.login-icon {
  width: 20px;
  height: 20px;
}

.identity-select-container {
  height: 30rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.identity-selector {
  width: 5rem;
  height: auto;
  max-height: 240px;
  margin: 0;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.identity-option {
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.7rem;
  cursor: pointer;
  position: relative;
  z-index: 2;
  transition: color 0.3s;
  color: rgba(255, 255, 255, 0.7);
}

.identity-option.active {
  color: white;
}

.identity-icon {
  margin-bottom: 0.3rem;
}

.identity-label {
  font-size: 0.9rem;
  font-weight: 500;
}

/* 添加一个包装容器 */
.login-container-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin: 10px auto;
  max-width: 70rem;
}

/* 修改滑块样式为水平 */
.slider {
  position: absolute;
  height: 33.333%;
  width: 100%;
  background-color: rgba(64, 150, 255, 0.3);
  border-radius: 8px;
  left: 0;
  top: 0;
  z-index: 1;
  transition: transform 0.4s cubic-bezier(0.645, 0.045, 0.355, 1);
}

/* 添加侧边选项容器 */
.side-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 30rem;
  justify-content: center;
}

/* 修改身份选择容器 */
.identity-select-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 添加注册容器样式 */
.register-container {
  width: 5rem;
  height: 5rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
}

.register-container:hover {
  background-color: rgba(64, 150, 255, 0.3);
  color: white;
  transform: translateY(-2px);
}

.register-icon {
  margin-bottom: 0.3rem;
}

.register-label {
  font-size: 0.9rem;
  font-weight: 500;
}
</style>