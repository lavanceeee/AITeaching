import {defineStore} from 'pinia'

// 定义用户信息的接口
interface UserInfo {
  username: string;
  nickname?: string;
  email: string;
  phone?: string;
  gender?: number;
  birthday?: string;
  bio?: string;
  studentNumber: string;
  realName: string;
  idCard: string;
  grade: string;
  major: string;
  className: string;
  school: string;
  college: string;
  enrollmentDate: string;
  graduationDate?: string;
}

export const useStudentInfoStore = defineStore('studentInfo', {
    state: (): { userInfo: UserInfo | null } => ({
        userInfo: null
    }),

    actions: {
        saveStudentInfo(info: UserInfo) {
            this.userInfo = info
        },
        clearStudentInfo() {
            this.userInfo = null;
        },
        //测试使用学生信息
        setTestInfo() {
            this.userInfo = {
                username: "student_test_001",
                nickname: "测试小明",
                email: "test_student@example.com",
                phone: "13912345678",
                gender: 1,
                birthday: "2002-08-15T00:00:00",
                bio: "这是一位用于测试的学生，喜欢编程和开源项目。",
                studentNumber: "2024999001",
                realName: "张小明",
                idCard: "440101200208151234",
                grade: "2024",
                major: "软件工程",
                className: "软工240T班",
                school: "前端测试大学",
                college: "信息科学与技术学院",
                enrollmentDate: "2024-09-01",
                graduationDate: "2028-06-30",
            };
        }
    }
})