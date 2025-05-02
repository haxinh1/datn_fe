import React from "react";
import { MessageOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import useAuth from "../../../hooks/useAuth"; // Import the useAuth hook

const ChatIcon = ({ onClick }) => {
  const { isLoggedIn } = useAuth(); // Get the login state from the hook

  const handleClick = () => {
    if (!isLoggedIn) {
      message.warning("Vui lòng đăng nhập để sử dụng chat");
      return;
    }
    onClick();
  };

  return (
    <Button
      type="primary"
      shape="circle"
      icon={
        <MessageOutlined
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "24px",
            fontWeight: "normal",
            letterSpacing: "normal",
            color: "white",
            margin: 0,
          }}
        />
      }
      size="large"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "fixed",
        bottom: "50px",
        right: "20px",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
        zIndex: 1000,
      }}
      onClick={handleClick}
      disabled={!isLoggedIn} // Disable the button if the user is not logged in
    />
  );
};

export default ChatIcon;