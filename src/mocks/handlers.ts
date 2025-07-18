import { http, HttpResponse } from 'msw'
import { BASE_URL } from '../api/config'

// 使用实际的 BASE_URL
const API_PREFIX = BASE_URL

interface CreateConversationParams {
  title: string;
  memoryId: string;
  modelName: string;
  tags?: string[];
  enableRag?: boolean;
  courseId?: number | null;
}

interface BatchCreateMessagesParams {
  conversationId: number | string;
  messages: Array<{
    messageType: number; // 0-用户消息，1-AI消息
    content: string;
    sequence: number;
  }>;
}

// 添加登录参数接口定义
interface LoginRequestParams {
  identity: string;
  password: string;
  rememberMe: boolean;
  [key: string]: string | boolean; // 用于动态字段如 studentNumber, teacherNumber
}

/* 
登录测试用例：
1. 学生登录 - 用户名：student123 密码：123456
2. 教师登录 - 用户名：teacher123 密码：123456
3. 管理员登录 - 用户名：admin123 密码：123456
*/

/* 
用户信息获取与更新测试用例：
1. 获取教师信息 - GET 请求到 /teacher/:teacherId
   - 返回包含完整教师信息的响应，严格按照后端格式
   - 字段包括：id, teacherNumber, username, email, phone, realName, idCard, school, status, isAdmin, createTime, updateTime, permissions
   - 支持任意teacherId，始终返回相同的测试数据

2. 获取学生信息 - GET 请求到 /student/:studentId
   - 返回包含完整学生信息的响应，包括学号、班级、专业等字段
   - 支持任意studentId，始终返回相同的测试数据

3. 更新教师信息 - PUT 请求到 /teacher/update
   - 请求体为要更新的字段集合
   - 返回成功响应，包含完整的教师信息（更新字段 + 默认值）
   - 自动更新updateTime字段为当前时间

4. 更新学生信息 - PUT 请求到 /student/update
   - 请求体为要更新的字段集合
   - 返回成功响应，包含更新的字段和更新时间

调用示例：
- getUserInfo_method() 会根据localStorage中的identity和id选择正确的接口
- 根据登录的用户类型，信息会保存到对应的Pinia store中
- 教师信息将存储在teacherInfoStore中，字段与后端保持一致
*/

/*
课程管理测试用例：
1. 创建新课程 - POST /course/create
   - 调用 createCourse_method 会触发此模拟
   - 请求体需要包含课程的核心信息，如 name, courseCode, teacherId 等
   - 成功后返回 { code: 200, message: '...', data: newCourseObject }
   - newCourseObject 包含所有传入的字段，并额外生成了 id, createTime 和 enrolledCount
   - 新创建的课程会被添加到模拟数据库的顶部

2. 查询教师的课程列表 - GET /course/teacher/:teacherId
   - 当前端调用一个（假定的）queryCourses(teacherId, page, pageSize) 方法时触发
   - 根据 teacherId 筛选课程 (当前模拟数据中 teacherId 为 1)
   - 支持 page 和 pageSize 分页参数
   - 返回分页格式的数据：{ records, total, size, current, pages }

调用示例：
- 在 uploadProject.vue 中提交表单，会调用 createCourse_method
- 在 ProjectManguage.vue 中（取消注释后）调用 fetchCourses，会触发查询
*/

