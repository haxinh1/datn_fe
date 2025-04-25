import { message } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GoogleCallbackHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");
    const encodedUser = query.get("user");

    // Debug: Ghi log các query parameters
    console.log("Query parameters:", { token, encodedUser });

    if (token && encodedUser) {
      try {
        // Giải mã và parse user
        const decodedUser = decodeURIComponent(encodedUser);
        console.log("Decoded user:", decodedUser); // Debug
        const user = JSON.parse(decodedUser);

        // Kiểm tra xem user có id không
        if (!user?.id) {
          throw new Error("User object does not contain id");
        }

        // Lưu vào localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Phát sự kiện user-login để thông báo cho Header
        window.dispatchEvent(new Event("user-login"));

        // Chuyển hướng đến dashboard với user id
        navigate(`/dashboard/orders/${user.id}`, { replace: true });
        message.success("Đăng nhập bằng Google thành công!");
      } catch (err) {
        console.error("Lỗi khi xử lý user từ query:", err);
        message.error("Không thể xử lý thông tin đăng nhập Google. Vui lòng thử lại.");
        navigate("/logincl", { replace: true });
      }
    } else {
      console.warn("Thiếu token hoặc user trong query parameters");
      message.error("Dữ liệu đăng nhập Google không hợp lệ.");
      navigate("/logincl", { replace: true });
    }

    // Xóa query parameters khỏi URL để làm sạch
    window.history.replaceState(null, "", window.location.pathname);
  }, [navigate]);

  return <p>Đang xử lý đăng nhập Google...</p>;
};

export default GoogleCallbackHandler;