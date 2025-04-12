import React from 'react';
import { MessageOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const ChatIcon = ({ onClick }) => {
  return (
    <Button
      type="primary"
      shape="circle"
      icon={
        <MessageOutlined style={{ fontSize: '24px' }} />
      }
      size="large"
      style={{
        padding: "10px",
        position: "fixed",
        bottom: "50px",
        right: "20px",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
        color: "white",
        zIndex: 1000
      }}
      onClick={onClick}
    />
  );
};

export default ChatIcon;