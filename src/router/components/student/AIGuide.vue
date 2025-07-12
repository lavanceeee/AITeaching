<template>
    <div class="ai-guide">
        <div class="chat-container">
            <div class="welcome-message">
                <h2>您的智慧AI教师，欢迎提问</h2>
                <p>我可以回答您关于学习方面的任何问题</p>
            </div>
        </div>
        
        <div class="input-panel">

            <div class="model-selector">
                <button class="model-button">
                    <span>元宝大模型</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M7 10l5 5 5-5H7z"/>
                    </svg>
                </button>
            </div>
            
            <div class="input-container">
                <textarea 
                    class="chat-input" 
                    placeholder="输入您的问题..." 
                    rows="1"
                ></textarea>
                
                <div class="input-actions">
                    <button class="action-button upload-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                        </svg>
                    </button>
                    
                    <button class="send-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="bottom-note">
                智慧通AI仅供学习参考，请勿用于不当用途
            </div>
        </div>
    </div>
</template>

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
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.welcome-message {
    text-align: center;
    max-width: 600px;
    padding: 2rem;
}

.ai-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background-color: #eaf4ff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
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

