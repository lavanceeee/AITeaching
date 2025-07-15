<template>
  <div class="ai-guide">
    <!-- 悬浮功能栏 -->
    <div class="floating-header" ref="floatingHeaderRef">
      <div class="header-hover-bg" ref="hoverBgRef"></div>

      <button class="header-button" @click="createNewSession">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
          <path fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 11h3v-2h-3V8h-2v3H8v2h3v3h2v-3z" />
        </svg>
        <span>新建会话</span>
      </button>

      <button class="header-button" @click="openHistoryDialog">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
          <path fill="currentColor"
            d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8zm.5-13H11v6l5.25 3.15l.75-1.23l-4.5-2.67z" />
        </svg>
        <span>对话历史</span>
      </button>

      <button class="header-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
          <path fill="currentColor"
            d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z" />
        </svg>
        <span>历史搜索</span>
      </button>

      <button class="header-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
          <path fill="currentColor"
            d="M12 2.5l1.5 3.5l3.5 1.5l-3.5 1.5l-1.5 3.5l-1.5-3.5l-3.5-1.5l3.5-1.5L12 2.5zM6 9.5l1 2l2 1l-2 1l-1 2l-1-2l-2-1l2-1l1-2zm12 6l1 2l2 1l-2 1l-1 2l-1-2l-2-1l2-1l1-2z" />
        </svg>
        <span>专业模式</span>
      </button>
    </div>

    <div class="chat-container">
      <transition name="fade">
        <div v-if="messages.length === 0" class="welcome-message">
          <h2>您的智慧AI教师，欢迎提问</h2>
          <p>我可以回答您关于学习方面的任何问题</p>
        </div>
      </transition>

      <transition-group name="message-pop" tag="div" class="messages-list">
        <div v-for="message in messages" :key="message.id" :class="['message-item', `message-${message.sender}`]">
          <div class="message-bubble">
            <span class="message-text">{{ message.text }}</span>
          </div>
          <el-avatar v-if="message.sender === 'user' && userInfo" :src="userInfo.avatar" :size="36" />
        </div>
      </transition-group>
    </div>

    <div class="input-panel">

      <div class="model-selector">
        <el-dropdown @command="handleModelChange" trigger="click">
          <button class="model-button">
            <span>{{ selectedModelLabel }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor" d="M7 10l5 5 5-5H7z" />
            </svg>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="model in models" :key="model.value" :command="model.value">
                {{ model.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div class="input-container">
        <textarea class="chat-input" placeholder="输入您的问题..." rows="1" v-model="userInput"
          @keydown.enter.prevent="sendMessage"></textarea>

        <div class="input-actions">
          <button class="action-button upload-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
            </svg>
          </button>

          <!-- 发送消息Button -->
          <button class="send-button" @click="sendMessage">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>

      <div class="bottom-note">智慧通AI仅供学习参考，请勿用于不当用途</div>
    </div>

    <ChatHistory v-model="isHistoryDialogVisible" @select-conversation="handleSelectConversation" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { useStudentInfoStore } from "../../../store/studentInfoStore";
import { useAIChatStore } from "../../../store/AIChatStore";
import { 
  streamChat_method, 
  createConversation_method, 
  batchCreateMessages_method,
  getConversationMessages_method
} from "../../../api/axios";
import { createParser } from 'eventsource-parser';
import ChatHistory from '../../../components/commonCom/ChatHistory.vue';
import { batchSend } from "../../../utils/batchsend";
const messageQueue = ref([]);

// --- Stores ---
const studentStore = useStudentInfoStore();
const userInfo = computed(() => studentStore.userInfo);
// AI Store仅用于会话成功后保存元数据
const aiChatStore = useAIChatStore();

// --- 本地核心状态，不再依赖Pinia管理实时消息 ---
const messages = ref([]);
const isReceiving = ref(false);
const memoryId = ref(null);
const userInput = ref('');


const floatingHeaderRef = ref(null);
const hoverBgRef = ref(null);

// History Dialog State
const isHistoryDialogVisible = ref(false);

// Model Selection
const selectedModel = ref('tecent-yuanbao');
const models = ref([
  { value: 'tecent-yuanbao', label: '元宝大模型' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
]);
const selectedModelLabel = computed(() => {
  const model = models.value.find(m => m.value === selectedModel.value);
  return model ? model.label : '';
});
const handleModelChange = (command) => {
  selectedModel.value = command;
};

// --- 核心功能实现 ---

/**
 * 打开历史记录弹窗
 */
const openHistoryDialog = () => {
  isHistoryDialogVisible.value = true;
  batchSend(messageQueue.value);
  // 清空消息队列
  messageQueue.value = [];
};

/**
 * 从历史记录中选择一个会话并加载其内容
 * @param {object} conversation - 包含id, title等信息的会话对象
 */
const handleSelectConversation = async (conversation) => {
  console.log("即将加载会话:", conversation);

  try {
    // 1. 调用API获取该会话的完整消息列表
    const historyMessages = await getConversationMessages_method(conversation.id);

    if (historyMessages && historyMessages.length > 0) {
      // 2. 将API返回的数据 `map` 成UI需要的格式
      messages.value = historyMessages.map(msg => ({
        id: msg.id,
        // 根据 messageType 判断发送者
        sender: msg.messageType === 0 ? 'user' : 'ai',
        // role 也同样判断
        role: msg.messageType === 0 ? 'user' : 'ai',
        // text 直接使用 content
        text: msg.content,
      }));

      // (可选) 更新全局store和本地状态
      aiChatStore.setConversationDetails(conversation);
      memoryId.value = conversation.memoryId;

    } else {
      // 如果没有历史消息，给一个提示
      messages.value = [{
        id: Date.now(),
        sender: 'ai',
        role: 'ai',
        text: `会话 "${conversation.title}" 已加载，但没有历史消息。`,
      }];
    }
  } catch (error) {
    console.error("加载历史消息失败:", error);
    // 可以在这里用 ElMessage 提示用户
  }
};


/**
 * 新建会话：清空本地所有状态，并通知全局Store
 */
const createNewSession = () => {

  //先保存
  batchSend(messageQueue.value);
  // 清空消息队列
  messageQueue.value = [];


  messages.value = [];
  memoryId.value = null;
  isReceiving.value = false;
  aiChatStore.clearSession(); // 同步清空全局状态
};

/**
 * 使用 eventsource-parser 处理流式响应
 */
const processStream = async (stream) => {
  let aiMessageAccumulator = '';
  let tempMemoryId = '';
  let tempTitle = '';
  let aiMessageId = null; // 用于追踪当前正在接收的AI消息气泡ID

  const onParse = (event) => {
    const data = event.data;
    if (data === undefined || data === '[DONE]') {
      // 忽略没有数据或结束标记的事件
      return;
    }

    // 1. 处理元数据（仅限新对话），然后跳过
    if (data.startsWith('[MEMORY_ID:')) {
      const match = data.match(/\[MEMORY_ID:(.*?)\]/);
      if (match) tempMemoryId = match[1];
      return;
    }
    if (data.startsWith('[TITLE:')) {
      const match = data.match(/\[TITLE:(.*?)\]/);
      if (match) tempTitle = match[1];
      return;
    }

    // 2. 忽略 [AiMessageStart] 标记本身，它只是一个开始信号
    if (data === '[AiMessageStart]') {
      return;
    }

    // 3. 收到第一个有效文本块时，创建AI消息气泡。
    //    此逻辑对新对话和继续对话都通用。
    if (aiMessageId === null) {
      aiMessageId = Date.now();
      messages.value.push({
        id: aiMessageId,
        sender: 'ai',
        role: 'ai',
        text: '' // 初始为空
      });
    }

    // 4. 将文本块追加到已创建的气泡中
    const msg = messages.value.find(m => m.id === aiMessageId);
    if (msg) {
      msg.text += data;
      aiMessageAccumulator += data;
    } else {
      console.error("Fatal: AI message bubble not found after creation.");
    }
  };

  // 根据最新的库版本，我们必须传递一个回调对象
  const parser = createParser({
    onEvent: onParse,
    onError: (err) => console.error('SSE Parser Error:', err),
  });

  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8');

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      parser.feed(chunk); // 将数据块喂给解析器
    }
  } finally {
    //将AI消息加到消息队列
    console.log("AI消息:", aiMessageAccumulator);
    messageQueue.value.push({
      messageType: '1',
      content: aiMessageAccumulator
    });
  
    reader.releaseLock();
    parser.reset(); // 清理并重置解析器状态
  }

  // 流结束后，如果是新会话，则创建会话记录
  if (tempMemoryId && tempTitle && !memoryId.value) {
    memoryId.value = tempMemoryId; // 更新本地 memoryId
    try {
        const params = {
          title: tempTitle,
          memoryId: tempMemoryId,
          modelName: selectedModel.value,
          enableRag: false,
          courseId: null,
        };
        const response = await createConversation_method(params);
        if (response.data.code === 200) {
          // Save the successful conversation info to the global store
          aiChatStore.setConversationDetails({
            conversationId: response.data.data.id,
            memoryId: tempMemoryId,
            title: tempTitle,
          });
        }
      } catch (error) {
        console.error("创建会话失败:", error);
      }
    }
};


/**
 * 发送消息总入口
 */
const sendMessage = async () => {
  if (isReceiving.value) return;

  const text = userInput.value.trim();
  if (!text) return;

  //添加到消息队列
  messageQueue.value.push({
    messageType: '0',
    content: text
  });

  isReceiving.value = true;
  messages.value.push({
    id: Date.now(),
    sender: "user", // sender 属性用于CSS样式区分
    role: "user",    // role 属性用于逻辑判断
    text: text,
  });
  userInput.value = "";

  try {
    const response = await streamChat_method({
      message: text,
      memoryId: memoryId.value,
    });

    if (response.body) {
      await processStream(response.body);
    } else {
      throw new Error("响应体为空");
    }
  } catch (error) {
    console.error("流式请求失败:", error);
    messages.value.push({
      id: Date.now(),
      sender: 'ai',
      role: 'ai',
      text: '网络错误，请稍后再试。'
    });
  } finally {
    isReceiving.value = false;
  }
};

onMounted(() => {
  const header = floatingHeaderRef.value;
  const hoverBg = hoverBgRef.value;
  if (!header || !hoverBg) return;

  const buttons = header.querySelectorAll(".header-button");

  buttons.forEach((button) => {
    button.addEventListener("mouseenter", (e) => {
      const { offsetLeft, offsetWidth } = e.currentTarget;
      hoverBg.style.left = `${offsetLeft}px`;
      hoverBg.style.width = `${offsetWidth}px`;
      hoverBg.style.opacity = "1";
    });
  });

  header.addEventListener("mouseleave", () => {
    hoverBg.style.opacity = "0";
  });
});

onBeforeUnmount(() => {
  //组件卸载前发送消息队列
  batchSend(messageQueue.value);
}
);

//点击四个按钮时也执行
const handleButtonClick = () => {
  batchSend(messageQueue.value);
}
</script>

<style scoped>
.ai-guide {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  background-color: #f9f9f9;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 100px 2rem 2rem 2rem;
  /* 增加顶部内边距，防止被header遮挡 */
  display: flex;
  flex-direction: column;
}

.welcome-message {
  text-align: center;
  max-width: 600px;
  padding: 2rem;
  margin: auto;
}

.welcome-message h2 {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.welcome-message p {
  color: #666;
  font-size: 1.1rem;
}

.messages-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: auto;
}

.message-item {
  display: flex;
  max-width: 70%;
  align-items: flex-end;
  gap: 10px;
}

.message-user {
  align-self: flex-end;
}

.message-ai {
  align-self: flex-start;
}

.message-bubble {
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.message-user .message-bubble {
  background: linear-gradient(135deg, #5b9dff, #4096ff);
  color: white;
  border-radius: 20px 20px 4px 20px;
  box-shadow: 0 3px 12px rgba(64, 150, 255, 0.25);
}

.message-ai .message-bubble {
  background: white;
  color: #333;
  border-radius: 20px 20px 20px 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #eee;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.message-pop-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.message-pop-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

/* 新增悬浮栏样式 */
.floating-header {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  /* max-width: 800px; */
  padding: 12px 20px;

  background: rgba(224, 242, 242, 0.308);
  -webkit-backdrop-filter: blur(22px) saturate(150%);
  backdrop-filter: blur(22px) saturate(150%);

  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);

  display: flex;
  align-items: center;
  justify-content: center;
  /* 从左侧开始排列  flex-start*/
  gap: 20px;
  z-index: 10;
  position: relative;
  /* Added for containing the hover background */
}

.header-hover-bg {
  position: absolute;
  top: 10px;
  /* Adjust to vertically center */
  height: calc(100% - 20px);
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  z-index: 1;
  /* Behind buttons */
}

.header-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  z-index: 2;
  /* In front of hover background */
  position: relative;
}

.header-button:hover {
  background-color: transparent;
  /* Remove old hover effect */
}

.header-button svg {
  width: 18px;
  height: 18px;
}

.input-panel {
  border-top: 1px solid #e6e6e6;
  padding: 1rem 1.5rem;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  border-radius: 15px;
}

.model-selector {
  display: flex;
  /* justify-content: center; */
  margin-bottom: 1rem;
}

.model-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: white;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.model-button:hover {
  border-color: #4096ff;
  box-shadow: 0 0 10px rgba(64, 150, 255, 0.2);
}

.input-container {
  display: flex;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.8rem;
  transition: border 0.2s;
  position: relative;
}

.input-container:focus-within {
  border-color: #4096ff;
  box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.1);
}

.chat-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  line-height: 1.5;
  resize: none;
  max-height: 150px;
  padding-right: 90px;
}

.input-actions {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: flex;
  gap: 0.5rem;
}

.action-button {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: #f3f3f3;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  background-color: #e6e6e6;
  color: #333;
}

.send-button {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: #4096ff;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.send-button:hover {
  background-color: #1677ff;
}

.bottom-note {
  text-align: center;
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.8rem;
}
</style>
