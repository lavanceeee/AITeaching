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
import ClassManguage from './components/teacher/ClassManguage.vue'
import ProjectManguage from './components/teacher/ProjectManguage.vue'
import ClassView from './components/student/ClassView.vue'
import ClassDetails from '../components/teacherCom/classdetails.vue'

// 班级详情页子路由组件
import ClassInfo from '../components/teacherCom/classPage/classInfo.vue'
import Students from '../components/teacherCom/classPage/students.vue'
import Homework from '../components/teacherCom/classPage/homework.vue'
import Information from '../components/teacherCom/classPage/information.vue'

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
                name: 'Student_Dashboard',
                component: AIGuide
            },
            {
                path: 'class',
                name: 'Student_Class',
                component: ClassView
            },
            {
                path: 'course',
                name: 'Student_Course',
                component: Course
            },
            {
                path: 'notification',
                name: 'Student_Notification',
                component: Notification
            },
            {
                path: 'setting',
                name: 'Student_Setting',
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
                name: 'Teacher_Dashboard',
                component: AIGuide
            },
            {
                path: 'class',
                name: 'Teacher_Class_List',
                component: ClassManguage
            },
            {
                path: 'class/:id',
                name: 'Teacher_Class_Details',
                component: ClassDetails,
                children: [
                    {
                        path: 'classInfo',
                        name: 'Teacher_ClassInfo',
                        component: ClassInfo
                    },
                    {
                        path: 'students',
                        name: 'Teacher_Students',
                        component: Students
                    },
                    {
                        path: 'homework',
                        name: 'Teacher_Homework',
                        component: Homework
                    },
                    {
                        path: 'information',
                        name: 'Teacher_Information',
                        component: Information
                    }
                ]
            },
            {
                path: 'project',
                name: 'ProjectManguage',
                component: ProjectManguage
            },
            {
                path: 'setting',
                name: 'TeacherSetting',
                component: Setting
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
