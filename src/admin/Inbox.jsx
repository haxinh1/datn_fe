import React, { useState, useEffect } from "react";
import { List, Button, Input, Card, Typography, message as antdMessage } from "antd";
import axios from "axios";
import { closeChatSession, getChatSessions, getMessages, sendMessage } from "../services/chatBox";

const { Text } = Typography;
const { TextArea } = Input;

const Inbox = () => {
    const [chatSessions, setChatSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        fetchChatSessions();
    }, []);

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
                        {messages.map((msg) => (
                            <div key={msg.id} style={{ marginBottom: 10 }}>
                                <Text strong>
                                    {msg.sender_type === "customer" ? "Khách hàng" : msg.sender_type === "guest" ? "Guest" : "Nhân viên"}:
                                </Text>
                                <p>{msg.message}</p>
                            </div>
                        ))}
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
