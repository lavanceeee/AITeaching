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
使用示例：
- 学生登录成功：studentNumber=student123, password=123456
- 教师登录成功：teacherNumber=teacher123, password=123456
- 管理员登录成功：adminNumber=admin123, password=123456
- 任何其他组合将返回登录失败
*/

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
] 