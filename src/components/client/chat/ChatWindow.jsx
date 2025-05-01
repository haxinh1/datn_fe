import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, Button, Form, List, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import {
  createChatSession,
  getChatSessions,
  sendMessage,
  getMessages,
  markAsRead,
  closeChatSession,
} from '../../../services/chatBox';
import echo from '../../../echo';

const ChatWindow = ({ visible, onClose, isLoggedIn, user }) => {

  const [form] = Form.useForm();
  const [guestForm] = Form.useForm();
  const [chatSession, setChatSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);


  useEffect(() => {
    if (visible) {
      const savedChatSessionId = localStorage.getItem('chat_session_id'); 
      if (savedChatSessionId) {
        setChatSession({ id: savedChatSessionId });
        fetchMessages(savedChatSessionId);
      } else {
        initializeChat(); 
      }
    }
  }, [visible]);


  useEffect(() => {
    if (!chatSession) return;

    console.log('Joining channel:', `chat.${chatSession.id}`);
    echo.private(`chat.${chatSession.id}`)
      .subscribed(() => {
        console.log('Successfully subscribed to chat channel:', `chat.${chatSession.id}`);
      })
      .listen('.message.sent', (event) => {
        console.log('New message received:', JSON.stringify(event, null, 2));
        setMessages((prevMessages) => [...prevMessages, event.message]);
        scrollToBottom(); 
      })
      .error((error) => {
        console.error('Pusher error:', error);
      });

    return () => {
      echo.leave(`chat.${chatSession.id}`);
    };
  }, [chatSession, isLoggedIn, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    setLoading(true);
    try {
      if (isLoggedIn) {
        const response = await createChatSession({});
        const chatSessionData = response.data.chat_session;
        setChatSession(chatSessionData);
        localStorage.setItem('chat_session_id', chatSessionData.id);  // Lưu ID phiên chat
        fetchMessages(chatSessionData.id);
      } else {
        const guestPhone = localStorage.getItem('guest_phone');
        if (guestPhone) {
          const sessions = await getChatSessions(guestPhone);
          const activeSession = sessions.data.chat_sessions.find((s) => !s.is_closed);
          if (activeSession) {
            setChatSession(activeSession);
            localStorage.setItem('chat_session_id', activeSession.id);  // Lưu ID phiên chat
            fetchMessages(activeSession.id);
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
      scrollToBottom();
      const unreadMessages = response.data.messages.filter((msg) => msg.sender_type === 'store');
      if (unreadMessages.length > 0) {
        await Promise.all(unreadMessages.map((msg) => markAsRead(msg.id)));
      }
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
    if (!chatSession) {
      message.error('Vui lòng khởi tạo phiên chat trước');
      return;
    }
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
      // Không cần gọi fetchMessages vì real-time sẽ tự cập nhật
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
      
      localStorage.removeItem('chat_session_id');
      
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

  const handleImageUpload = async (file) => {
    if (!chatSession) {
      return message.error('Vui lòng khởi tạo phiên chat trước');
    }
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chat_session_id', chatSession.id);
    formData.append('type', 'image');
  
    if (!isLoggedIn) {
      formData.append('guest_phone', localStorage.getItem('guest_phone'));
      formData.append('guest_name', localStorage.getItem('guest_name'));
    }
  
    try {
      setLoading(true);
      const response = await sendMessage(formData); // Ensure your `sendMessage` API supports FormData
      setMessages((prevMessages) => [...prevMessages, response.data.message]); // Update messages
      message.success('Ảnh đã được tải lên thành công');
    } catch (error) {
      message.error('Không thể tải ảnh');
    } finally {
      setLoading(false);
    }
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
                          ? isLoggedIn
                            ? user
                            : localStorage.getItem('guest_name')
                          : 'Nhân viên'}
                      </div>
                      <div>{item.message}</div>
                    </div>
                  </List.Item>
                );
              }}
            />
            <div ref={messagesEndRef} />
          </div>
          <Form form={form} onFinish={handleSendMessage}>
            <Form.Item
              name="message"
              rules={[{ required: true, message: 'Vui lòng nhập tin nhắn!' }]}
            >
              <Input placeholder="Tin nhắn" /> 
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Gửi
              </Button>
              <Upload
                beforeUpload={(file) => {
                  handleImageUpload(file); // Correct function name
                  return false; // Prevent default upload behavior
                }}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} loading={loading} style={{ marginLeft: 8 }}>
                  Tải ảnh
                </Button>
              </Upload>
              <Button style={{ marginLeft: 8 }} onClick={handleCloseSession} loading={loading}>
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