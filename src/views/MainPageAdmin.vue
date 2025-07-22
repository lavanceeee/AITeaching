<template>
    <div class="main-page-admin">
        <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
            <div class="sidebar-header">
                <div class="logo-container">
                    <div class="toggle-btn" @click="toggleSidebar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z"/>
                            <path d="M16 18v2H5v-2h11zm5-7v2H3v-2h18zm-2-7v2H8V4h11z" fill="currentColor"/>
                        </svg>
                    </div>
                    <h1 v-show="!isCollapsed">AI智慧教学</h1>
                </div>
            </div>
            
            <div class="sidebar-content">
                <div class="user-profile">
                    <div class="avatar">
                        <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" alt="Avatar" />
                    </div>
                    <div class="user-info" v-show="!isCollapsed">
                        <div class="user-id">管理员</div>
                        <div class="user-major">Administrator</div>
                    </div>
                </div>
                
                <nav class="sidebar-menu">
                    <router-link to="/admain/dashboard" custom v-slot="{ navigate, isActive }">
                        <div class="menu-item" :class="{ active: isActive }" @click="navigate">
                            <div class="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="none" d="M0 0h24v24H0z"/>
                                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
                                </svg>
                            </div>
                            <span class="menu-text" v-show="!isCollapsed">大屏概览</span>
                        </div>
                    </router-link>

                    <router-link to="/admain/accounts" custom v-slot="{ navigate, isActive }">
                        <div class="menu-item" :class="{ active: isActive }" @click="navigate">
                            <div class="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="none" d="M0 0h24v24H0z"/>
                                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/>
                                </svg>
                            </div>
                            <span class="menu-text" v-show="!isCollapsed">用户管理</span>
                        </div>
                    </router-link>
                    
                    <router-link to="/admain/resources" custom v-slot="{ navigate, isActive }">
                        <div class="menu-item" :class="{ active: isActive }" @click="navigate">
                            <div class="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="none" d="M0 0h24v24H0z"/>
                                    <path d="M10 4H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z" fill="currentColor"/>
                                </svg>
                            </div>
                            <span class="menu-text" v-show="!isCollapsed">资源管理</span>
                        </div>
                    </router-link>
                </nav>
            </div>
            
            <div class="sidebar-footer">
                <div class="settings-btn" @click="logout">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="none" d="M0 0h24v24H0z"/>
                        <path d="M5 21q-.825 0-1.413-.588T3 19V5q0-.825.588-1.413T5 3h7v2H5v14h7v2H5Zm11-4-1.375-1.45 2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5-5 5Z" fill="currentColor"/>
                    </svg>
                    <span v-show="!isCollapsed">退出登录</span>
                </div>
            </div>
        </div>
        
        <div class="main-content">
            <router-view></router-view>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

//折叠状态
const isCollapsed = ref(false);

const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value;
};

const logout = () => {
    // 这里处理登出逻辑，例如清除token，然后跳转到登录页
    localStorage.clear();
    router.push('/login');
}
</script>

<style scoped>
.main-page-admin {
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
    color: #fff;
    font-size: 0.95rem;
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
    padding: 24px;
    background-color: #f0f2f5;
}
</style>
