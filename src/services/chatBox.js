import instance from "../axios"
export const createChatSession = (guestData) => {
    return instance.post('/chat/create-session', guestData);
};

export const getChatSessions = (guestPhone) => {
    return instance.get('/chat/sessions', { params: { guest_phone: guestPhone } });
};

export const sendMessage = (messageData) => {
    return instance.post('/chat/send-message', messageData);
};

export const getMessages = (chatSessionId) => {
    return instance.get(`/chat/messages/${chatSessionId}`);
};

export const markAsRead = (messageId) => {
    return instance.post(`/chat/mark-as-read/${messageId}`);
};

export const closeChatSession = (sessionId) => {
    return instance.post(`/chat/close-session/${sessionId}`);
};


// export const ChatBoxServices = {
//     createChatSession,
//     getChatSessions,
//     sendMessage,
//     getMessages,
//     markAsRead,
//     closeChatSession

// }