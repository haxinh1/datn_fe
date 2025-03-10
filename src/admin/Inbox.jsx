import React, { useState } from 'react';
import { Layout, List, Avatar, Input } from 'antd';
import { BookOutlined, SendOutlined } from '@ant-design/icons';
import './inbox.css';

const { Sider, Content, Footer } = Layout;

const conversations = [
    { name: 'Nguyen Van A', avatar: 'https://i.pravatar.cc/150?img=1' },
    { name: 'Tran Thi B', avatar: 'https://i.pravatar.cc/150?img=2' },
    { name: 'Le Van C', avatar: 'https://i.pravatar.cc/150?img=3' }
];

const Inbox = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const sendMessage = () => {
        if (!input.trim()) return;
        setMessages([...messages, { text: input, sender: 'You' }]);
        setInput('');
    };

    return (
        <Layout className="inbox-container">
            <Sider width={250} className="inbox-sidebar">
                <List
                    dataSource={conversations}
                    renderItem={user => (
                        <List.Item className="inbox-user-item">
                            <Avatar src={user.avatar} />
                            <span>{user.name}</span>
                        </List.Item>
                    )}
                />
            </Sider>
            <Layout className="inbox-chat">
                <Content className="inbox-chat-box">
                    {messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.sender === 'You' ? 'sent' : 'received'}`}>
                            {msg.text}
                        </div>
                    ))}
                </Content>
                <Footer className="inbox-chat-input">
                    <Input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onPressEnter={sendMessage}
                        placeholder="Nhắn tin..."
                        suffix={<SendOutlined onClick={sendMessage} />}
                    />
                </Footer>
            </Layout>
        </Layout>
    );
};

export default Inbox;
