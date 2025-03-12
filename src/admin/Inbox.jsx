import React, { useState } from 'react';
import { Layout, List, Avatar, Input, Button, Image, Tooltip } from 'antd';
import { SendOutlined, SearchOutlined, PictureOutlined, CloseCircleOutlined } from '@ant-design/icons';
import './inbox.css';

const { Sider, Content, Footer } = Layout;

const conversations = [
    { name: 'Nguyen Van A', avatar: 'https://i.pravatar.cc/150?img=1' },
    { name: 'Tran Thi B', avatar: 'https://i.pravatar.cc/150?img=2' },
    { name: 'Tran Thi B', avatar: 'https://i.pravatar.cc/150?img=2' },
    { name: 'Tran Thi B', avatar: 'https://i.pravatar.cc/150?img=2' },
    { name: 'Tran Thi B', avatar: 'https://i.pravatar.cc/150?img=2' },
    { name: 'Tran Thi B', avatar: 'https://i.pravatar.cc/150?img=2' },
    { name: 'Tran Thi B', avatar: 'https://i.pravatar.cc/150?img=2' },
    { name: 'Tran Thi B', avatar: 'https://i.pravatar.cc/150?img=2' },
    { name: 'Tran Thi B', avatar: 'https://i.pravatar.cc/150?img=2' },
    { name: 'Tran Thi B', avatar: 'https://i.pravatar.cc/150?img=2' },
    { name: 'Tran Thi B', avatar: 'https://i.pravatar.cc/150?img=2' },
    { name: 'Tran Thi B', avatar: 'https://i.pravatar.cc/150?img=2' },
    { name: 'Tran Thi B', avatar: 'https://i.pravatar.cc/150?img=2' },
    { name: 'Le Van C', avatar: 'https://i.pravatar.cc/150?img=3' }
];

const Inbox = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [currentUser, setCurrentUser] = useState(conversations[0]); // Default to first user
    const [images, setImages] = useState([]); // Trạng thái lưu nhiều ảnh

    const sendMessage = () => {
        if (!input.trim() && images.length === 0) return;
    
        const newMessages = [];
        
        // Nếu có ảnh, thêm tin nhắn ảnh trước
        if (images.length > 0) {
            newMessages.push({ images: images, sender: 'You' });
        }
        
        // Nếu có văn bản, thêm tin nhắn văn bản sau ảnh
        if (input.trim()) {
            newMessages.push({ text: input, sender: 'You' });
        }
        
        // Cập nhật tin nhắn
        setMessages([...messages, ...newMessages]);
        setInput('');
        setImages([]); // Reset ảnh sau khi gửi
    };       

    const handleImageUpload = (e) => {
        const files = e.target.files;
        const newImages = Array.from(files).map((file) => {
            const reader = new FileReader();
            return new Promise((resolve) => {
                reader.onloadend = () => {
                    resolve(reader.result);
                };
                reader.readAsDataURL(file);
            });
        });

        // Add images to the state after all files are processed
        Promise.all(newImages).then((results) => {
            setImages((prevImages) => [...prevImages, ...results]); // Thêm ảnh mới vào mảng ảnh
        });
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index)); // Xóa ảnh theo index
    };

    return (
        <Layout className="inbox-container">
            <Sider width={250} className="inbox-sidebar">
                <div className="inbox-search">
                    <Input
                        placeholder="Tìm kiếm"
                        className='input-item'
                        prefix={<SearchOutlined />}
                    />
                </div>

                <List
                    dataSource={conversations}
                    renderItem={user => (
                        <List.Item 
                            className="inbox-user-item" 
                            onClick={() => setCurrentUser(user)}
                        >
                            <div className="user-bar">
                                <Avatar src={user.avatar} />
                                <span className="user-name">{user.name}</span>
                            </div>
                        </List.Item>
                    )}
                />
            </Sider>
            
            <Layout className="inbox-chat">
                <div className="inbox-chat-header">
                    <Avatar className="avatar" src={currentUser.avatar} />
                    <div className="user-info">{currentUser.name}</div>
                </div>
                
                <Content className="inbox-chat-box">
                    {messages.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`chat-message ${msg.sender === 'You' ? 'sent' : 'received'}`}
                        >
                            {/* Hiển thị ảnh nếu có */}
                            {msg.images && (
                                <div className="image-inbox">
                                    {msg.images.map((image, i) => (
                                        <Image 
                                            width={90} height={120} 
                                            key={i} src={image} alt={`uploaded-${i}`} 
                                            className="image-inbox-preview" 
                                        />
                                    ))}
                                </div>
                            )}
                            {/* Hiển thị văn bản tin nhắn dưới ảnh */}
                            {msg.text && <div>{msg.text}</div>}
                        </div>
                    ))}
                </Content>
                
                <Footer className="inbox-chat-input">
                    {/* Hiển thị ảnh đã chọn trên cùng */}
                    {images.length > 0 && (
                        <div className="image-preview-container">
                            {images.map((image, index) => (
                                <div key={index} className="image-preview-item">
                                    <img 
                                        src={image} alt={`preview-${index}`} 
                                        className="image-preview" 
                                    />
                                    <Tooltip title='Xóa ảnh'>
                                        <CloseCircleOutlined
                                            onClick={() => removeImage(index)}
                                            style={{
                                                color: 'red',
                                                cursor: 'pointer',
                                                position: 'absolute',
                                                top: '5px',
                                                right: '5px',
                                            }}
                                        />
                                    </Tooltip>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="group1">
                        <label htmlFor="upload-image" className='upload'>
                            <Tooltip title='Tải ảnh lên'>
                                <PictureOutlined style={{ fontSize: '24px' }} />
                            </Tooltip>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageUpload}
                            id="upload-image"
                            multiple // Cho phép chọn nhiều ảnh
                        />

                        <Input
                            className="input-item"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onPressEnter={sendMessage}
                            placeholder="Nhập tin nhắn..."
                        />

                        <Button 
                            className="btn-import" type="primary" 
                            icon={<SendOutlined />} onClick={sendMessage}
                        >
                            Gửi
                        </Button>
                    </div>
                </Footer>
            </Layout>
        </Layout>
    );
};

export default Inbox;
