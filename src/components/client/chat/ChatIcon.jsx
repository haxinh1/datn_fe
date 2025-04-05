import React from 'react';
import { MessageOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const ChatIcon = ({ onClick }) => {
  return (
    <Button
      type="primary"
      shape="circle"
      icon={<MessageOutlined />}
      size="large"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
      }}
      onClick={onClick}
    />
  );
};

export default ChatIcon;