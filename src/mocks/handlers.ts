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

export const handlers = [
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
        const reply = '你好！我是智慧通AI助手。很高兴为你解答关于"' + message + '"的问题。\n\n根据你的提问，我可以提供以下信息：\n\n1. 这是一个MSW模拟的流式响应\n2. 它模拟了真实后端的SSE格式\n3. 每个字符都是单独发送的，实现打字机效果';
        
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
] 