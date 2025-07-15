import { defineStore } from 'pinia'

/**
 * AI会话的核心元数据结构
 * 这个Store只负责存储最终创建成功的会话信息
 */
interface AIChatSessionState {
    conversationId: number | null;
    memoryId: string | null;
    title: string | null;
}

export const useAIChatStore = defineStore('AIChat', {
    state: (): AIChatSessionState => ({
        conversationId: null,
        memoryId: null,
        title: null,
    }),
    actions: {
        /**
         * 在会话成功创建后，保存其核心信息
         */
        setConversationDetails(details: { conversationId: number, memoryId: string, title: string }) {
            this.conversationId = details.conversationId;
            this.memoryId = details.memoryId;
            this.title = details.title;
        },

        /**
         * 清空会话元数据
         */
        clearSession() {
            this.conversationId = null;
            this.memoryId = null;
            this.title = null;
        },

        getConversationId() {
            return this.conversationId;
        },

        setConversationId(conversationId: number) {
            this.conversationId = conversationId;
        }
    }
})