// 模拟课程数据库，可被 handler 修改
let mockCoursesDb = [
  {
    id: 1,
    courseCode: "CS101",
    name: "Java程序设计",
    description: "Java基础编程课程，包含语法基础、面向对象编程等内容",
    cover: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=500&q=80",
    school: "某某大学",
    major: "计算机科学与技术",
    grade: "2024级",
    status: 1,
    statusDesc: "已发布",
    tags: "编程,基础,Java",
    startTime: "2024-09-01",
    endTime: "2024-12-31",
    teacherId: "mock-teacher-id-123",
    teacherName: "张老师",
    credits: 3,
    hours: 48,
    capacity: 50,
    enrolledCount: 30,
    createTime: "2024-01-01T12:00:00"
  },
  {
    id: 2,
    courseCode: "DS202",
    name: "数据结构与算法",
    description: "深入探讨常见数据结构（如链表、树、图）和核心算法。",
    cover: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80",
    school: "某某大学",
    major: "计算机科学与技术",
    grade: "2024级",
    status: 2,
    statusDesc: "进行中",
    tags: "核心,算法,数据结构",
    startTime: "2024-09-01",
    endTime: "2024-12-31",
    teacherId: "mock-teacher-id-123",
    teacherName: "张老师",
    credits: 4,
    hours: 64,
    capacity: 45,
    enrolledCount: 45,
    createTime: "2024-01-02T12:00:00"
  },
   {
    id: 3,
    courseCode: "WEB301",
    name: "Web前端开发",
    description: "学习HTML, CSS, JavaScript以及现代前端框架Vue.js。",
    cover: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500&q=80",
    school: "某某大学",
    major: "软件工程",
    grade: "2023级",
    status: 0,
    statusDesc: "草稿",
    tags: "前端,Vue,实战",
    startTime: "2024-09-01",
    endTime: "2024-12-31",
    teacherId: "mock-teacher-id-123",
    teacherName: "张老师",
    credits: 3,
    hours: 48,
    capacity: 60,
    enrolledCount: 0,
    createTime: "2024-02-10T12:00:00"
  },
  {
    id: 4,
    courseCode: "DB401",
    name: "数据库系统原理",
    description: "介绍关系数据库模型、SQL语言以及数据库设计范式。",
    cover: "https://images.unsplash.com/photo-1593435713504-a83015db54e9?w=500&q=80",
    school: "某某大学",
    major: "计算机科学与技术",
    grade: "2023级",
    status: 3,
    statusDesc: "已结束",
    tags: "数据库,SQL,后端",
    startTime: "2023-09-01",
    endTime: "2023-12-31",
    teacherId: "mock-teacher-id-123",
    teacherName: "张老师",
    credits: 3,
    hours: 48,
    capacity: 50,
    enrolledCount: 48,
    createTime: "2023-01-15T12:00:00"
  }
];

// ==================== 班级管理模拟 ====================

// 模拟班级数据库
let mockClassesDb = [
  {
    id: '1',
    name: '软件工程1班',
    major: '软件工程',
    grade: '2023',
    school: '华中科技大学',
    status: 1,
    studentCount: 30,
    createTime: '2024-01-01T10:00:00'
  },
  {
    id: '2',
    name: '人工智能2班',
    major: '人工智能',
    grade: '2022',
    school: '清华大学',
    status: 1,
    studentCount: 28,
    createTime: '2024-01-02T10:00:00'
  },
  {
    id: '3',
    name: '计算机科学3班',
    major: '计算机科学与技术',
    grade: '2021',
    school: '北京大学',
    status: 0,
    studentCount: 35,
    createTime: '2024-01-03T10:00:00'
  },
  {
    id: '4',
    name: '大数据4班',
    major: '大数据技术',
    grade: '2023',
    school: '浙江大学',
    status: 1,
    studentCount: 32,
    createTime: '2024-01-04T10:00:00'
  },
  {
    id: '5',
    name: '网络安全5班',
    major: '网络安全',
    grade: '2022',
    school: '上海交通大学',
    status: 1,
    studentCount: 27,
    createTime: '2024-01-05T10:00:00'
  },
  {
    id: '6',
    name: '物联网6班',
    major: '物联网工程',
    grade: '2021',
    school: '南京大学',
    status: 0,
    studentCount: 29,
    createTime: '2024-01-06T10:00:00'
  },
  {
    id: '7',
    name: '人工智能7班',
    major: '人工智能',
    grade: '2023',
    school: '复旦大学',
    status: 1,
    studentCount: 31,
    createTime: '2024-01-07T10:00:00'
  },
  {
    id: '8',
    name: '软件工程8班',
    major: '软件工程',
    grade: '2022',
    school: '同济大学',
    status: 1,
    studentCount: 26,
    createTime: '2024-01-08T10:00:00'
  },
  {
    id: '9',
    name: '大数据9班',
    major: '大数据技术',
    grade: '2021',
    school: '中国科学技术大学',
    status: 0,
    studentCount: 33,
    createTime: '2024-01-09T10:00:00'
  },
  {
    id: '10',
    name: '网络安全10班',
    major: '网络安全',
    grade: '2023',
    school: '哈尔滨工业大学',
    status: 1,
    studentCount: 25,
    createTime: '2024-01-10T10:00:00'
  }
];

