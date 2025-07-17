<template>
    <div class="notification-view">
        <div class="notification-header">
            <h2>我的通知</h2>
            <div class="notification-actions">
                <button class="filter-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
                    </svg>
                    筛选
                </button>
                <button class="mark-all-btn">全部标为已读</button>
            </div>
        </div>

        <div class="notification-list">
            <div 
                v-for="notification in notifications" 
                :key="notification.id" 
                class="notification-card"
                :class="{ 'unread': !notification.read }"
            >
                <div class="notification-icon" :class="notification.type">
                    <svg v-if="notification.type === 'info'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                    <svg v-else-if="notification.type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                    <svg v-else-if="notification.type === 'important'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-2h-2v2zm0-4h2V7h-2v6z"/>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>
                    </svg>
                </div>

                <div class="notification-content">
                    <div class="notification-header-row">
                        <h3>{{ notification.title }}</h3>
                        <span class="notification-time">{{ notification.time }}</span>
                    </div>
                    <p class="notification-text">{{ notification.content }}</p>
                    <div class="notification-footer">
                        <span class="notification-sender">发送者：{{ notification.sender }}</span>
                        <button 
                            class="mark-read-btn" 
                            v-if="!notification.read"
                        >标为已读</button>
                    </div>
                </div>
            </div>
            
            <div v-if="notifications.length === 0" class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24">
                    <path fill="#ddd" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
                </svg>
                <p>暂无通知</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

// 模拟通知数据
const notifications = ref([
    {
        id: 1,
        title: "《高等数学》期中考试通知",
        content: "各位同学，《高等数学》期中考试将于下周三（10月15日）上午9:00在主教学楼301进行，请务必携带学生证和考试用具，准时参加。不得携带任何电子设备入场。",
        sender: "教务处",
        time: "2023-10-08 14:30",
        read: false,
        type: "important"
    },
    {
        id: 2,
        title: "关于举办校园歌手大赛的通知",
        content: "为丰富校园文化生活，展现当代大学生的青春风采，我校将于本月20日举办校园歌手大赛，欢迎各位同学踊跃报名参加。报名截止日期为本月15日。",
        sender: "校团委",
        time: "2023-10-05 10:15",
        read: false,
        type: "info"
    },
    {
        id: 3,
        title: "图书馆借阅到期提醒",
        content: "您于2023年9月20日借阅的《数据结构与算法分析》将于明天到期，请及时续借或归还。逾期未还将产生滞纳金，每天0.5元。",
        sender: "图书馆",
        time: "2023-10-04 09:00",
        read: true,
        type: "warning"
    },
    {
        id: 4,
        title: "关于国庆节放假安排的通知",
        content: "根据国务院办公厅通知，结合我校实际情况，现将2023年国庆节放假安排通知如下：10月1日至7日放假调休，共7天。9月30日（周六）正常上课。10月8日（周日）正常上课。",
        sender: "校办公室",
        time: "2023-09-25 16:45",
        read: true,
        type: "info"
    },
    {
        id: 5,
        title: "计算机科学与技术学院学术讲座",
        content: "我院将于本周五（10月13日）下午2:00在科技楼报告厅举办学术讲座，主题为“人工智能与未来教育”，主讲人为清华大学王教授，欢迎各位同学参加。",
        sender: "计算机科学与技术学院",
        time: "2023-10-10 11:20",
        read: false,
        type: "info"
    },
    {
        id: 6,
        title: "关于评选校级奖学金的通知",
        content: "2023-2024学年校级奖学金评选工作即将开始，请符合条件的同学于本月25日前向所在学院提交申请材料，具体评选标准和流程请参见附件。",
        sender: "学生处",
        time: "2023-10-09 15:30",
        read: false,
        type: "important"
    },
    {
        id: 7,
        title: "校园网络维护通知",
        content: "为提升校园网络服务质量，信息中心将于本周六（10月14日）凌晨2:00-6:00对校园网进行系统维护，期间校园网可能会出现短暂中断，给您带来的不便敬请谅解。",
        sender: "信息中心",
        time: "2023-10-11 17:00",
        read: true,
        type: "warning"
    }
]);
</script>

<style scoped>
.notification-view {
    padding: 1.5rem 2.5rem;
    /* 移除height和overflow-y设置，使用父容器的滚动 */
}

.notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.notification-header h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.notification-actions {
    display: flex;
    gap: 1rem;
}

.filter-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
}

.filter-btn:hover {
    border-color: #4096ff;
    color: #4096ff;
}

.mark-all-btn {
    background-color: transparent;
    border: none;
    color: #4096ff;
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.5rem 0;
}

.mark-all-btn:hover {
    text-decoration: underline;
}

.notification-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.notification-card {
    display: flex;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    transition: transform 0.2s, box-shadow 0.2s;
}

.notification-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.notification-card.unread {
    background-color: rgba(64, 150, 255, 0.03);
}

.notification-icon {
    margin-right: 1.5rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.notification-icon.info {
    background-color: rgba(64, 150, 255, 0.1);
    color: #4096ff;
}

.notification-icon.warning {
    background-color: rgba(250, 140, 22, 0.1);
    color: #fa8c16;
}

.notification-icon.important {
    background-color: rgba(245, 34, 45, 0.1);
    color: #f5222d;
}

.notification-content {
    flex: 1;
}

.notification-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
}

.notification-content h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    color: #333;
}

.notification-time {
    font-size: 0.85rem;
    color: #999;
}

.notification-text {
    margin: 0 0 1rem 0;
    color: #666;
    line-height: 1.5;
}

.notification-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.notification-sender {
    font-size: 0.85rem;
    color: #999;
}

.mark-read-btn {
    background-color: transparent;
    border: none;
    color: #4096ff;
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0;
}

.mark-read-btn:hover {
    text-decoration: underline;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 0;
    color: #999;
}

.empty-state p {
    margin-top: 1rem;
    font-size: 1.1rem;
}
</style>