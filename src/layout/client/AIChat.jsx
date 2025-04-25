import { useEffect, useRef, useState } from "react";
import { Avatar, Button, Drawer, Input, Tooltip } from "antd";
import { SendOutlined, CloseCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import "../../assets/css/style.css";

const AIChat = () => {
    const [aiQuestion, setAiQuestion] = useState("");
    const [chatHistory, setChatHistory] = useState([{ sender: "ai", text: "Xin chào! Tôi có thể giúp gì cho bạn?" }]);
    const [isAIModalVisible, setIsAIModalVisible] = useState(false);
    const messagesEndRef = useRef(null);
    const vitegeminiurl = import.meta.env.VITE_GEMINI_URL;

    const handleAskAI = async () => {
        if (!aiQuestion.trim()) return;
        const userQuestion = aiQuestion;
        setAiQuestion("");
        setChatHistory((prev) => [...prev, { sender: "user", text: userQuestion }]);

        try {
            const res = await axios.post(vitegeminiurl, {
                contents: [{ parts: [{ text: userQuestion }] }],
            }, { headers: { "Content-Type": "application/json" } });

            const aiReply = res.data.candidates[0]?.content?.parts?.[0]?.text || "Xin lỗi, tôi chưa hiểu câu hỏi này.";
            setChatHistory((prev) => [...prev, { sender: "ai", text: aiReply }]);
        } catch (error) {
            console.error("Lỗi khi gọi AI:", error);
            setChatHistory((prev) => [...prev, { sender: "ai", text: "AI đang gặp sự cố, vui lòng thử lại sau." }]);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    return (
        <>
            <Button
                onClick={() => setIsAIModalVisible(true)}
                style={{
                    padding: "10px",
                    position: "fixed",
                    bottom: "120px",
                    right: "20px",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                    color: "white",
                    zIndex: 1000
                }}
            >
                <img
                    style={{ width: 120 }}
                    src="https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg" alt=""
                />
            </Button>

            <Drawer
                closable={false}
                placement="bottom"
                title={
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Avatar size={32}
                            src="https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg"
                            style={{ backgroundColor: "#3A4ADD" }}
                        >
                            AI
                        </Avatar>
                        <span style={{ fontWeight: "bold", fontSize: "16px" }}>Molla AI</span>
                    </div>
                }
                onClose={() => setIsAIModalVisible(false)}
                open={isAIModalVisible}
                mask={false}
                height={450}
                extra={
                    <Tooltip title='Đóng hộp chat'>
                        <Button type="text" onClick={() => setIsAIModalVisible(false)}>
                            <CloseCircleOutlined style={{ fontSize: 20, color: "#3A4ADD" }} />
                        </Button>
                    </Tooltip>
                }
                contentWrapperStyle={{
                    width: 360,
                    position: "fixed",
                    right: 20,
                    bottom: 12,
                    left: "auto",
                    borderRadius: "12px 12px 0 0",
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ flex: 1, padding: "10px", overflowY: "auto", backgroundColor: "#fafafa" }}>
                        {chatHistory.map((msg, index) => (
                            <div key={index} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                                <Avatar size={34}
                                    src="https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg"
                                    style={{ backgroundColor: msg.sender === "user" ? "#3A4ADD" : "#3A4ADD" }}>{msg.sender === "user" ? "U" : "AI"}
                                </Avatar>

                                <div
                                    style={{
                                        padding: "10px",
                                        backgroundColor: msg.sender === "user" ? "#d1e7ff" : "#f5f5f5",
                                        borderRadius: "8px",
                                        maxWidth: "80%",
                                    }}
                                >
                                    <span style={{ margin: 0 }}>{msg.text}</span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="group1">
                        <Input
                            className="input-item"
                            placeholder="Nhập câu hỏi của bạn..."
                            value={aiQuestion}
                            onChange={(e) => setAiQuestion(e.target.value)}
                            onPressEnter={handleAskAI}
                        />
                        
                        <Tooltip title='Gửi'>
                            <Button
                                className="btn-import"
                                style={{ width: '50px' }}
                                type="text"
                                onClick={handleAskAI}
                                block
                                icon={<SendOutlined style={{ fontSize: '20px' }} />}
                            />
                        </Tooltip>
                    </div>
                </div>
            </Drawer>
        </>
    );
};

export default AIChat;
