import React, { useState, useEffect } from "react";
import { List, message, Button, Input, Card, Typography, Upload } from "antd";
import axios from "axios";
import { closeChatSession, getChatSessions, getMessages, sendMessage } from "../services/chatBox";
import echo from "../echo";
import { MessageOutlined, PictureOutlined, UploadOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { TextArea } = Input;

const Inbox = () => {
    const [chatSessions, setChatSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [fileList, setFileList] = useState([]);
    const [imageUrls, setImageUrls] = useState([]);
    const [showUpload, setShowUpload] = useState(false);

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
            message.error("Lỗi khi tải danh sách phiên chat");
        }
    };

    const fetchMessages = async (sessionId) => {
        try {
            const response = await getMessages(sessionId);
            setMessages(response.data.messages);
        } catch (error) {
            message.error("Lỗi khi tải tin nhắn");
        }
    };

    const handleSelectSession = (session) => {
        setSelectedSession(session);
        fetchMessages(session.id);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() && !imageUrls.length) return;
        try {
            await sendMessage({
                chat_session_id: selectedSession.id,
                message: newMessage,
                media: (imageUrls || []).map((url) => ({ url, type: 'image' })),
            });
            setNewMessage("");
            setImageUrls([]);
            setFileList([]);
            setShowUpload(false);
            fetchMessages(selectedSession.id);
        } catch (error) {
            message.error("Lỗi khi gửi tin nhắn");
        }
    };

    const handleCloseSession = async () => {
        try {
            await closeChatSession(selectedSession.id);
            message.success("Phiên chat đã được đóng");
            setSelectedSession(null);
            fetchChatSessions();
        } catch (error) {
            message.error("Lỗi khi đóng phiên chat");
        }
    };

    const toggleUpload = () => {
        setShowUpload(!showUpload);
    };

    const handleUploadChange = ({ file, fileList }) => {

        const newFileList = fileList.map((f) => ({
            uid: f.uid,
            name: f.name || 'Hình ảnh',
            status: f.status,
            url: f.response?.secure_url || f.url,
        }));

        setFileList(newFileList);

        const newImageUrls = newFileList
            .filter((f) => f.status === 'done' && f.url)
            .map((f) => f.url);
        setImageUrls(newImageUrls);

        if (file.status === 'done' && file.response) {
            message.success('Tải ảnh lên thành công');
        } else if (file.status === 'error') {
            message.error('Tải ảnh lên thất bại');
        }
    };

    const onRemove = (file) => {
        const newFileList = fileList.filter((item) => item.uid !== file.uid);
        setFileList(newFileList);
        const newImageUrls = newFileList
            .filter((f) => f.status === 'done' && f.url)
            .map((f) => f.url);
        setImageUrls(newImageUrls);
    };

    const uploadProps = {
        action: 'https://api.cloudinary.com/v1_1/dzpr0epks/image/upload',
        data: { upload_preset: 'quangOsuy' },
        multiple: true,
        listType: 'picture-card',
        fileList,
        onChange: handleUploadChange,
        onRemove,
        onPreview: async (file) => {
            const src = file.url || (file.response && file.response.secure_url);
            if (!src) return;
            const imgWindow = window.open(src);
            if (imgWindow) {
                imgWindow.document.write('<img src="' + src + '" style="max-width:100%;" />');
            }
        },
        accept: 'image/*',
    };

    return (
        <div style={{ display: "flex", gap: 20, padding: 20 }}>
            <Card style={{ width: 300 }}>
                <h1 className="mb-5">
                    <MessageOutlined style={{ marginRight: "8px" }} />
                    Danh sách phiên chat
                </h1>

                <List
                    dataSource={chatSessions}
                    renderItem={(session) => (
                        <List.Item
                            onClick={() => handleSelectSession(session)}
                            style={{
                                cursor: "pointer",
                                padding: "8px 12px",
                                borderRadius: "4px",
                                transition: "all 0.3s ease",
                                backgroundColor: selectedSession && selectedSession.id === session.id ? "#f5f5f5" : "transparent",
                                color: selectedSession && selectedSession.id === session.id ? "#1890ff" : "inherit",
                            }}
                        >
                            <Text strong>{session.customer && session.customer.fullname || "Khách hàng"}{" " + session.id}</Text>
                        </List.Item>
                    )}
                />
            </Card>

            {selectedSession && (
                <Card style={{ flex: 1 }}>
                    <h1 className="mb-5">{`${selectedSession.customer && selectedSession.customer.fullname || "Khách hàng"}`}</h1>

                    <div style={{ height: 300, overflowY: "scroll", borderBottom: "1px solid #ddd", padding: 10 }}>
                        {messages.map((msg) => {

                            const isCustomer = msg.sender_type === 'customer' || msg.sender_type === 'guest';

                            return (
                                <div key={msg.id} style={{ marginBottom: 10 }}>
                                    <List.Item
                                        style={{
                                            display: 'flex',
                                            justifyContent: isCustomer ? 'flex-start' : 'flex-end',
                                        }}
                                    >
                                        <div
                                            style={{
                                                maxWidth: '70%',
                                                padding: '8px 12px',
                                                borderRadius: 8,
                                                background: isCustomer ? '#f0f0f0' : '#1890ff',
                                                color: isCustomer ? 'black' : 'white',
                                            }}
                                        >
                                            <div style={{ fontSize: 12, opacity: 0.7 }}>
                                                {isCustomer
                                                    ? "Khách hàng"
                                                    : 'Nhân viên'}
                                            </div>
                                            <div>  {msg.message && <div>{msg.message}</div>}
                                            </div>
                                            <div>
                                                {msg.media &&
                                                    msg.media.map((media, index) => (
                                                        <img
                                                            key={index}
                                                            src={media.url}
                                                            alt="media"
                                                            style={{ width: '100%', marginTop: 8 }}
                                                        />
                                                    ))}
                                            </div>
                                        </div>
                                    </List.Item>
                                </div>
                            )
                        })}
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        {showUpload && (
                            <Upload {...uploadProps}>
                                <button className="upload-button" type="button">
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                </button>
                            </Upload>
                        )}
                    </div>

                    <TextArea
                        rows={3}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                    />
                    <Button
                        type="text"
                        icon={<PictureOutlined />}
                        style={{ marginTop: 10, marginLeft: 10, color: "#1890ff", backgroundColor: "#f0f0f0" }}
                        onClick={toggleUpload}
                    />
                    <Button type="primary" onClick={handleSendMessage} style={{ marginTop: 10, marginLeft: 10 }}>
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