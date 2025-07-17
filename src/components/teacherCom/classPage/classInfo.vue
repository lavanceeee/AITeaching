<template>
  <div class="class-info-container">
    <!-- 第一行：基本信息卡片 -->
    <div class="info-card">
      <div class="info-row">
        <div class="info-block">
          <div class="info-title">班级名称</div>
          <div class="info-content">{{ classData?.baseInfo.name }}</div>
        </div>
        <div class="info-block">
          <div class="info-title">班级状态</div>
          <div class="info-content status">
            <span class="status-dot" :class="classData?.baseInfo.status === 1 ? 'active' : 'inactive'"></span>
            {{ classData?.baseInfo.status === 1 ? '已激活' : '未激活' }}
          </div>
        </div>
        <div class="info-block">
          <div class="info-title">学生数量</div>
          <div class="info-content">{{ classData?.baseInfo.studentCount }}人</div>
        </div>
        <div class="info-block">
          <div class="info-title">创建时间</div>
          <div class="info-content">{{ formatDate(classData?.baseInfo.createTime) }}</div>
        </div>
        <div class="info-block code-block">
          <div class="info-title">班级码</div>
          <div class="code-content">
            <span class="code">{{ classData?.baseInfo.id }}</span>
            <button class="copy-btn" @click="copyClassCode(classData?.baseInfo.id)">复制</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 第二行：统计图表和快捷功能 -->
    <div class="data-actions-row">
      <!-- 左侧：统计图表区域 -->
      <div class="chart-section">
        <h3 class="section-title">班级数据趋势</h3>
        <div class="chart-tabs">
          <span class="chart-tab active">本周</span>
          <span class="chart-tab">本月</span>
          <span class="chart-tab">本学期</span>
        </div>
        <div class="chart-container" ref="chartContainer"></div>
      </div>
      
      <!-- 右侧：快捷功能区 -->
      <div class="quick-actions">
        <h3 class="section-title">快捷功能</h3>
        <div class="action-grid">
          <div class="action-item" @click="handleAction('添加学生')">
            <span class="icon-wrapper blue">
              <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M678.3 642.4c24.2-13 51.9-20.4 81.4-20.4h.1c3 0 4.4-3.6 2.2-5.6-30.8-27.6-65.6-49.7-103.7-65.8-3.4-1.4-6.9 1.2-6.9 4.8v87c0 3.7 4 6 7.2 4.2 6.7-3.7 13.5-7.1 20.3-10.2zM575.34 510.8c56.5 0 102.3-45.8 102.3-102.3 0-56.5-45.8-102.3-102.3-102.3s-102.3 45.8-102.3 102.3c0 56.6 45.8 102.3 102.3 102.3zM736.1 638c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v48zm144 0c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v48zm-738-520H318c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H150c-6.6 0-12 5.4-12 12v456c0 6.6 5.4 12 12 12h168c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H198c-6.6 0-12-5.4-12-12V178c0-6.6 5.4-12 12-12z"/>
                <path d="M382.4 746.3c-3.8 1.8-7.4 3.5-10.9 5.5-52 28.8-92.7 73.1-117.8 126.4-4 8.6-6.2 18.1-6.2 27.8v48c0 36.8 29.8 64 66.6 64h348c36.8 0 66-27.2 66-64v-48c0-9.7-2.2-19.2-6.2-27.8-25-53.3-65.8-97.6-117.8-126.4-3.5-2-7.1-3.7-10.9-5.5-.9-.4-1.8-.9-2.8-1.3-42.5 35.5-106.4 35.5-148.9 0-1 .4-1.9.8-2.8 1.3z"/>
                <path d="M864 118H602c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h262c6.6 0 12 5.4 12 12v452c0 6.6-5.4 12-12 12H602c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h262c37 0 66-29.8 66-66V184c0-36.2-29-66-66-66z"/>
              </svg>
            </span>
            <span>添加学生</span>
          </div>
          <div class="action-item" @click="handleAction('发布作业')">
            <span class="icon-wrapper green">
              <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M854.6 370.6c-9.9-39.4 9.9-82.3 45.7-105.5 3.4-2.3 3.9-6.9 1-9.9l-28.5-29.5c-2.6-2.7-6.7-2.9-9.7-0.5-40.2 31.3-89.1 22.5-112.8-8.3-23.4-30.4-12.8-73.3 21.4-94.5 3.2-2 4.3-6.1 2.3-9.3l-22.2-32.8c-2-3-6-3.9-9.2-2.1-44.6 25-109.2 4.5-139.2-35.4-2.2-2.9-6.5-3.4-9.5-1.1L546.9 86.2c-2.9 2.2-3.5 6.3-1.3 9.3 30.4 42.6 17.2 100.4-24.8 131.2-41.1 30.2-98.9 15.6-121.8-31.2-2-4-6.9-5.1-10.4-2.3l-21.5 17.7c-3.3 2.7-3.6 7.4-0.8 10.5 34.9 36.9 28.6 99.6-15.5 130-2.4 1.7-3.1 4.8-1.9 7.5l17.1 36.8c1.4 2.9 4.6 4.3 7.6 3.3 41.5-13.8 89.4 4.2 111.7 41.6 21.7 36.5 12.9 82.8-18 111.2-2.4 2.2-2.7 5.8-0.7 8.4l25.9 32.9c2 2.5 5.5 3 8.3 1.2 47-31 111.7-11.3 135.5 39.7 16.5 35.7 4.4 76.9-25.9 100.3-2.7 2.1-3.3 5.8-1.4 8.6l21.1 36.5c1.5 2.7 4.7 3.8 7.5 2.7 13.7-5.3 27.8-8 41.9-8 35.3 0 67.1 15.8 90 40.7 4.3 4.6 11.9 1.3 11.9-5.2 0-87.8-71.3-159-159-159-84.8 0-153.8 66.8-158.7 150.5-81.3 40.9-133.2 125-133.2 216.5 0 49 14.7 94.5 39.9 132.5v94.5c0 17.7 14.3 32 32 32h384c17.7 0 32-14.3 32-32v-96c55.8-47 91.2-116.9 91.2-195 0-51.3-15.1-99.1-41.1-139.1 58-12.4 104.2-58 115.7-116.5 71.8-15.7 125.1-79.6 125.1-156.3 0-87.8-71.3-159-159-159-3.2 0-6.4 0.1-9.5 0.3-31.8-57-93-95.3-163.5-95.3-83.6 0-154.1 54.9-177.7 130.5-13-4.2-26.8-6.5-41.2-6.5-14.7 0-28.9 2.3-42.2 6.7C252.4 455.8 180.7 400 95.7 400c-5.5 0-10 4.5-10 10 0 226.2 183.8 410 410 410 226.2 0 410-183.8 410-410 0-3.3-0.1-6.6-0.2-9.9 7-4.4 13.8-9.1 20.2-14.2 0.2 8 0.3 16 0.3 24.1 0 5.5 4.5 10 10 10 1.9 0 3.8-0.6 5.4-1.7 35.9-24.8 65.2-56.5 85.8-92.7 3.6-6.2-1.1-13.9-8.1-13.1-7.2 0.8-14.3 1.2-21.3 1.2-82.2 0-151-55.1-172.8-130.2 3.8 2.8 7.7 5.5 11.7 8.2 3.9 2.6 9.1 1.6 11.8-2.2l18.9-26.7c2.6-3.7 1.7-8.7-1.9-11.3-16.6-12-30.7-26.7-41.3-43.2 82.7 15.5 154.7-10.2 202.2-77.6 3-4.2 1-10-3.9-11.6-7.9-2.6-15.4-6-22.5-10.1z"/>
              </svg>
            </span>
            <span>发布作业</span>
          </div>
          <div class="action-item" @click="handleAction('发送通知')">
            <span class="icon-wrapper orange">
              <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M816 768h-24V428c0-141.1-104.3-257.7-240-277.1V112c0-22.1-17.9-40-40-40s-40 17.9-40 40v38.9c-135.7 19.4-240 136-240 277.1v340h-24c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h216c0 61.8 50.2 112 112 112s112-50.2 112-112h216c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM512 888c-26.5 0-48-21.5-48-48h96c0 26.5-21.5 48-48 48z"/>
                <path d="M304 412c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8 0-76.8 64-140 144-140h16c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8h-16c-124.1 0-224 95.4-224 212 0 4.4 3.6 8 8 8h8z"/>
              </svg>
            </span>
            <span>发送通知</span>
          </div>
          <div class="action-item" @click="handleAction('编辑班级')">
            <span class="icon-wrapper purple">
              <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M257.7 752c2 0 4-0.2 6-0.5L431.9 722c2-0.4 3.9-1.3 5.3-2.8l423.9-423.9c3.9-3.9 3.9-10.2 0-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2c-1.9 11.1 1.5 21.9 9.4 29.8 6.6 6.4 14.9 9.9 23.8 9.9z m67.4-174.4L687.8 215l73.3 73.3-362.7 362.6-88.9 15.7 15.6-89zM880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32z"/>
              </svg>
            </span>
            <span>编辑班级</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';

