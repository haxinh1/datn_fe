import React, { useState, useEffect } from "react";
import { List, Button, Input, Card, Typography, message as antdMessage } from "antd";
import axios from "axios";
import { closeChatSession, getChatSessions, getMessages, sendMessage } from "../services/chatBox";
import echo from "../echo";

const { Text } = Typography;
const { TextArea } = Input;

const Inbox = () => {
    const [chatSessions, setChatSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        fetchChatSessions();
        if (selectedSession) {
            console.log('Joining channel:', `chat.${selectedSession.id}`);
            echo.private(`chat.${selectedSession.id}`)
                .subscribed(() => {
                    console.log('Successfully subscribed to chat channel:', `chat.${selectedSession.id}`);
                })
                .listen('.message.sent', (event) => {
                    setMessages(prevMessages => [...prevMessages, event.message]);
                });
        }

        return () => {
            if (selectedSession) {
                echo.leave(`chat.${selectedSession.id}`);
            }
        };
    }, [selectedSession]);

    const fetchChatSessions = async () => {
        try {
            const response = await getChatSessions();
            setChatSessions(response.data.chat_sessions);
        } catch (error) {
            antdMessage.error("Lỗi khi tải danh sách phiên chat");
        }
    };

    const fetchMessages = async (sessionId) => {
        try {
            const response = await getMessages(sessionId);
            setMessages(response.data.messages);
        } catch (error) {
            antdMessage.error("Lỗi khi tải tin nhắn");
        }
    };

    const handleSelectSession = (session) => {
        setSelectedSession(session);
        fetchMessages(session.id);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        try {
            await sendMessage({
                chat_session_id: selectedSession.id,
                message: newMessage,
            });
            setNewMessage("");
            fetchMessages(selectedSession.id);
        } catch (error) {
            antdMessage.error("Lỗi khi gửi tin nhắn");
        }
    };

    const handleCloseSession = async () => {
        try {
            await closeChatSession(selectedSession.id);
            antdMessage.success("Phiên chat đã được đóng");
            setSelectedSession(null);
            fetchChatSessions();
        } catch (error) {
            antdMessage.error("Lỗi khi đóng phiên chat");
        }
    };

    return (
        <div style={{ display: "flex", gap: 20, padding: 20 }}>
            <Card title="Danh sách phiên chat" style={{ width: 300 }}>
                <List
                    dataSource={chatSessions}
                    renderItem={(session) => (
                        <List.Item onClick={() => handleSelectSession(session)} style={{ cursor: "pointer" }}>
                            <Text strong>Phiên #{session.id}</Text>
                        </List.Item>
                    )}
                />
            </Card>

            {selectedSession && (
                <Card title={`Chat với khách hàng #${selectedSession.id}`} style={{ flex: 1 }}>
                    <div style={{ height: 300, overflowY: "scroll", borderBottom: "1px solid #ddd", padding: 10 }}>
                        {messages.map((msg) => {
                            const isCustomer = msg.sender_type === 'customer' || msg.sender_type === 'guest';

                            return (
                                <div key={msg.id} style={{ marginBottom: 10 }}>
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
                                                    ? "Khách hàng"
                                                    : 'Nhân viên'}
                                            </div>
                                            <div>{msg.message}</div>
                                        </div>
                                    </List.Item>
                                </div>
                            )
                        })}
                    </div>
                    <TextArea
                        rows={3}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                    />
                    <Button type="primary" onClick={handleSendMessage} style={{ marginTop: 10 }}>
                        Gửi
                    </Button>
                    <Button danger onClick={handleCloseSession} style={{ marginTop: 10, marginLeft: 10 }}>
                        Đóng phiên chat
                    </Button>
                </Card>
            )}
        </div>
    );
};


export default Inbox;
