import { message } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GoogleCallbackHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");
    const encodedUser = query.get("user");

    if (token && encodedUser) {
      try {
        const user = JSON.parse(decodeURIComponent(encodedUser));
        localStorage.setItem("client_token", token);
        localStorage.setItem("client", JSON.stringify(user));
        localStorage.setItem("user", JSON.stringify(user));

        // ✅ Chuyển về dashboard sau khi lưu xong
        navigate("/dashboard", { replace: true });
        message.success("Đăng nhập thành công!");
      } catch (err) {
        console.error("Lỗi khi xử lý user từ query:", err);
        navigate("/logincl");
      }
    } else {
      navigate("/logincl");
    }
  }, []);

  return <p>Đang xử lý đăng nhập Google...</p>;
};

export default GoogleCallbackHandler;
