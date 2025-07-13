<template>
    <div class="ai-guide">
        <!-- 悬浮功能栏 -->
        <div class="floating-header" ref="floatingHeaderRef">
            <div class="header-hover-bg" ref="hoverBgRef"></div>
            <button class="header-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8zm.5-13H11v6l5.25 3.15l.75-1.23l-4.5-2.67z"/></svg>
                <span>对话历史</span>
            </button>
            <button class="header-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"/></svg>
                <span>历史搜索</span>
            </button>
            <button class="header-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.5l1.5 3.5l3.5 1.5l-3.5 1.5l-1.5 3.5l-1.5-3.5l-3.5-1.5l3.5-1.5L12 2.5zM6 9.5l1 2l2 1l-2 1l-1 2l-1-2l-2-1l2-1l1-2zm12 6l1 2l2 1l-2 1l-1 2l-1-2l-2-1l2-1l1-2z"/></svg>
                <span>专业模式</span>
            </button>
        </div>

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

<script setup>
import { ref, onMounted } from 'vue';

const floatingHeaderRef = ref(null);
const hoverBgRef = ref(null);

onMounted(() => {
    const header = floatingHeaderRef.value;
    const hoverBg = hoverBgRef.value;
    if (!header || !hoverBg) return;

    const buttons = header.querySelectorAll('.header-button');

    buttons.forEach(button => {
        button.addEventListener('mouseenter', (e) => {
            const { offsetLeft, offsetWidth } = e.currentTarget;
            hoverBg.style.left = `${offsetLeft}px`;
            hoverBg.style.width = `${offsetWidth}px`;
            hoverBg.style.opacity = '1';
        });
    });

    header.addEventListener('mouseleave', () => {
        hoverBg.style.opacity = '0';
    });
});
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
    padding: 100px 2rem 2rem 2rem; /* 增加顶部内边距，防止被header遮挡 */
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

/* 新增悬浮栏样式 */
.floating-header {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 40%;
    max-width: 800px;
    padding: 12px 20px;
    
    /* Frosted glass effect */
    background: rgba(248, 249, 250, 0.6);
    -webkit-backdrop-filter: blur(18px);
    backdrop-filter: blur(18px);

    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.12);

    display: flex;
    align-items: center;
    justify-content: center; /* 从左侧开始排列  flex-start*/
    gap: 20px;
    z-index: 10;
    position: relative; /* Added for containing the hover background */
}

.header-hover-bg {
    position: absolute;
    top: 10px; /* Adjust to vertically center */
    height: calc(100% - 20px);
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    z-index: 1; /* Behind buttons */
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
    z-index: 2; /* In front of hover background */
    position: relative;
}

.header-button:hover {
    background-color: transparent; /* Remove old hover effect */
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