const props = defineProps({
  classData: {
    type: Object,
    required: true
  }
});

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '未知';
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 复制班级码
const copyClassCode = (code) => {
  if (!code) return;
  
  navigator.clipboard.writeText(code)
    .then(() => {
      ElMessage({
        message: '班级码已复制到剪贴板',
        type: 'success',
        duration: 2000
      });
    })
    .catch(err => {
      console.error('复制失败:', err);
      ElMessage({
        message: '复制失败，请手动复制',
        type: 'error',
        duration: 2000
      });
    });
};

// 处理快捷操作
const handleAction = (action) => {
  ElMessage.info(`即将${action}，功能开发中...`);
};

// 图表相关逻辑
const chartContainer = ref(null);
let myChart = null;

const initChart = () => {
  if (chartContainer.value) {
    myChart = echarts.init(chartContainer.value);
    
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: '作业提交率',
          type: 'line',
          smooth: true,
          data: [82, 93, 90, 93, 100, 95, 98]
        },
        {
          name: '出勤率',
          type: 'line',
          smooth: true,
          data: [95, 96, 98, 97, 100, 100, 99]
        }
      ]
    };

    myChart.setOption(option);

    window.addEventListener('resize', () => {
      myChart.resize();
    });
  }
};

onMounted(() => {
  initChart();
});
</script>

