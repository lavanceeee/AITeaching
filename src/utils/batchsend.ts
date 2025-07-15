import { batchCreateMessages_method } from "../api/axios";
import { useAIChatStore } from "../store/AIChatStore";

export const batchSend = (messageQueue: any[]) => {
    const aiChatStore = useAIChatStore();
    const conversationId = aiChatStore.conversationId;

    if (messageQueue.length > 0 && conversationId) {
        const jsonData = {
          conversationId: conversationId,
          messages: messageQueue
        }
    
        batchCreateMessages_method(jsonData);
      }
}