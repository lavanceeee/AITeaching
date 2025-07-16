import { defineStore } from 'pinia'

// 定义教师信息的接口，严格按照后端返回的字段
interface TeacherInfo {
    id: number;
    teacherNumber: string;
    username: string;
    email: string;
    phone: string;
    realName: string;
    idCard: string;
    school: string;
    status: number;
    isAdmin: number;
    createTime: string;
    updateTime: string;
    permissions: string[];
    avatar?: string; // 可选字段，用于前端显示
}

export const useTeacherInfoStore = defineStore('teacherInfo', {
    state: (): { userInfo: TeacherInfo } => ({
        userInfo: {
            id: 0,
            teacherNumber: "",
            username: "",
            email: "",
            phone: "",
            realName: "",
            idCard: "",
            school: "",
            status: 0,
            isAdmin: 0,
            createTime: "",
            updateTime: "",
            permissions: [],
            avatar: "https://pic.616pic.com/ys_bnew_img/00/42/51/nLWA3fYywP.jpg" // 默认头像
        }
    }),

    actions: {
        saveTeacherInfo(info: TeacherInfo) {
            // 如果后端返回的数据没有头像，保留当前头像
            if (!info.avatar) {
                info.avatar = this.userInfo.avatar;
            }
            this.userInfo = info;
        },
        clearTeacherInfo() {
            this.userInfo = {
                id: 0,
                teacherNumber: "",
                username: "",
                email: "",
                phone: "",
                realName: "",
                idCard: "",
                school: "",
                status: 0,
                isAdmin: 0,
                createTime: "",
                updateTime: "",
                permissions: [],
                avatar: "https://pic.616pic.com/ys_bnew_img/00/42/51/nLWA3fYywP.jpg"
            };
        },
        //测试使用教师信息
        setTestInfo() {
            this.userInfo = {
                id: 1,
                teacherNumber: "T001",
                username: "teacher001",
                email: "teacher@example.com",
                phone: "13800138000",
                realName: "张老师",
                idCard: "110101199001010001",
                school: "示例大学",
                status: 1,
                isAdmin: 0,
                createTime: "2024-01-01T10:00:00",
                updateTime: "2024-01-01T10:00:00",
                permissions: ["READ_PROFILE", "UPDATE_PROFILE", "READ_COURSES", "MANAGE_COURSES", "MANAGE_GRADES", "VIEW_GRADES"],
                avatar: "https://pic.616pic.com/ys_bnew_img/00/42/51/nLWA3fYywP.jpg"
            };
        },
        // 检查教师是否有特定权限
        hasPermission(permission: string): boolean {
            return this.userInfo.permissions.includes(permission);
        },
        // 检查教师是否有多个权限中的任意一个
        hasAnyPermission(permissions: string[]): boolean {
            return permissions.some(permission => this.hasPermission(permission));
        },
        // 检查教师是否有所有指定权限
        hasAllPermissions(permissions: string[]): boolean {
            return permissions.every(permission => this.hasPermission(permission));
        }
    }
})