<style scoped>
.class-info-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0;
}

/* 基本信息卡片样式 */
.info-card {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  padding: 16px;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px 40px;
}

.info-block {
  flex: 1;
  min-width: 140px;
}

.info-title {
  font-size: 13px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.info-content {
  font-size: 15px;
  color: #262626;
  font-weight: 500;
}

.status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.active {
  background-color: #52c41a;
}

.status-dot.inactive {
  background-color: #bfbfbf;
}

.code-block {
  flex: 2;
}

.code-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  background-color: #f5f5f5;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 14px;
  color: #333;
  letter-spacing: 0.5px;
}

.copy-btn {
  border: 1px solid #d9d9d9;
  background: white;
  padding: 4px 12px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.copy-btn:hover {
  background-color: #f5f5f5;
  border-color: #40a9ff;
  color: #40a9ff;
}

/* 数据和功能区域样式 */
.data-actions-row {
  display: flex;
  gap: 16px;
}

.chart-section {
  flex: 2;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  padding: 16px;
}

.section-title {
  font-size: 16px;
  color: #262626;
  font-weight: 500;
  margin: 0 0 16px 0;
}

.chart-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.chart-tab {
  font-size: 13px;
  color: #595959;
  padding: 4px 0;
  position: relative;
  cursor: pointer;
}

.chart-tab.active {
  color: #1890ff;
}

.chart-tab.active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: #1890ff;
  border-radius: 1px;
}

.chart-container {
  height: 200px;
  position: relative;
}

.quick-actions {
  flex: 1;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  padding: 16px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-item:hover {
  background-color: #f5f5f5;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.action-item:hover .icon-wrapper {
  transform: translateY(-3px);
}

.icon-wrapper.blue {
  background-color: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.icon-wrapper.green {
  background-color: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.icon-wrapper.orange {
  background-color: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.icon-wrapper.purple {
  background-color: rgba(114, 46, 209, 0.1);
  color: #722ed1;
}

.icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.action-item span:last-child {
  font-size: 14px;
  color: #595959;
}

/* 响应式布局 */
@media (max-width: 992px) {
  .data-actions-row {
    flex-direction: column;
  }
  
  .action-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .info-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .info-block {
    flex: auto;
  }
  
  .action-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-container {
    height: 150px;
  }
}

@media (max-width: 576px) {
  .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>
