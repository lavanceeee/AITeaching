import {defineStore} from 'pinia'

export const useStudentInfoStore = defineStore('studentInfo', {
    state: ()=>({
        userInfo: null
    }),

    actions: {
        saveStudentInfo(info: any) {
            this.userInfo = info
        },
        clearStudentInfo() {
            this.userInfo = null;
        }
    }
})