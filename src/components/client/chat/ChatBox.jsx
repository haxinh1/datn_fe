import React from "react";
import { useState } from "react";
import { Card, List, Input, Button, Drawer } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FloatButton, Tooltip } from "antd";
import axios from "axios";
import { MessageOutlined } from "@ant-design/icons";

const fetchChatSessions = async () => {
  const { data } = await axios.get("/chat/sessions");
  return data.chat_sessions;
};

const sendMessage = async ({ chat_session_id, message }) => {
  await axios.post("/chat/send-message", { chat_session_id, message });
};


const fakeSessions = [
  {
    id: 1,
    guest_name: "Nguyễn Văn A",
    messages: [
      { id: 101, sender_type: "customer", message: "Xin chào, tôi cần hỗ trợ!" },
      { id: 102, sender_type: "support", message: "Chào bạn, tôi có thể giúp gì?" },
    ],
  },
  {
    id: 2,
    guest_name: "Trần Thị B",
    messages: [
      { id: 201, sender_type: "customer", message: "Sản phẩm này còn hàng không?" },
      { id: 202, sender_type: "support", message: "Dạ, sản phẩm này còn ạ!" },
    ],
  },
];

const ChatBox = () => {
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [chatVisible, setChatVisible] = useState(false);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["chatSessions"],
    queryFn: fetchChatSessions,
  });

  const messageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries(["chatSessions"]);
    },
  });

  const handleSendMessage = () => {
    if (selectedChat && message.trim()) {
      messageMutation.mutate({ chat_session_id: selectedChat.id, message });
      setMessage("");
    }
  };

  return (
    <div>
      <Tooltip title="Chat với chúng tôi!" placement="left">
        <FloatButton
          icon={<MessageOutlined style={{ fontSize: 20 }} />}
          type="primary"
          style={{
            right: 20,
            bottom: 20,
            transition: "transform 0.2s ease-in-out",
            transform: isHovered ? "scale(1.1)" : "scale(1)",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setChatVisible(true)}
        />
      </Tooltip>

      <Drawer
        title="Hỗ trợ khách hàng"
        placement="right"
        onClose={() => setChatVisible(false)}
        open={chatVisible}
        width={350}
      >
        <Card title="Danh sách phiên chat">
          <List
            loading={isLoading}
            dataSource={fakeSessions}
            renderItem={(item) => (
              <List.Item onClick={() => setSelectedChat(item)} style={{ cursor: "pointer" }}>
                {item.guest_name || `Khách hàng #${item.id}`}
              </List.Item>
            )}
          />
        </Card>

        {selectedChat && (
          <Card style={{ width: 400, position: 'fixed', bottom: 20, right: 20 }} title={`Chat với ${selectedChat.guest_name || `Khách hàng #${selectedChat.id}`}`}>
            <List
              dataSource={selectedChat.messages}
              renderItem={(msg) => (
                <List.Item>{msg.message}</List.Item>
              )}
            />
            <Input.TextArea
              rows={2}
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
            />
            <Button type="primary" onClick={handleSendMessage} style={{ marginTop: "10px" }}>
              Gửi
            </Button>
          </Card>
        )}
      </Drawer>
    </div>
  );
};

export default ChatBox;
