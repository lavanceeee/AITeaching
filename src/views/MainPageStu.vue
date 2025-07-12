<template>
    <div class="main-page-stu">
        <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
            <div class="sidebar-header">
                <div class="logo-container">
                    <div class="toggle-btn" @click="toggleSidebar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z"/>
                            <path d="M16 18v2H5v-2h11zm5-7v2H3v-2h18zm-2-7v2H8V4h11z" fill="currentColor"/>
                        </svg>
                    </div>
                    <h1 v-show="!isCollapsed">智慧通</h1>
                </div>
            </div>
            
            <div class="sidebar-content">
                <div class="user-profile">
                    <div class="avatar">
                        <img src="../assets/icons/mainPageStu/StudentAvatar.svg" alt="Avatar" />
                    </div>
                    <div class="user-info" v-show="!isCollapsed">
                        <div class="user-id">学号：{{ studentNumber }}</div>
                        <div class="user-major">专业：{{ major }}</div>
                    </div>
                </div>
                
                <nav class="sidebar-menu">
                    <router-link to="/student/dashboard" custom v-slot="{ navigate, isActive }">
                        <div class="menu-item" :class="{ active: isActive }" @click="navigate">
                            <div class="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="none" d="M0 0h24v24H0z"/>
                                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
                                </svg>
                            </div>
                            <span class="menu-text" v-show="!isCollapsed">首页</span>
                        </div>
                    </router-link>
                    
                    <router-link to="/student/course" custom v-slot="{ navigate, isActive }">
                        <div class="menu-item" :class="{ active: isActive }" @click="navigate">
                            <div class="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="none" d="M0 0h24v24H0z"/>
                                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" fill="currentColor"/>
                                </svg>
                            </div>
                            <span class="menu-text" v-show="!isCollapsed">课程</span>
                        </div>
                    </router-link>
                    
                    <router-link to="/student/notification" custom v-slot="{ navigate, isActive }">
                        <div class="menu-item" :class="{ active: isActive }" @click="navigate">
                            <div class="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="none" d="M0 0h24v24H0z"/>
                                    <path d="M20 17h2v2H2v-2h2v-7a8 8 0 1 1 16 0v7zm-2 0v-7a6 6 0 1 0-12 0v7h12zm-9 4h6v2H9v-2z" fill="currentColor"/>
                                </svg>
                            </div>
                            <span class="menu-text" v-show="!isCollapsed">通知</span>
                            <div class="notification-badge">5</div>
                        </div>
                    </router-link>
                </nav>
            </div>
            
            <div class="sidebar-footer">
                <router-link to="/student/setting" custom v-slot="{ navigate, isActive }">
                    <div class="settings-btn" :class="{ active: isActive }" @click="navigate">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                            <path fill="none" d="M0 0h24v24H0z"/>
                            <path d="M12 1l9.5 5.5v11L12 23l-9.5-5.5v-11L12 1zm0 2.311L4.5 7.653v8.694l7.5 4.342 7.5-4.342V7.653L12 3.311zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
                        </svg>
                        <span v-show="!isCollapsed">设置</span>
                    </div>
                </router-link>
            </div>
        </div>
        
        <div class="main-content">
                <router-view></router-view>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useStudentInfoStore } from '../store/studentInfoStore';

//studentNumber
const studentNumber = ref('')
const major = ref('')

//加载钩子发送信息请求
onMounted(()=>{
    const store = useStudentInfoStore();
    if (store.userInfo){
        studentNumber.value = store.userInfo.studentNumber;
        major.value = store.userInfo.major;
    }
})

//折叠状态
const isCollapsed = ref(true);

const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
.main-page-stu {
    display: flex;
    width: 100%;
    height: 100vh;
    background-color: #f5f7fb;
}

.sidebar {
    width: 240px;
    height: 100%;
    background: linear-gradient(to bottom, #3a4a5d, #2c3e50);
    color: white;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.sidebar.collapsed {
    width: 70px;
}

.sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    transition: padding 0.3s ease;
}

.sidebar.collapsed .sidebar-header {
    padding: 1.5rem 0;
    display: flex;
    justify-content: center;
}

.logo-container {
    display: flex;
    align-items: center;
}

.toggle-btn {
    width: 32px;
    height: 32px;
    background-color: #4096ff;
    border-radius: 8px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.sidebar.collapsed .toggle-btn {
    margin-right: 0;
    transform: rotate(180deg);
}

.toggle-btn:hover {
    background-color: #1677ff;
}

.sidebar-header h1 {
    font-size: 1.3rem;
    font-weight: 500;
    margin: 0;
}

.sidebar-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1.5rem 0;
    overflow-y: auto;
}

.user-profile {
    display: flex;
    align-items: center;
    padding: 0 1.5rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    transition: padding 0.3s ease;
}

.sidebar.collapsed .user-profile {
    padding: 0 0 1.5rem;
    justify-content: center;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 12px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    transition: margin 0.3s ease;
}

.sidebar.collapsed .avatar {
    margin-right: 0;
}

.avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-id, .user-major {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    margin-top: 2px;
}

.sidebar-menu {
    padding: 1.5rem;
    transition: padding 0.3s ease;
}

.sidebar.collapsed .sidebar-menu {
    padding: 1.5rem 0.5rem;
}

.menu-item {
    display: flex;
    align-items: center;
    padding: 0.8rem 1rem;
    margin-bottom: 0.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
}

.sidebar.collapsed .menu-item {
    justify-content: center;
    padding: 0.8rem;
}

.menu-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.menu-item.active {
    background-color: #4096ff;
}

.icon {
    width: 24px;
    height: 24px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: margin 0.3s ease;
}

.sidebar.collapsed .icon {
    margin-right: 0;
}

.menu-text {
    font-size: 0.95rem;
}

.notification-badge {
    background-color: #ff4d4f;
    color: white;
    font-size: 0.7rem;
    font-weight: bold;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 12px;
}

.sidebar.collapsed .notification-badge {
    right: 8px;
    top: 8px;
}

.sidebar-footer {
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    transition: padding 0.3s ease;
}

.sidebar.collapsed .sidebar-footer {
    padding: 1.5rem 0;
    display: flex;
    justify-content: center;
}

.settings-btn {
    display: flex;
    align-items: center;
    opacity: 0.7;
    cursor: pointer;
    transition: opacity 0.2s;
}

.settings-btn:hover {
    opacity: 1;
}

.settings-btn svg {
    margin-right: 8px;
    transition: margin 0.3s ease;
}

.sidebar.collapsed .settings-btn svg {
    margin-right: 0;
}

.main-content {
    flex: 1;
    overflow-y: auto;
    padding: 0;

}


.content-placeholder h2 {
    margin-bottom: 1rem;
    color: #333;
}
</style>