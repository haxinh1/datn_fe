import React from 'react';
import { MessageOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const ChatIcon = ({ onClick }) => {
  return (
    <Button
      type="primary"
      shape="circle"
      icon={
        <MessageOutlined 
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '24px', 
            fontWeight: 'normal', 
            letterSpacing: 'normal', 
            color: 'white', 
            margin: 0, 
          }}
        />
      }
      size="large"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        bottom: '50px',
        right: '20px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
      }}
      onClick={onClick}
    />
  );
};

export default ChatIcon;