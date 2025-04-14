import React, { useState } from "react";
import { Button } from "antd";
import { Link, useLocation } from "react-router-dom";
import thankyouImage from "../assets/images/thanks.png";


const Thankyoupage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const momoOrderInfo = query.get("momo_OrderInfo");
  const momoAmount = query.get("momo_Amount");
  const momoResponseCode = query.get("momo_ResponseCode");
  const momoPaymentType = query.get("momo_PaymentType");

  const orderInfo = query.get("vnp_OrderInfo") || momoOrderInfo;
  const orderId = orderInfo ? orderInfo.split(" ").pop() : "Không có thông tin";

  const formatCurrency = (amount) =>
    `${Number(amount).toLocaleString("vi-VN")} VNĐ`;

  const totalAmount = query.get("vnp_Amount")
    ? formatCurrency(Number(query.get("vnp_Amount")) / 100)
    : momoAmount
      ? formatCurrency(Number(momoAmount))
      : "Không có thông tin";

  const paymentStatus = query.get("vnp_ResponseCode") || momoResponseCode;
  const paymentMethod = query.get("vnp_CardType") || momoPaymentType;

  const customerEmail = "";
  const customerName = "";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff", // Nền trắng
        paddingTop: "50px",
        paddingBottom: "50px",
      }}
    >
      <div className="container d-flex justify-content-center align-items-center">
        <div
          className="shadow rounded d-flex flex-column flex-md-row overflow-hidden"
          style={{
            background: "#fff",
            maxWidth: "900px",
            width: "100%",
            border: "1px solid #d4ecfa",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          {/* Left: Image Section */}
          <div
            className="d-flex align-items-center justify-content-center p-4"
            style={{ backgroundColor: "#fef4ee", flex: "1" }}
          >
            <img
              src={thankyouImage}
              alt="Cảm ơn bạn"
              className="img-fluid"
              style={{ maxHeight: "280px" }}
            />
          </div>

          {/* Right: Content Section */}
          <div className="p-4 p-md-5 flex-grow-1">
            <header className="text-center mb-4">
              <h1 style={{ color: "#f28500", fontWeight: "bold" }}>
                MOLLA SHOP
              </h1>
              <h3 className="text-success mt-2">THANH TOÁN THÀNH CÔNG</h3>

              <p
                className="mt-3"
                style={{
                  fontFamily: "'Times New Roman', Times, serif",
                  color: "#000",
                  fontSize: "1.5rem",
                  fontWeight: 500,
                  lineHeight: "1.6",
                }}
              >
                Cảm ơn{" "}
                <strong>{customerName || "quý khách"}</strong> đã đặt hàng tại{" "}
                <strong>Molla Shop</strong>.
                <br />
                ❤️ Vui lòng kiểm tra email của bạn để xem thêm thông tin của đơn hàng.
              </p>
            </header>

            <section className="mb-4">
              <h4 className="mb-3">🧾 THÔNG TIN ĐƠN HÀNG</h4>
              <ul className="list-unstyled" style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: "1.4rem", color: "#000" }}>
                <li className="mb-2">
                  <strong>Mã đơn hàng:</strong> {orderId}
                </li>
                <li className="mb-2">
                  <strong>Tổng tiền:</strong> {totalAmount}
                </li>
                <li className="mb-2">
                  <strong>Phương thức thanh toán:</strong>{" "}
                  {paymentMethod || "Không có thông tin"}
                </li>
                <li className="mb-2">
                  <strong>Trạng thái thanh toán:</strong>{" "}
                  {paymentStatus === "00" || paymentStatus === "0"
                    ? "Thành công"
                    : "Thất bại"}
                </li>
              </ul>
            </section>

            <div
              className="alert alert-info text-center mx-auto"
              style={{
                maxWidth: "600px",
                padding: "6px 12px",
                margin: "12px auto",
                fontFamily: "'Times New Roman', Times, serif",
                fontSize: "1.2rem",
                color: "#fff",
                lineHeight: "1.6",
              }}
            >
              Mọi thắc mắc về đơn hàng vui lòng liên hệ số hotline:{" "}
              <strong>09100204</strong> hoặc gửi thư vào địa chỉ{" "}
              <strong>hotro@mollashop.com</strong>
            </div>

            <div className="text-center mt-4">
              <p
                className="mb-3"
                style={{
                  fontFamily: "'Times New Roman', Times, serif",
                  fontSize: "1.5rem",
                  fontWeight: 500,
                  color: "#000",
                }}
              >
                Trân trọng cảm ơn và hẹn gặp lại! 💖
              </p>
              <Link to="/">
                <Button
                  type="primary"
                  size="large"
                  style={{
                    backgroundColor: "#f28500",
                    borderColor: "#eea287",
                    padding: "0 32px",
                    marginRight: "12px",
                    fontWeight: 600,
                  }}
                >
                  Quay về trang chủ
                </Button>

              </Link>

              <Link to="/">
                <Button
                  type="primary"
                  size="large"
                  style={{
                   
                    backgroundColor: "#f28500",
                    borderColor: "#eea287",
                    padding: "32 3px",
                    fontWeight: 600,
                  }}
                >
                  Xem thêm sản phẩm khác
                </Button>
              </Link>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Thankyoupage;
