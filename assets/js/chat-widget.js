(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        tenantId: '69577f6f-5ba1-47ee-991a-e011be582d3e',
        tenantName: 'Emobile Specialist Hospital',
        apiKey: 'FIvfmdGVBYyMxCsRobt2ee0BQzIXxfbz1jg3XmQW3j6wRVF5GqT78ak7c8CBt8Pf',
        backendUrl: 'https://api.chatcraft.cc',
        chatServiceUrl: 'https://api.chatcraft.cc',
        widgetId: 'factorial-chat-69577f6f-5ba1-47ee-991a-e011be582d3e',
        colors: {
            primary: '#E31B23',
            secondary: '#00A3E0',
            accent: '#3EC15D',
            white: '#FFFFFF',
            gray: '#F5F5F5',
            darkGray: '#333333',
            lightGray: '#E0E0E0'
        },
        // Logo configuration
        logo: {
            type: 'initials',
            source: null,
            initials: 'ES',
            isCustom: false
        },
        // Customizable text
        hoverText: 'Chat with us!',
        welcomeMessage: 'Hello! How can I help you today?',
        chatWindowTitle: 'Hospital AI Support'
    };

    // Chat Widget Class
    class FactorialChatWidget {
        constructor() {
            this.isOpen = false;
            this.socket = null;
            this.messages = [];
            this.isConnected = false;
            this.chatContainer = null;
            this.messagesContainer = null;
            this.inputField = null;
            this.sessionId = null;
            this.feedbackSubmitted = new Set();

            this.init();
        }

        init() {
            this.injectCSS();
            this.createWidget();
            this.attachEventListeners();
        }

        injectCSS() {
            if (document.getElementById('factorial-chat-css')) return;

            const style = document.createElement('style');
            style.id = 'factorial-chat-css';
            style.textContent = this.getCSS();
            document.head.appendChild(style);
        }

        getCSS() {
            return `
                .factorial-chat-widget {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 999999;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                }
                
                .factorial-chat-button {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(45deg, ${CONFIG.colors.primary}, ${CONFIG.colors.secondary});
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(93, 62, 193, 0.3);
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                
                .factorial-chat-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(93, 62, 193, 0.4);
                }
                
                .factorial-chat-button-icon {
                    width: 24px;
                    height: 24px;
                    fill: ${CONFIG.colors.white};
                }
                
                .factorial-chat-button-logo {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    object-fit: cover;
                    object-position: center;
                }
                
                .factorial-chat-button-initials {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, ${CONFIG.colors.primary}, ${CONFIG.colors.secondary});
                    color: ${CONFIG.colors.white};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 14px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    transition: transform 0.3s ease;
                }
                
                .factorial-chat-button:hover .factorial-chat-button-initials {
                    transform: scale(1.1);
                }
                
                .factorial-chat-window {
                    position: fixed;
                    bottom: 100px;
                    right: 20px;
                    width: 380px;
                    height: 500px;
                    background: ${CONFIG.colors.white};
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    z-index: 999998;
                }
                
                .factorial-chat-window.open {
                    display: flex;
                    animation: slideUp 0.3s ease;
                }
                
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                .factorial-chat-header {
                    background: linear-gradient(135deg, ${CONFIG.colors.primary}, ${CONFIG.colors.secondary});
                    color: ${CONFIG.colors.white};
                    padding: 20px;
                    text-align: center;
                    position: relative;
                }
                
                .factorial-chat-close {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: none;
                    border: none;
                    color: ${CONFIG.colors.white};
                    font-size: 20px;
                    cursor: pointer;
                    opacity: 0.8;
                    transition: opacity 0.2s;
                }
                
                .factorial-chat-close:hover {
                    opacity: 1;
                }
                
                .factorial-chat-title {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0;
                }
                
                
                .factorial-chat-messages {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    background: ${CONFIG.colors.gray};
                }
                
                .factorial-chat-message {
                    margin-bottom: 15px;
                    display: flex;
                    align-items: flex-start;
                }
                
                .factorial-chat-message.user {
                    justify-content: flex-end;
                }
                
                .factorial-chat-message-content {
                    max-width: 70%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    font-size: 14px;
                    line-height: 1.4;
                }
                
                .factorial-chat-message.user .factorial-chat-message-content {
                    background: ${CONFIG.colors.primary};
                    color: ${CONFIG.colors.white};
                    border-bottom-right-radius: 4px;
                }
                
                .factorial-chat-message.bot .factorial-chat-message-content {
                    background: ${CONFIG.colors.white};
                    color: ${CONFIG.colors.darkGray};
                    border: 1px solid ${CONFIG.colors.lightGray};
                    border-bottom-left-radius: 4px;
                }
                
                .factorial-chat-input-container {
                    padding: 20px;
                    border-top: 1px solid ${CONFIG.colors.lightGray};
                    display: flex;
                    gap: 10px;
                }
                
                .factorial-chat-input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 1px solid ${CONFIG.colors.lightGray};
                    border-radius: 25px;
                    outline: none;
                    font-size: 14px;
                    transition: border-color 0.2s;
                }
                
                .factorial-chat-input:focus {
                    border-color: ${CONFIG.colors.primary};
                }
                
                .factorial-chat-send {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: ${CONFIG.colors.accent};
                    border: none;
                    color: ${CONFIG.colors.white};
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 0.2s;
                }
                
                .factorial-chat-send:hover {
                    background: #2ea049;
                }
                
                .factorial-chat-send:disabled {
                    background: ${CONFIG.colors.lightGray};
                    cursor: not-allowed;
                }

                .factorial-chat-choices {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 10px;
                    margin: 5px 0;
                }

                .factorial-chat-choice-button {
                    padding: 12px 20px;
                    background: ${CONFIG.colors.white};
                    border: 2px solid ${CONFIG.colors.primary};
                    color: ${CONFIG.colors.primary};
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s;
                    text-align: left;
                }

                .factorial-chat-choice-button:hover {
                    background: ${CONFIG.colors.primary};
                    color: ${CONFIG.colors.white};
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .factorial-chat-footer {
                    padding: 12px 20px;
                    background: ${CONFIG.colors.white};
                    border-top: 1px solid ${CONFIG.colors.lightGray};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-size: 12px;
                    color: ${CONFIG.colors.darkGray};
                }
                
                .factorial-chat-logo {
                    height: 20px;
                    width: auto;
                    transition: transform 0.2s ease;
                }

                .factorial-chat-logo-link {
                    display: inline-flex;
                    align-items: center;
                    text-decoration: none;
                    cursor: pointer;
                    transition: opacity 0.2s ease;
                }

                .factorial-chat-logo-link:hover {
                    opacity: 0.7;
                }

                .factorial-chat-logo-link:hover .factorial-chat-logo {
                    transform: scale(1.05);
                }

                .factorial-chat-logo-text {
                    font-weight: bold;
                    color: ${CONFIG.colors.primary};
                    margin-left: 4px;
                }
                
                .factorial-status-indicator {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: ${CONFIG.colors.accent};
                    border: 2px solid ${CONFIG.colors.white};
                }
                
                .factorial-status-indicator.disconnected {
                    background: #ff4444;
                }
                
                .factorial-typing-indicator {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 12px 16px;
                    color: ${CONFIG.colors.darkGray};
                    font-style: italic;
                    font-size: 13px;
                }
                
                .factorial-typing-dots {
                    display: flex;
                    gap: 2px;
                }
                
                .factorial-typing-dots span {
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: ${CONFIG.colors.primary};
                    animation: typing 1.4s infinite;
                }
                
                .factorial-typing-dots span:nth-child(2) {
                    animation-delay: 0.2s;
                }
                
                .factorial-typing-dots span:nth-child(3) {
                    animation-delay: 0.4s;
                }
                
                @keyframes typing {
                    0%, 60%, 100% { opacity: 0.3; }
                    30% { opacity: 1; }
                }

                .factorial-feedback-container {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid ${CONFIG.colors.lightGray};
                }

                .factorial-feedback-label {
                    font-size: 12px;
                    color: ${CONFIG.colors.darkGray};
                    opacity: 0.7;
                }

                .factorial-feedback-btn {
                    background: none;
                    border: 1px solid ${CONFIG.colors.lightGray};
                    border-radius: 50%;
                    width: 28px;
                    height: 28px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    padding: 0;
                }

                .factorial-feedback-btn:hover:not(:disabled) {
                    background: ${CONFIG.colors.gray};
                    transform: scale(1.1);
                }

                .factorial-feedback-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .factorial-feedback-btn.helpful.active {
                    background: #dcfce7;
                    border-color: #16a34a;
                }

                .factorial-feedback-btn.not-helpful.active {
                    background: #fee2e2;
                    border-color: #dc2626;
                }

                .factorial-feedback-icon {
                    width: 14px;
                    height: 14px;
                    fill: ${CONFIG.colors.darkGray};
                }

                .factorial-feedback-btn.helpful.active .factorial-feedback-icon {
                    fill: #16a34a;
                }

                .factorial-feedback-btn.not-helpful.active .factorial-feedback-icon {
                    fill: #dc2626;
                }

                .factorial-feedback-thanks {
                    font-size: 11px;
                    color: #16a34a;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                @media (max-width: 480px) {
                    .factorial-chat-window {
                        width: calc(100vw - 40px);
                        height: calc(100vh - 140px);
                        bottom: 100px;
                        right: 20px;
                        left: 20px;
                    }
                }
            `;
        }

        createWidget() {
            const widgetContainer = document.createElement('div');
            widgetContainer.className = 'factorial-chat-widget';
            widgetContainer.id = CONFIG.widgetId;

            widgetContainer.innerHTML = `
                <button class="factorial-chat-button" id="factorial-chat-toggle" title="${CONFIG.hoverText}">
                    
                    <div class="factorial-chat-button-initials">ES</div>
                    
                    <div class="factorial-status-indicator" id="factorial-status"></div>
                </button>
                
                <div class="factorial-chat-window" id="factorial-chat-window">
                    <div class="factorial-chat-header">
                        <button class="factorial-chat-close" id="factorial-chat-close">&times;</button>
                        <h3 class="factorial-chat-title">${CONFIG.chatWindowTitle}</h3>
                    </div>
                    
                    <div class="factorial-chat-messages" id="factorial-chat-messages">
                        <div class="factorial-chat-message bot">
                            <div class="factorial-chat-message-content">
                                ${CONFIG.welcomeMessage}
                            </div>
                        </div>
                    </div>
                    
                    <div class="factorial-chat-input-container">
                        <input type="text" class="factorial-chat-input" id="factorial-chat-input" placeholder="Type your message..." maxlength="1000">
                        <button class="factorial-chat-send" id="factorial-chat-send" disabled>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="factorial-chat-footer">
                        <span>Powered by</span>
                        <a href="https://www.chatcraft.cc" target="_blank" rel="noopener noreferrer" class="factorial-chat-logo-link">
                            <img src="https://api.chatcraft.cc/api/v1/widget/static/chatcraft-logo2.png" alt="ChatCraft" class="factorial-chat-logo">
                        </a>
                    </div>
                </div>
            `;

            document.body.appendChild(widgetContainer);

            this.chatContainer = document.getElementById('factorial-chat-window');
            this.messagesContainer = document.getElementById('factorial-chat-messages');
            this.inputField = document.getElementById('factorial-chat-input');
        }

        attachEventListeners() {
            const toggleButton = document.getElementById('factorial-chat-toggle');
            const closeButton = document.getElementById('factorial-chat-close');
            const sendButton = document.getElementById('factorial-chat-send');
            const inputField = this.inputField;

            toggleButton.addEventListener('click', () => this.toggleChat());
            closeButton.addEventListener('click', () => this.closeChat());
            sendButton.addEventListener('click', () => this.sendMessage());

            inputField.addEventListener('input', (e) => {
                sendButton.disabled = !e.target.value.trim();
            });

            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey && e.target.value.trim()) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        toggleChat() {
            if (this.isOpen) {
                this.closeChat();
            } else {
                this.openChat();
            }
        }

        openChat() {
            this.isOpen = true;
            this.chatContainer.classList.add('open');
            this.inputField.focus();

            if (!this.isConnected) {
                this.connectWebSocket();
            }
        }

        closeChat() {
            this.isOpen = false;
            this.chatContainer.classList.remove('open');
        }

        connectWebSocket() {
            // Convert HTTP/HTTPS URLs to WebSocket URLs
            let wsUrl = CONFIG.chatServiceUrl.replace('http://', 'ws://').replace('https://', 'wss://');

            // For production domains, ensure we use the direct /ws/chat path
            // since nginx proxies /ws/chat directly to the chat service
            const wsEndpoint = `${wsUrl}/ws/chat?api_key=${CONFIG.apiKey}`;

            try {
                this.socket = new WebSocket(wsEndpoint);

                this.socket.onopen = () => {
                    this.isConnected = true;
                    this.updateConnectionStatus(true);
                };

                this.socket.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'message' && data.role === 'assistant') {
                        // Store session_id if provided
                        if (data.session_id && !this.sessionId) {
                            this.sessionId = data.session_id;
                        }

                        // Add message with messageId for feedback
                        this.addMessage('bot', data.content, data.message_id);

                        // Handle choices if present (for workflow choice steps)
                        if (data.choices && data.choices.length > 0) {
                            this.addChoices(data.choices);
                        }

                        this.hideTypingIndicator();
                        this.enableSendButton();
                    } else if (data.type === 'connection') {
                        console.log('Connected to chat service:', data.message);
                        // Extract session_id from connection message
                        if (data.session_id) {
                            this.sessionId = data.session_id;
                        }
                    } else if (data.type === 'error') {
                        console.error('Chat service error:', data.message);
                        this.addMessage('bot', 'Sorry, I encountered an error. Please try again later.');
                        this.hideTypingIndicator();
                        this.enableSendButton();
                    }
                };

                this.socket.onclose = () => {
                    this.isConnected = false;
                    this.updateConnectionStatus(false);
                    this.hideTypingIndicator();
                };

                this.socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.isConnected = false;
                    this.updateConnectionStatus(false);
                    this.addMessage('bot', 'Sorry, I encountered an error. Please try again later.');
                };

            } catch (error) {
                console.error('Failed to connect to chat service:', error);
                this.addMessage('bot', 'Unable to connect to chat service. Please check your internet connection.');
            }
        }

        updateConnectionStatus(connected) {
            const statusIndicator = document.getElementById('factorial-status');
            if (connected) {
                statusIndicator.classList.remove('disconnected');
            } else {
                statusIndicator.classList.add('disconnected');
            }
        }

        sendMessage() {
            const message = this.inputField.value.trim();
            if (!message || !this.isConnected) return;

            this.addMessage('user', message);
            this.inputField.value = '';
            document.getElementById('factorial-chat-send').disabled = true;

            this.showTypingIndicator();

            // Send message via WebSocket
            this.socket.send(JSON.stringify({
                type: 'message',
                message: message
            }));
        }

        addMessage(sender, content, messageId = null) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `factorial-chat-message ${sender}`;

            const contentDiv = document.createElement('div');
            contentDiv.className = 'factorial-chat-message-content';
            contentDiv.textContent = content;

            messageDiv.appendChild(contentDiv);

            // Add feedback buttons for bot messages with messageId
            if (sender === 'bot' && messageId && this.sessionId) {
                const feedbackContainer = document.createElement('div');
                feedbackContainer.className = 'factorial-feedback-container';
                feedbackContainer.id = `feedback-${messageId}`;

                // Check if feedback already submitted
                const alreadySubmitted = this.feedbackSubmitted.has(messageId);

                feedbackContainer.innerHTML = `
                    <span class="factorial-feedback-label">Was this helpful?</span>
                    <button class="factorial-feedback-btn helpful"
                            data-message-id="${messageId}"
                            data-feedback="helpful"
                            ${alreadySubmitted ? 'disabled' : ''}>
                        <svg class="factorial-feedback-icon" viewBox="0 0 24 24">
                            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                        </svg>
                    </button>
                    <button class="factorial-feedback-btn not-helpful"
                            data-message-id="${messageId}"
                            data-feedback="not_helpful"
                            ${alreadySubmitted ? 'disabled' : ''}>
                        <svg class="factorial-feedback-icon" viewBox="0 0 24 24">
                            <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                        </svg>
                    </button>
                `;

                // Add click handlers
                const helpfulBtn = feedbackContainer.querySelector('.helpful');
                const notHelpfulBtn = feedbackContainer.querySelector('.not-helpful');

                helpfulBtn.addEventListener('click', (e) => {
                    this.submitFeedback(messageId, 'helpful', feedbackContainer);
                });

                notHelpfulBtn.addEventListener('click', (e) => {
                    this.submitFeedback(messageId, 'not_helpful', feedbackContainer);
                });

                contentDiv.appendChild(feedbackContainer);
            }

            this.messagesContainer.appendChild(messageDiv);

            // Auto-scroll to bottom
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }

        addChoices(choices) {
            const choicesDiv = document.createElement('div');
            choicesDiv.className = 'factorial-chat-choices';

            choices.forEach(choice => {
                const button = document.createElement('button');
                button.className = 'factorial-chat-choice-button';
                button.textContent = choice;
                button.onclick = () => {
                    // Remove all choice buttons after selection
                    document.querySelectorAll('.factorial-chat-choices').forEach(el => el.remove());

                    // Send the selected choice as a message
                    this.addMessage('user', choice);
                    document.getElementById('factorial-chat-send').disabled = true;
                    this.showTypingIndicator();

                    this.socket.send(JSON.stringify({
                        type: 'message',
                        message: choice
                    }));
                };
                choicesDiv.appendChild(button);
            });

            this.messagesContainer.appendChild(choicesDiv);
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }

        showTypingIndicator() {
            const existingIndicator = document.getElementById('factorial-typing-indicator');
            if (existingIndicator) return;

            const indicatorDiv = document.createElement('div');
            indicatorDiv.className = 'factorial-chat-message bot';
            indicatorDiv.id = 'factorial-typing-indicator';

            indicatorDiv.innerHTML = `
                <div class="factorial-typing-indicator">
                    <span>AI is typing</span>
                    <div class="factorial-typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;

            this.messagesContainer.appendChild(indicatorDiv);
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }

        hideTypingIndicator() {
            const indicator = document.getElementById('factorial-typing-indicator');
            if (indicator) {
                indicator.remove();
            }
        }

        enableSendButton() {
            const sendButton = document.getElementById('factorial-chat-send');
            if (sendButton) {
                sendButton.disabled = false;
            }
        }

        submitFeedback(messageId, feedbackType, feedbackContainer) {
            // Prevent duplicate submissions
            if (!this.sessionId || !messageId || this.feedbackSubmitted.has(messageId)) {
                return;
            }

            // Mark as submitted
            this.feedbackSubmitted.add(messageId);

            // Disable both buttons immediately
            const buttons = feedbackContainer.querySelectorAll('.factorial-feedback-btn');
            buttons.forEach(btn => btn.disabled = true);

            // Determine which button was clicked for visual feedback
            const clickedButton = feedbackContainer.querySelector(`.${feedbackType}`);
            if (clickedButton) {
                clickedButton.classList.add('active');
            }

            // Submit feedback to API (widget-specific endpoint)
            fetch(`${CONFIG.backendUrl}/api/v1/feedback/widget/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': CONFIG.apiKey
                },
                body: JSON.stringify({
                    message_id: messageId,
                    session_id: this.sessionId,
                    feedback_type: feedbackType
                })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Feedback submitted successfully:', data);

                    // Replace buttons with thank you message
                    feedbackContainer.innerHTML = `
                    <span class="factorial-feedback-thanks">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#16a34a">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Thank you for your feedback!
                    </span>
                `;
                })
                .catch(error => {
                    console.error('Error submitting feedback:', error);

                    // Re-enable buttons on error
                    this.feedbackSubmitted.delete(messageId);
                    buttons.forEach(btn => btn.disabled = false);
                    if (clickedButton) {
                        clickedButton.classList.remove('active');
                    }

                    // Show error message
                    const label = feedbackContainer.querySelector('.factorial-feedback-label');
                    if (label) {
                        const originalText = label.textContent;
                        label.textContent = 'Failed to submit. Please try again.';
                        label.style.color = '#dc2626';
                        setTimeout(() => {
                            label.textContent = originalText;
                            label.style.color = '';
                        }, 3000);
                    }
                });
        }
    }

    // Initialize widget when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new FactorialChatWidget();
        });
    } else {
        new FactorialChatWidget();
    }
})();