export const handlers = [
  // 添加登录接口的模拟
  http.post(`${API_PREFIX}/:identity/login`, async ({ params, request }) => {
    const { identity } = params;
    const requestBody = await request.json() as LoginRequestParams;
    
    console.log(`MSW: 拦截到${identity}登录请求`, requestBody);

    // 简单的凭证验证
    const validCredentials: Record<string, {[key: string]: string}> = {
      student: { studentNumber: 'student123', password: '123456' },
      teacher: { teacherNumber: 'teacher123', password: '123456' },
      admin: { adminNumber: 'admin123', password: '123456' }
    };

    const identityCredential = `${identity}Number`;
    
    // 确保身份存在于有效凭证中
    if (!validCredentials[identity as string]) {
      return HttpResponse.json({
        code: 400,
        message: '无效的身份类型',
        data: null
      });
    }
    
    const isValid = 
      requestBody[identityCredential] === validCredentials[identity as string][identityCredential] && 
      requestBody.password === validCredentials[identity as string].password;

    if (isValid) {
      return HttpResponse.json({
        code: 200,
        message: '登录成功',
        data: {
          token: `mock-token-${identity}-${Date.now()}`,
          [identity as string]: {
            id: `mock-${identity}-id-123`,
            name: `测试${identity === 'student' ? '学生' : (identity === 'teacher' ? '教师' : '管理员')}`,
            [identityCredential]: requestBody[identityCredential]
          }
        }
      });
    } else {
      return HttpResponse.json({
        code: 401,
        message: '用户名或密码错误',
        data: null
      }, { status: 200 }); // 返回HTTP 200但业务状态码为401
    }
  }),

  // 添加获取教师信息的模拟
  http.get(`${API_PREFIX}/teacher/:teacherId`, ({ params }) => {
    const { teacherId } = params;
    
    console.log(`MSW: 拦截到获取教师信息请求，教师ID:${teacherId}`);

    const teacherInfo = {
      id: teacherId,
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
      permissions: ["READ_PROFILE", "UPDATE_PROFILE", "READ_COURSES", "MANAGE_COURSES", "MANAGE_GRADES", "VIEW_GRADES"]
    };

    return HttpResponse.json({
      code: 200,
      message: "获取教师信息成功",
      data: teacherInfo
    });
  }),

  // 添加获取学生信息的模拟
  http.get(`${API_PREFIX}/student/:studentId`, ({ params }) => {
    const { studentId } = params;
    
    console.log(`MSW: 拦截到获取学生信息请求，学生ID:${studentId}`);

    // 模拟学生信息
    const studentInfo = {
      id: studentId,
      avatar: "https://pic.616pic.com/ys_bnew_img/00/42/51/nLWA3fYywP.jpg",
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

    return HttpResponse.json({
      code: 200,
      message: "获取学生信息成功",
      data: studentInfo
    });
  }),

  // 添加更新教师信息的模拟
  http.put(`${API_PREFIX}/teacher/update`, async ({ request }) => {
    const updatedFields = await request.json() as Record<string, any>;
    
    console.log(`MSW: 拦截到更新教师信息请求`, updatedFields);

    // 模拟成功响应，将所有字段合并到默认数据中
    const defaultTeacherInfo = {
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
      updateTime: new Date().toISOString()
    };

    return HttpResponse.json({
      code: 200,
      message: "更新教师信息成功",
      data: {
        ...defaultTeacherInfo,
        ...updatedFields,
        updateTime: new Date().toISOString()
      }
    });
  }),

  // 添加更新学生信息的模拟
  http.put(`${API_PREFIX}/student/update`, async ({ request }) => {
    const updatedFields = await request.json() as Record<string, any>;
    
    console.log(`MSW: 拦截到更新学生信息请求`, updatedFields);

    return HttpResponse.json({
      code: 200,
      message: "更新学生信息成功",
      data: {
        ...updatedFields,
        updateTime: new Date().toISOString()
      }
    });
  }),

  // Mock for the streaming chat endpoint
  http.post(`${API_PREFIX}/ai/common/chat`, async ({ request }) => {
    const formData = await request.formData();
    const message = formData.get('message');
    const memoryId = formData.get('memoryId') || '0';
    
    console.log('MSW: 接收到聊天请求', { message, memoryId });

    //判断继续对话
    if (memoryId !== '0') {
        console.log('MSW: 继续对话');
    } else {
        console.log('MSW: 新对话');
    }

    
    // 创建真实的SSE流
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // 使用正确的SSE格式: 每条消息以data:开头，后跟一个空格，然后是消息内容，最后是两个换行符
        controller.enqueue(encoder.encode(`data: [MEMORY_ID:msw-mock-memory-id-54321]\n\n`));
        await new Promise((r) => setTimeout(r, 100));
        
        controller.enqueue(encoder.encode(`data: [TITLE:关于"${message}"的对话]\n\n`));
        await new Promise((r) => setTimeout(r, 100));
        
        controller.enqueue(encoder.encode(`data: [AiMessageStart]\n\n`));
        await new Promise((r) => setTimeout(r, 300));

        // 模拟AI回复，一个字符一个字符地发送
        const reply = '你好！我是智慧通"' + message + '"的问题。\n\n';
        
        for (const char of reply) {
          controller.enqueue(encoder.encode(`data: ${char}\n\n`));
          await new Promise((r) => setTimeout(r, 50)); // 模拟打字速度
        }
        
        controller.close();
      },
    });

    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      },
    });
  }),

  // Mock for the conversation creation endpoint
  http.post(`${API_PREFIX}/ai/conversation/create`, async ({ request }) => {
    // 我们可以读取请求体来使模拟更动态
    const params = await request.json() as CreateConversationParams;

    console.log('MSW: 模拟创建会话，参数:', params);

    return HttpResponse.json({
        code: 200,
        message: '创建成功',
        data: {
          id: 'msw-mock-convo-id-' + Date.now(),
          title: params.title,
          modelName: params.modelName || 'gpt-3.5-turbo',
          messageCount: 2,
          tags: params.tags || ["AI", "对话"],
          memoryId: params.memoryId,
          enableRag: params.enableRag || false,
          courseId: params.courseId || null,
          courseName: params.courseId ? "模拟课程" : null,
          creatorName: "测试用户",
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
    });
  }),
  
  // 添加批量创建消息的模拟接口
  http.post(`${API_PREFIX}/ai/message/batch-create`, async ({ request }) => {
    const body = await request.json() as BatchCreateMessagesParams;
    
    console.log('MSW: 模拟批量创建消息，参数:', body);
    
    const { conversationId, messages } = body;
    
    return HttpResponse.json({
      code: 200,
      message: "批量创建完成",
      data: {
        totalCount: messages.length,
        successCount: messages.length,
        failureCount: 0,
        createdMessages: messages.map((msg, index: number) => ({
          id: Date.now() + index,
          conversationId,
          messageType: msg.messageType,
          content: msg.content,
          sequence: msg.sequence,
          createTime: new Date().toISOString()
        }))
      }
    });
  }),

  // Mock for fetching user conversation history with pagination
  http.get(`${API_PREFIX}/ai/conversation/user/:userId`, ({ request, params }) => {
    const { userId } = params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);

    console.log(`MSW: 拦截到获取用户 ${userId} 的会话历史请求`, { page, pageSize });

    // Generate a list of mock conversations
    const totalConversations = 123; // Total number of items
    const allConversations = Array.from({ length: totalConversations }, (_, i) => {
      const id = i + 1;
      const titles = [
        'Vue 3 Composition API 深度解析', '如何使用Pinia进行状态管理', 'Vite与Webpack的性能对比',
        'Element Plus 自定义主题', 'TypeScript在Vue项目中的最佳实践', '深入理解React Hooks',
        '现代CSS布局技巧', 'Node.js后端开发入门', 'Python数据分析与可视化', 'RESTful API设计规范'
      ];
      const courses = ['Java程序设计', 'Web前端开发', '数据库系统', '计算机网络', null];
      const tags = ['Vue', 'React', 'Node.js', 'Java', 'Python', '性能优化', 'UI设计'];
      const courseName = courses[i % courses.length];
      const createTime = new Date(Date.now() - i * 24 * 3600 * 1000).toISOString();
      
      return {
        id,
        title: `${titles[i % titles.length]} #${id}`,
        modelName: id % 2 === 0 ? 'gpt-3.5-turbo' : 'gpt-4',
        messageCount: Math.floor(Math.random() * 50) + 2,
        tags: `${tags[i % tags.length]},${tags[(i + 1) % tags.length]}`,
        memoryId: `msw-mem-id-${id}`,
        enableRag: i % 3 === 0,
        courseId: courseName ? (i % 4) + 1 : null,
        courseName,
        createBy: id,
        createByName: `模拟用户${(i % 5) + 1}`,
        createTime,
        updateTime: createTime
      };
    });

    // Paginate the results
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const records = allConversations.slice(start, end);
    
    return HttpResponse.json({
      code: 200,
      message: "查询成功 (MSW)",
      data: {
        records,
        total: totalConversations,
        size: pageSize,
        current: page,
        pages: Math.ceil(totalConversations / pageSize),
      },
    });
  }),

  // Mock for fetching all ordered messages for a conversation
  // Corresponds to API Spec 3.5: GET /api/ai/message/conversation/{conversationId}/ordered
  http.get(`${API_PREFIX}/ai/message/conversation/:conversationId/ordered`, ({ params }) => {
    const { conversationId } = params;

    console.log(`MSW: 拦截到获取会话 ${conversationId} 的完整消息列表请求`);

    // Generate a list of mock messages for this conversation
    const mockMessages = [
      {
        id: 101,
        conversationId: conversationId,
        messageType: 0, // 0 for user
        messageTypeDesc: "用户消息",
        content: "你好，这个会话是从历史记录加载的吗？",
        sequence: 1,
        createBy: 1,
        createByName: "测试用户",
        createTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        updateTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: 102,
        conversationId: conversationId,
        messageType: 1, // 1 for AI
        messageTypeDesc: "AI消息",
        content: "是的，我是由MSW模拟接口返回的一段历史消息。这证明获取历史消息的API调用已经成功了。",
        sequence: 2,
        createBy: null,
        createByName: "AI助手",
        createTime: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        updateTime: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      },
      {
        id: 103,
        conversationId: conversationId,
        messageType: 0,
        messageTypeDesc: "用户消息",
        content: "太好了！这样我们就可以继续之前的对话了。",
        sequence: 3,
        createBy: 1,
        createByName: "测试用户",
        createTime: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        updateTime: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      },
    ];

    return HttpResponse.json({
      code: 200,
      message: `获取会话 ${conversationId} 历史成功 (MSW)`,
      data: mockMessages,
    });
  }),

  // ==================== 课程管理模拟 ====================

  // Mock for creating a new course
  // Corresponds to API Spec: POST /course/create
  http.post(`${API_PREFIX}/course/create`, async ({ request }) => {
    const courseData = await request.json() as Record<string, any>;
    
    console.log('MSW: 拦截到创建课程请求', courseData);

    if (!courseData.name || !courseData.courseCode || !courseData.teacherId) {
      return HttpResponse.json({
        code: 400,
        message: '课程名称、代码和教师ID是必填项',
        data: null
      }, { status: 200 }); // 返回HTTP 200但业务码为400
    }

    const statusDescMap = ["草稿", "已发布", "进行中", "已结束", "已取消"];
    const newCourse = {
      id: Date.now(),
      courseCode: courseData.courseCode,
      name: courseData.name,
      description: courseData.description || "暂无描述",
      cover: courseData.cover || `https://source.unsplash.com/random/400x225?course,${courseData.name}`,
      school: courseData.school,
      major: courseData.major,
      grade: courseData.grade,
      status: courseData.status,
      statusDesc: statusDescMap[courseData.status] || "未知",
      tags: courseData.tags || "",
      startTime: courseData.startTime,
      endTime: courseData.endTime,
      teacherId: courseData.teacherId,
      teacherName: courseData.teacherName,
      credits: courseData.credits,
      hours: courseData.hours,
      capacity: courseData.capacity,
      enrolledCount: 0,
      createTime: new Date().toISOString()
    };
    
    mockCoursesDb.unshift(newCourse);

    return HttpResponse.json({
      code: 200,
      message: '课程创建成功 (MSW)',
      data: newCourse
    });
  }),

  // Mock for fetching a teacher's courses with pagination
  // API Spec: POST /course/query
  http.post(`${API_PREFIX}/course/query`, async ({ request }) => {
    const body:any = await request.json();
    const { teacherId, page = 1, pageSize = 10 } = body;

    console.log(`MSW: 拦截到获取教师 ${teacherId} 的课程列表请求 (POST)`, { page, pageSize });

    if (!teacherId) {
      return HttpResponse.json({ 
        code: 400, 
        message: '无效的教师ID',
        data: null
      }, { status: 200 });
    }

    const teacherCourses = mockCoursesDb.filter(c => c.teacherId.toString() === teacherId.toString());
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const records = teacherCourses.slice(start, end);
    
    return HttpResponse.json({
      code: 200,
      message: "查询成功 (MSW)",
      data: {
        records,
        total: teacherCourses.length,
        size: pageSize,
        current: page,
        pages: Math.ceil(teacherCourses.length / pageSize),
      },
    });
  }),

  // Mock for fetching single course details
  // Corresponds to API Spec 1.2: GET /course/{id}
  http.get(`${API_PREFIX}/course/:id`, ({ params }) => {
    const { id } = params;
    console.log(`MSW: 拦截到获取课程详情请求, 课程ID: ${id}`);
    
    const course = mockCoursesDb.find(c => c.id.toString() === id);

    if (course) {
      return HttpResponse.json({
        code: 200,
        message: "获取课程详情成功 (MSW)",
        data: course
      });
    } else {
      return HttpResponse.json({
        code: 404,
        message: `课程ID ${id} 未找到 (MSW)`,
        data: null
      }, { status: 200 }); // 返回业务失败码
    }
  }),

  // Mock for file upload
  http.post(`${API_PREFIX}/files/upload`, async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('MSW: 拦截到文件上传请求', file);

    if (!file) {
      return HttpResponse.json({
        code: 400,
        message: '没有找到上传的文件 (MSW)',
        data: null
      });
    }

    if (file.size > 2 * 1024 * 1024) {
      return HttpResponse.json({
        code: 413,
        message: '文件大小超过2MB限制 (MSW)',
        data: null
      });
    }

    const fileId = `mock_file_${Date.now()}`;
    const fileExtension = file.name.split('.').pop() || 'jpg';

    return HttpResponse.json({
      code: 200,
      message: "操作成功 (MSW)",
      data: {
        originalFileName: file.name,
        fileName: `${fileId}.${fileExtension}`,
        fileSize: file.size,
        contentType: file.type,
        fileUrl: `/uploads/images/mock/${fileId}.${fileExtension}`,
        uploadTime: Date.now()
      }
    });
  }),

  // 创建班级接口
  http.post(`${API_PREFIX}/class/create`, async ({ request }) => {
    const classData = await request.json() as Record<string, any>;
    console.log('MSW: 拦截到创建班级请求', classData);

    if (!classData.name || !classData.major || !classData.grade || !classData.school) {
      return HttpResponse.json({
        code: 400,
        message: '班级名称、专业、年级、学校为必填项',
        data: null
      }, { status: 200 });
    }

    const newClass = {
      id: Date.now().toString(),
      name: classData.name,
      major: classData.major,
      grade: classData.grade,
      school: classData.school,
      status: 1,
      studentCount: 0,
      createTime: new Date().toISOString()
    };
    mockClassesDb.unshift(newClass);

    return HttpResponse.json({
      code: 200,
      message: '班级创建成功 (MSW)',
      data: newClass
    });
  }),
  // 班级分页查询接口
  http.post(`${API_PREFIX}/class/query`, async ({ request }) => {
    let body: any = await request.json();
    if (typeof body !== 'object' || body === null) body = {};
    let filtered = mockClassesDb.slice();
    // 简单条件筛选
    if (body.name) filtered = filtered.filter(c => c.name && c.name.includes(body.name));
    if (body.major) filtered = filtered.filter(c => c.major && c.major.includes(body.major));
    if (body.grade) filtered = filtered.filter(c => c.grade && c.grade.includes(body.grade));
    if (body.school) filtered = filtered.filter(c => c.school && c.school.includes(body.school));
    if (typeof body.status === 'number') filtered = filtered.filter(c => c.status === body.status);
    if (typeof body.studentCount === 'number') filtered = filtered.filter(c => c.studentCount === body.studentCount);
    // 排序
    if (body.sortBy) {
      filtered = filtered.sort((a, b) => {
        const dir = body.sortDir === 'asc' ? 1 : -1;
        const key = body.sortBy as keyof typeof a;
        if (a[key] < b[key]) return -1 * dir;
        if (a[key] > b[key]) return 1 * dir;
        return 0;
      });
    }
    // 分页
    const pageNum = body.pageNum || 1;
    const pageSize = body.pageSize || 10;
    const start = (pageNum - 1) * pageSize;
    const end = start + pageSize;
    const records = filtered.slice(start, end);
    return HttpResponse.json({
      code: 200,
      message: '查询成功',
      data: {
        records,
        total: filtered.length,
        size: pageSize,
        current: pageNum,
        pages: Math.ceil(filtered.length / pageSize)
      }
    });
  }),

  // 班级详情接口
  http.post(`${API_PREFIX}/class/ClassInfoById/:id`, ({ params }) => {
    const { id } = params;
    
    console.log(`MSW: 拦截到获取班级详情请求，班级ID: ${id}`);
    
    // 查找班级基本信息
    const classInfo = mockClassesDb.find(c => c.id === id);
    
    if (!classInfo) {
      return HttpResponse.json({
        code: 404,
        message: '班级不存在',
        data: null
      }, { status: 200 }); // 保持HTTP 200但返回业务错误
    }
    
    // 模拟班级的学生数据
    const students = Array.from({ length: classInfo.studentCount }, (_, i) => {
      const idNum = 10000 + i;
      return {
        id: idNum,
        realname: `学生${i+1}`,
        studentNumber: `${classInfo.grade}${idNum.toString().substring(1)}`,
        avatar: '' // 空字符串表示使用默认头像
      };
    });
    
    // 返回完整的班级信息
    return HttpResponse.json({
      code: 200,
      message: '获取班级详情成功',
      data: {
        baseInfo: {
          ...classInfo,
          createBy: '1944305208522986700', // 创建者ID，可以根据需要修改
          updateTime: classInfo.createTime // 使用创建时间作为更新时间
        },
        students: students
      },
      timestamp: Date.now()
    });
  }),

  // 根据学生ID查询其加入的班级列表
  http.get(`${API_PREFIX}/studentClass/queryByStudentId/:studentId`, ({ params }) => {
    const { studentId } = params;
    console.log(`MSW: 拦截到根据学生ID ${studentId} 查询班级列表请求`);

    // 模拟返回该学生已加入的班级列表 (取前5个作为示例)
    const studentClasses = mockClassesDb.slice(0, 5).map(cls => ({
      ...cls,
      grade: `${cls.grade}级`, // 确保和文档格式一致
      createBy: `mock-creator-for-student-${studentId}`,
      updateTime: cls.createTime, 
    }));

    return HttpResponse.json({
      code: 200, // 与axios.ts中的逻辑保持一致
      message: "查询成功 (MSW)",
      data: studentClasses,
      timestamp: Date.now()
    });
  }),
]; 