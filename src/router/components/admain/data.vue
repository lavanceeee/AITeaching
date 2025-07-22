<template>
  <div class="dashboard-container">
    <el-row :gutter="20" class="top-row">
      <el-col :span="6" v-for="item in keyMetrics" :key="item.title">
        <div class="metric-card">
          <div class="icon-wrapper" :style="{ backgroundColor: item.color }">
            <el-icon :component="item.icon" color="#fff" :size="28"></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ item.value.toLocaleString() }}</div>
            <div class="metric-title">{{ item.title }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">平台使用次数趋势</div>
          <div ref="usageTrendsChart" style="height: 300px;"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">热门活跃板块</div>
          <div ref="activeModulesChart" style="height: 300px;"></div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="8">
        <div class="chart-card">
          <div class="chart-header">教学效率指数</div>
          <div ref="efficiencyGauge" style="height: 280px;"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-card">
          <div class="chart-header">用户周活跃度</div>
          <div class="activity-gauges">
            <el-progress type="dashboard" :percentage="weeklyActivity.teacher" color="#67C23A">
              <template #default="{ percentage }">
                <span class="percentage-value">{{ percentage }}%</span>
                <span class="percentage-label">教师</span>
              </template>
            </el-progress>
            <el-progress type="dashboard" :percentage="weeklyActivity.student" color="#409EFF">
               <template #default="{ percentage }">
                <span class="percentage-value">{{ percentage }}%</span>
                <span class="percentage-label">学生</span>
              </template>
            </el-progress>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-card">
          <div class="chart-header">高频错误知识点 Top 5</div>
          <div ref="frequentErrorsChart" style="height: 280px;"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import mockData from './mockData.json';
import { User, Avatar, Collection, Reading } from '@element-plus/icons-vue';

const usageTrendsChart = ref(null);
const activeModulesChart = ref(null);
const efficiencyGauge = ref(null);
const frequentErrorsChart = ref(null);

let charts = [];

const keyMetrics = ref([
  { title: '平台用户总数', value: mockData.keyMetrics.totalUsers, icon: User, color: '#409EFF' },
  { title: '教师总数', value: mockData.keyMetrics.totalTeachers, icon: Avatar, color: '#67C23A' },
  { title: '学生总数', value: mockData.keyMetrics.totalStudents, icon: Reading, color: '#E6A23C' },
  { title: '教学资源总数', value: mockData.keyMetrics.totalResources, icon: Collection, color: '#F56C6C' }
]);

const weeklyActivity = ref({
  teacher: mockData.activityStats.weekly.teacherUsage,
  student: mockData.activityStats.weekly.studentUsage
});

const themeColors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'];

const initCharts = () => {
  const usageChart = echarts.init(usageTrendsChart.value);
  const usageOption = {
    color: ['#409EFF', '#67C23A'],
    tooltip: { trigger: 'axis' },
    legend: { data: ['教师', '学生'], textStyle: { color: '#606266' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: mockData.usageTrends.dates, axisLine: { lineStyle: { color: '#DCDFE6' } }, axisLabel: { color: '#606266' } },
    yAxis: { type: 'value', axisLine: { show: true, lineStyle: { color: '#DCDFE6' } }, splitLine: { lineStyle: { type: 'dashed' } }, axisLabel: { color: '#606266' } },
    series: [
      { name: '教师', type: 'line', smooth: true, data: mockData.usageTrends.teacherData, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(64, 158, 255, 0.3)' }, { offset: 1, color: 'rgba(64, 158, 255, 0)' }]) } },
      { name: '学生', type: 'line', smooth: true, data: mockData.usageTrends.studentData, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(103, 194, 58, 0.3)' }, { offset: 1, color: 'rgba(103, 194, 58, 0)' }]) } }
    ]
  };
  usageChart.setOption(usageOption);
  charts.push(usageChart);

  const modulesChart = echarts.init(activeModulesChart.value);
  const modulesOption = {
    color: themeColors,
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', textStyle: { color: '#606266' } },
    series: [{
      name: '活跃板块', type: 'pie', radius: ['40%', '70%'], center: ['65%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: '20', fontWeight: 'bold' } },
      labelLine: { show: false },
      data: mockData.activeModules
    }]
  };
  modulesChart.setOption(modulesOption);
  charts.push(modulesChart);

  const efficiencyChart = echarts.init(efficiencyGauge.value);
  const efficiencyOption = {
    series: [{
      type: 'gauge',
      detail: { formatter: '{value}', color: '#303133', fontSize: 40, offsetCenter: [0, '40%'] },
      data: [{ value: mockData.teachingEfficiency.index, name: '效率指数' }],
      title: { color: '#606266', fontSize: 16, offsetCenter: [0, '70%'] },
      axisLine: { lineStyle: { width: 20, color: [[0.6, '#F56C6C'], [0.8, '#E6A23C'], [1, '#67C23A']] } },
      progress: { show: true, width: 20 },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      anchor: { show: false }
    }]
  };
  efficiencyChart.setOption(efficiencyOption);
  charts.push(efficiencyChart);

  const errorsChart = echarts.init(frequentErrorsChart.value);
  const errorsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 0, right: '10%', bottom: 0, top: '5%', containLabel: true },
    xAxis: { type: 'value', boundaryGap: [0, 0.01], splitLine: { show: true, lineStyle: { type: 'dashed' } }, axisLabel: { color: '#606266' } },
    yAxis: { type: 'category', data: mockData.frequentErrors.map(item => item.name).reverse(), axisLabel: { color: '#606266', interval: 0 } },
    series: [{
      type: 'bar',
      data: mockData.frequentErrors.map(item => item.value).reverse(),
      itemStyle: { color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{ offset: 0, color: 'rgba(64, 158, 255, 0.3)' }, { offset: 1, color: '#409EFF' }]) },
      barWidth: '60%',
      showBackground: true,
      backgroundStyle: { color: 'rgba(180, 180, 180, 0.2)' },
      label: { show: true, position: 'right', color: '#303133' }
    }]
  };
  errorsChart.setOption(errorsOption);
  charts.push(errorsChart);
};

onMounted(() => {
  initCharts();
  window.addEventListener('resize', () => {
    charts.forEach(chart => chart.resize());
  });
});

onUnmounted(() => {
  charts.forEach(chart => chart.dispose());
  window.removeEventListener('resize', () => {});
});
</script>

<style scoped>
.dashboard-container {
  background-color: #f5f7fa;
  padding: 24px;
  height: 100%;
}

.top-row {
  margin-bottom: 20px;
}

.metric-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.icon-wrapper {
  height: 54px;
  width: 54px;
  min-width: 54px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-title {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.metric-value {
  font-size: 26px;
  font-weight: 600;
  color: #303133;
}

.chart-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.chart-header {
  color: #303133;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
}

.activity-gauges {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 280px;
}

.percentage-value {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.percentage-label {
  display: block;
  margin-top: 8px;
  font-size: 14px;
  color: #909399;
}
</style>
