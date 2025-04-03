import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Form, List, Avatar, message } from 'antd';
import {
    createChatSession,
    getChatSessions,
    sendMessage,
    getMessages,
    markAsRead,
    closeChatSession,
} from '../../../services/chatBox';
const ChatWindow = ({ visible, onClose, isLoggedIn, user }) => {
    const [form] = Form.useForm();
    const [guestForm] = Form.useForm();
    const [chatSession, setChatSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            initializeChat();
        }
    }, [visible]);

    const initializeChat = async () => {
        setLoading(true);
        try {
            if (isLoggedIn) {
                const response = await createChatSession({});
                setChatSession(response.data.chat_session);
                fetchMessages(response.data.chat_session.id);
            } else {
                const guestPhone = localStorage.getItem('guest_phone');
                if (guestPhone) {
                    const sessions = await getChatSessions(guestPhone);
                    if (sessions.data.chat_sessions.length > 0) {
                        setChatSession(sessions.data.chat_sessions[0]);
                        fetchMessages(sessions.data.chat_sessions[0].id);
                    }
                }
            }
        } catch (error) {
            message.error('Không thể khởi tạo phiên chat');
        }
        setLoading(false);
    };

    const fetchMessages = async (chatSessionId) => {
        try {
            const response = await getMessages(chatSessionId);
            setMessages(response.data.messages);
            // Đánh dấu tin nhắn từ nhân viên (store) là đã đọc
            response.data.messages.forEach(async (msg) => {
                if (msg.sender_type === 'store') {
                    await markAsRead(msg.id);
                }
            });
        } catch (error) {
            message.error('Không thể tải tin nhắn');
        }
    };

    const handleGuestSubmit = async (values) => {
        setLoading(true);
        try {
            const response = await createChatSession({
                guest_phone: values.guest_phone,
                guest_name: values.guest_name,
            });
            setChatSession(response.data.chat_session);
            localStorage.setItem('guest_phone', values.guest_phone);
            localStorage.setItem('guest_name', values.guest_name);
            fetchMessages(response.data.chat_session.id);
        } catch (error) {
            message.error('Không thể tạo phiên chat');
        }
        setLoading(false);
    };

    const handleSendMessage = async (values) => {
        if (!chatSession) return;
        setLoading(true);
        try {
            const messageData = {
                chat_session_id: chatSession.id,
                message: values.message,
                type: 'text',
            };
            if (!isLoggedIn) {
                messageData.guest_phone = localStorage.getItem('guest_phone');
                messageData.guest_name = localStorage.getItem('guest_name');
            }
            await sendMessage(messageData);
            form.resetFields();
            fetchMessages(chatSession.id);
        } catch (error) {
            message.error('Không thể gửi tin nhắn');
        }
        setLoading(false);
    };

    const handleCloseSession = async () => {
        if (!chatSession) return;
        setLoading(true);
        try {
            await closeChatSession(chatSession.id);
            setChatSession(null);
            setMessages([]);
            localStorage.removeItem('guest_phone');
            localStorage.removeItem('guest_name');
            onClose();
        } catch (error) {
            message.error('Không thể đóng phiên chat');
        }
        setLoading(false);
    };

    return (
        <Modal
            title="Chat với nhân viên tư vấn"
            visible={visible}
            onCancel={onClose}
            footer={null}
            width={400}
            style={{ position: 'fixed', bottom: 20, right: 20, top: 'auto' }}
        >
            {!chatSession && !isLoggedIn ? (
                <Form form={guestForm} onFinish={handleGuestSubmit}>
                    <Form.Item
                        name="guest_name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                    >
                        <Input placeholder="Tên của bạn" />
                    </Form.Item>
                    <Form.Item
                        name="guest_phone"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                    >
                        <Input placeholder="Số điện thoại" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Bắt đầu trò chuyện
                        </Button>
                    </Form.Item>
                </Form>
            ) : (
                <>
                    <div style={{ height: 300, overflowY: 'auto', marginBottom: 16 }}>
                        <List
                            dataSource={messages}
                            renderItem={(item) => {
                                // Tin nhắn từ khách hàng (guest hoặc customer)
                                const isCustomer = item.sender_type === 'customer' || item.sender_type === 'guest';
                                return (
                                    <List.Item
                                        style={{
                                            display: 'flex',
                                            justifyContent: isCustomer ? 'flex-end' : 'flex-start',
                                        }}
                                    >
                                        <div
                                            style={{
                                                maxWidth: '70%',
                                                padding: '8px 12px',
                                                borderRadius: 8,
                                                background: isCustomer ? '#1890ff' : '#f0f0f0',
                                                color: isCustomer ? 'white' : 'black',
                                            }}
                                        >
                                            <div style={{ fontSize: 12, opacity: 0.7 }}>
                                                {isCustomer
                                                    ? (isLoggedIn ? user.name : localStorage.getItem('guest_name'))
                                                    : 'Nhân viên'}
                                            </div>
                                            <div>{item.message}</div>
                                        </div>
                                    </List.Item>
                                );
                            }}
                        />
                    </div>
                    <Form form={form} onFinish={handleSendMessage}>
                        <Form.Item name="message" rules={[{ required: true, message: 'Vui lòng nhập tin nhắn!' }]}>
                            <Input placeholder="Tin nhắn" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Gửi
                            </Button>
                            <Button
                                style={{ marginLeft: 8 }}
                                onClick={handleCloseSession}
                                loading={loading}
                            >
                                Kết thúc
                            </Button>
                        </Form.Item>
                    </Form>
                </>
            )}
        </Modal>
    );
};

export default ChatWindow;