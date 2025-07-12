<template>
    <div class="course-view">
        <div class="course-header">
            <h2>我的课程</h2>
            <div class="course-actions">
                <button class="add-course-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    添加课程
                </button>
                <div class="search-container">
                    <input type="text" placeholder="搜索课程..." class="search-input" />
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" class="search-icon">
                        <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                </div>
            </div>
        </div>

        <div class="course-grid">
            <div v-for="course in courses" :key="course.id" class="course-card">

                <div class="course-icon" :style="{ backgroundColor: course.color }">
                    {{ course.name.slice(0, 2) }}
                </div>
                
                <h3 class="course-name">{{ course.name }}</h3>
                <div class="course-teacher">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    {{ course.teacher }} 
                </div>
                
                <div class="course-meta">
                    <div class="meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                            <path fill="currentColor" d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                        {{ course.hours }}学时
                    </div>
                    <div class="meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                        </svg>
                        {{ course.credit }}学分
                    </div>
                    <div class="meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        绩点{{ course.gpa }}
                    </div>
                </div>
                
                <button class="enter-course-btn">进入课程</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

// 模拟课程数据
const courses = ref([
    {
        id: 1,
        name: "高等数学",
        teacher: "王教授",
        hours: 64,
        credit: 4,
        gpa: 4.0,
        color: "#4096ff"
    },
    {
        id: 2,
        name: "大学物理",
        teacher: "李教授",
        hours: 48,
        credit: 3,
        gpa: 3.5,
        color: "#722ed1"
    },
    {
        id: 3,
        name: "数据结构",
        teacher: "张教授",
        hours: 56,
        credit: 3.5,
        gpa: 4.0,
        color: "#13c2c2"
    },
    {
        id: 4,
        name: "计算机组成原理",
        teacher: "刘教授",
        hours: 48,
        credit: 3,
        gpa: 3.7,
        color: "#fa8c16"
    },
    {
        id: 5,
        name: "操作系统",
        teacher: "陈教授",
        hours: 56,
        credit: 3.5,
        gpa: 3.8,
        color: "#eb2f96"
    },
    {
        id: 6,
        name: "计算机网络",
        teacher: "黄教授",
        hours: 48,
        credit: 3,
        gpa: 3.6,
        color: "#52c41a"
    },
    {
        id: 7,
        name: "软件工程",
        teacher: "郑教授",
        hours: 40,
        credit: 2.5,
        gpa: 3.9,
        color: "#f5222d"
    },
    {
        id: 8,
        name: "人工智能导论",
        teacher: "吴教授",
        hours: 40,
        credit: 2.5,
        gpa: 4.0,
        color: "#1890ff"
    }
]);
</script>

<style scoped>
.course-view {
    padding: 1.5rem 2.5rem;
    height: 100%;
    overflow-y: auto;
}

.course-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.course-header h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.course-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.add-course-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: #4096ff;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.6rem 1.2rem;
    font-size: 0.95rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.add-course-btn:hover {
    background-color: #1677ff;
}

.search-container {
    position: relative;
}

.search-input {
    padding: 0.6rem 1rem 0.6rem 2.5rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.95rem;
    width: 240px;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
    outline: none;
    border-color: #4096ff;
    box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.1);
}

.search-icon {
    position: absolute;
    left: 0.8rem;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
}

.course-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
}

.course-card {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
}

.course-icon {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.2rem;
    margin-bottom: 1rem;
}

.course-name {
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #333;
}

.course-teacher {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 1rem;
}

.course-meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.85rem;
    color: #666;
}

.enter-course-btn {
    width: 100%;
    padding: 0.7rem;
    border: none;
    background-color: #f0f0f0;
    color: #333;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: background-color 0.2s;
}

.enter-course-btn:hover {
    background-color: #e0e0e0;
}
</style>