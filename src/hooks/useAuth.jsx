import { useEffect, useState } from "react";

const useAuth = () => {
  const [user, setUser] = useState(() => {
    // Lấy dữ liệu user từ localStorage khi khởi tạo state
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user");
      console.log("Dữ liệu từ localStorage:", storedUser); // Debug xem có lấy được không
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Nếu không có user, có thể redirect tới trang login (tùy thuộc vào yêu cầu của bạn)
        console.log(
          "Không có người dùng trong localStorage, chuyển hướng đến trang đăng nhập..."
        );
        window.location.href = "/loginad"; // Redirect tới trang login nếu không có user
      }
    };

    checkAuth();

    // Lắng nghe thay đổi của localStorage (đặc biệt khi đăng nhập)
    window.addEventListener("storage", checkAuth);

    // Xử lý xóa token khi người dùng đóng cửa sổ (hoặc tab)
    const handleBeforeUnload = () => {
      localStorage.removeItem("user"); // Xóa dữ liệu user khỏi localStorage khi đóng cửa sổ
      console.log("Đã xóa dữ liệu user khi đóng cửa sổ.");
    };

    // window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup event listeners khi component bị unmount
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []); // Chạy effect này một lần khi component được mount

  return { user, isAdmin: user?.role === "admin" || "manager" };
};

export default useAuth;
