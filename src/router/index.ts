import {createRouter, createWebHistory} from 'vue-router'
import type {RouteRecordRaw} from 'vue-router'

import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import MainPageStu from '../views/MainPageStu.vue'

//Student子路由
import Course from '../router/components/student/CourseView.vue'
import Notification from './components/student/Notification.vue'
import AIGuide from './components/student/AIGuide.vue'
import Setting from './components/student/Setting.vue'
import MainPageTea from '../views/MainPageTea.vue'
import ClassManguage_tea from './components/teacher/ClassManguage.vue'
import ProjectManguage_tea from './components/teacher/ProjectManguage.vue'
import Setting_tea from './components/teacher/Setting.vue'

const routes: RouteRecordRaw[] = [
    {path: '/', redirect: '/login'},
    {path: '/login', name: 'Login', component: LoginView},
    {path: '/register', name: 'Register', component: RegisterView},
    {
        path: '/student', 
        name: 'Student', 
        component: MainPageStu,
        redirect: '/student/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: AIGuide
            },
            {
                path: 'course',
                name: 'Course',
                component: Course
            },
            {
                path: 'notification',
                name: 'Notification',
                component: Notification
            },
            {
                path: 'setting',
                name: 'Setting',
                component: Setting
            }
        ] 
    },
    {
        path: '/teacher',
        name: 'Teacher',
        component: MainPageTea,
        redirect: '/teacher/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'AIGuide',
                component: AIGuide
            },
            {
                path: 'class',
                name: 'ClassManguage',
                component: ClassManguage_tea
            },
            {
                path: 'project',
                name: 'ProjectManguage',
                component: ProjectManguage_tea
            },
            {
                path: 'setting',
                name: 'Setting',
                component: Setting_tea
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
