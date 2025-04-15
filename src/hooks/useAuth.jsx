import { useEffect, useState } from "react";

const useAuth = () => {
  const [user, setUser] = useState(() => {
    // Lấy dữ liệu user từ sessionStorage khi khởi tạo state
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = sessionStorage.getItem("user");
      console.log("Dữ liệu từ sessionStorage:", storedUser); // Debug
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        console.log("Không có người dùng trong sessionStorage, chuyển hướng đến trang đăng nhập...");
        window.location.href = "/loginad"; // Redirect tới trang login nếu không có user
      }
    };

    checkAuth();

    // Lắng nghe thay đổi của sessionStorage
    window.addEventListener("storage", checkAuth);

    // Cleanup event listeners khi component bị unmount
    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return { user, isAdmin: user?.role === "admin" || user?.role === "manager" };
};

export default useAuth;