import { defineStore } from 'pinia'

/**
 * 单条聊天消息的结构
 */
export interface ChatMessage {
    id: number;
    role: 'user' | 'ai';
    text: string;
}

/**
 * 整个AI聊天会话的状态结构
 */
interface AIChatState {
    conversationId: number | null;
    memoryId: string | null;
    title: string | null;
    messages: ChatMessage[];
    isReceiving: boolean; // 是否正在等待AI回复
}

export const useAIChatStore = defineStore('AIChat', {
    state: (): AIChatState => ({
        conversationId: null,
        memoryId: null,
        title: null,
        messages: [],
        isReceiving: false,
    }),
    actions: {
        /**
         * 添加一条完整的消息到消息列表
         * @param message 消息对象
         */
        addMessage(message: ChatMessage) {
            this.messages.push(message)
        },

        /**
         * 向最新的AI消息追加文本块，实现打字机效果
         * 如果不存在AI消息，则会创建一个
         * @param textChunk AI返回的文本片段
         */
        appendAiMessageChunk(textChunk: string) {
            const lastMessage = this.messages[this.messages.length - 1];
            if (lastMessage && lastMessage.role === 'ai') {
                lastMessage.text += textChunk;
            } else {
                // 如果没有上一条AI消息（理论上应该有空占位符），则创建一个新的
                this.addMessage({ id: Date.now(), role: 'ai', text: textChunk });
            }
        },
        
        /**
         * 在新会话创建成功后，设置会话的元数据
         * @param details 包含会话ID、记忆ID和标题的对象
         */
        setConversationDetails(details: { conversationId: number, memoryId: string, title: string }) {
            this.conversationId = details.conversationId;
            this.memoryId = details.memoryId;
            this.title = details.title;
        },

        /**
         * 设置是否正在接收AI消息的状态
         * @param status 状态
         */
        setReceiving(status: boolean) {
            this.isReceiving = status;
        },

        /**
         * 清空当前会话状态，用于开始新会话
         */
        clearSession() {
            this.conversationId = null;
            this.memoryId = null;
            this.title = null;
            this.messages = [];
            this.isReceiving = false;
        }
    }
})