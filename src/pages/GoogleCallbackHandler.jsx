import { message } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cartServices } from "../services/cart";

const GoogleCallbackHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Sử dụng IIFE để xử lý async trong useEffect
    (async () => {
      const query = new URLSearchParams(window.location.search);
      const token = query.get("token");
      const encodedUser = query.get("user");

      // Debug: Ghi log các query parameters
      console.log("Query parameters:", { token, encodedUser });

      if (token && encodedUser) {
        try {
          // Giải mã và parse user
          const decodedUser = decodeURIComponent(encodedUser);
          console.log("Decoded user:", decodedUser);
          const user = JSON.parse(decodedUser);

          // Kiểm tra xem user có id không
          if (!user?.id) {
            throw new Error("User object does not contain id");
          }

          // Lưu vào localStorage
          localStorage.setItem("client_token", token);
          localStorage.setItem("client", JSON.stringify(user));
          localStorage.setItem("user", JSON.stringify(user));

          // Gộp giỏ hàng từ localStorage lên server
          const localCart = JSON.parse(localStorage.getItem("cart_items")) || [];
          const localCartAttributes = JSON.parse(localStorage.getItem("cartAttributes")) || [];
          if (localCart.length > 0) {
            for (let item of localCart) {
              // Tìm attributes tương ứng cho sản phẩm
              const matchingAttributes = localCartAttributes.find(
                (attr) =>
                  attr.product_id === item.product_id &&
                  attr.product_variant_id === item.product_variant_id
              );

              const cartItem = {
                user_id: user.id,
                product_id: item.product_id,
                product_variant_id: item.product_variant_id,
                quantity: item.quantity,
                attributes: matchingAttributes ? matchingAttributes.attributes : [],
              };

              // Sử dụng await trong IIFE
              await cartServices.addCartItem(item.product_id, cartItem);
            }
            // Xóa giỏ hàng và attributes trong localStorage sau khi gộp
            localStorage.removeItem("cart_items");
            localStorage.removeItem("cartAttributes");
          }

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
    })();
  }, [navigate]);

  return <p>Đang xử lý đăng nhập Google...</p>;
};

export default GoogleCallbackHandler;