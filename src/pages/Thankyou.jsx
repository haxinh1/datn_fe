import { Button } from "antd";
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
// import { OrderService } from "./../services/order";

const Thankyoupage = () => {
  const location = useLocation(); // Get the current location
  const query = new URLSearchParams(location.search); // Parse query parameters

  // Extract data from query parameters
  const momoOrderInfo = query.get("momo_OrderInfo");
  const momoAmount = query.get("momo_Amount");
  const momoResponseCode = query.get("momo_ResponseCode");
  const momoPaymentType = query.get("momo_PaymentType");

  const orderInfo = query.get("vnp_OrderInfo") || momoOrderInfo;
  const orderId = orderInfo ? orderInfo.split(" ").pop() : "Không có thông tin";
  const totalAmount = query.get("vnp_Amount")
    ? (Number(query.get("vnp_Amount")) / 100).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      })
    : query.get("momo_Amount")
    ? Number(query.get("momo_Amount")).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      })
    : "Không có thông tin";

  const paymentStatus = query.get("vnp_ResponseCode") || momoResponseCode;
  const paymentMethod = query.get("vnp_CardType") || momoPaymentType;

  const customerEmail = ""; // Logic to get customer's email if needed
  const customerName = ""; // Logic to get customer's name if needed

  // Function to update order status
  // const updateOrderStatus = async () => {
  //   if (paymentStatus === "00" && orderId) {
  //     try {
  //       await OrderService.updateOrderStatus(orderId, { status_id: 2 });
  //       console.log(`Order status for order ID ${orderId} updated to 2.`);
  //     } catch (error) {
  //       console.error("Failed to update order status:", error.message);
  //     }
  //   }
  // };

  // useEffect(() => {
  //   updateOrderStatus();
  // }, [paymentStatus, orderId]);

  return (
    <div className="container mt-5">
      <div
        className="border rounded p-4"
        style={{
          backgroundColor: "#ffffff", // Nền trắng
          maxWidth: "600px",
          margin: "auto",
          border: "2px solid #A2DFF7", // Viền màu
        }}
      >
        <header className="text-center mb-4">
          <h1 className="text-primary">MOLLA SHOP</h1>
          <h2>THANH TOÁN THÀNH CÔNG</h2>
          <span>
            Cảm ơn <strong>{customerName || "quý khách"}</strong> đã đặt hàng
            tại Molla Shop. Dưới đây là thông tin đơn hàng của bạn.
            <strong>
              Vui lòng kiểm tra email của bạn để biết thêm chi tiết.
            </strong>
          </span>
        </header>

        <section className="mb-4">
          <h3>THÔNG TIN ĐƠN HÀNG</h3>
          <ul className="list-unstyled">
            <li>
              Mã đơn hàng: <strong>{orderId || "Không có thông tin"}</strong>
            </li>
            <li>
              Tổng tiền: <strong>{totalAmount || "Không có thông tin"}</strong>
            </li>
            <li>
              Phương thức thanh toán:{" "}
              <strong>{paymentMethod || "Không có thông tin"}</strong>
            </li>
            <li>
              Trạng thái thanh toán:{" "}
              <strong>
                {paymentStatus === "00" || "0" ? "Thành công" : "Thất bại"}
              </strong>
            </li>
          </ul>
        </section>

        <footer className="text-center mt-4">
          <span>
            Mọi thắc mắc về đơn hàng vui lòng liên hệ số hotline:{" "}
            <strong>09100204</strong> hoặc gửi thư vào địa chỉ{" "}
            <strong>hotro@mollashop.com</strong> để được giải đáp.
          </span>
          <hr />
          <span className="text-confirm">
            Trân trọng cảm ơn và hẹn gặp lại!
          </span>
        </footer>

        {/* Centered link button */}
        <div className="add">
          <Link to="/">
            <Button
              style={{ backgroundColor: "#eea287", color: "white" }}
              type="primary"
              htmlType="submit"
            >
              Quay về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Thankyoupage;
