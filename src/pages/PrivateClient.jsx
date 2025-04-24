import { Navigate } from "react-router-dom";

const PrivateClient = ({ children }) => {
  const token = localStorage.getItem("token");

  // Kiểm tra xem có token hay không (người dùng đã đăng nhập)
  if (!token) {
    // Nếu chưa đăng nhập, chuyển hướng về trang login
    return <Navigate to="/logincl" />;
  }

  // Nếu đã đăng nhập, cho phép truy cập vào route yêu cầu
  return children;
};

export default PrivateClient;
