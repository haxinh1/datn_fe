// import React from "react";
// import { Link, useLocation } from "react-router-dom";

// const Thankyoupage = () => {
//   const location = useLocation(); // Get the current location
//   const query = new URLSearchParams(location.search); // Parse query parameters

//   // Extract data from query parameters
//   const orderId = query.get("vnp_TxnRef"); // Transaction reference (order ID)
//   const totalAmount = query.get("vnp_Amount"); // Amount paid
//   const paymentStatus = query.get("vnp_ResponseCode"); // Payment status
//   const paymentMethod = query.get("vnp_CardType"); // Payment method
//   const orderInfo = query.get("vnp_OrderInfo"); // Order Info
//   const customerEmail = ""; // You can add logic to get customer's email if necessary
//   const customerName = ""; // You can extract the customer name if it's in the order details

//   return (
//     <div className="container mt-5">
//       <div
//         className="border rounded p-4"
//         style={{
//           backgroundColor: "#f8d3e0",
//           maxWidth: "600px",
//           margin: "auto",
//         }}
//       >
//         <header className="text-center mb-4">
//           <h1 className="text-primary">YOUR LOGO</h1>
//           <h2>THANH TOÁN THÀNH CÔNG</h2>
//           <p>
//             Cảm ơn <strong>{customerName || "Người dùng"}</strong> đã đặt hàng
//             tại Molla Shop. Dưới đây là thông tin đơn hàng của bạn.
//             <strong>
//               Vui lòng kiểm tra email của bạn để biết thêm chi tiết.
//             </strong>
//           </p>
//         </header>

//         <section className="mb-4">
//           <h3>THÔNG TIN ĐƠN HÀNG</h3>
//           <ul className="list-unstyled">
//             <li>
//               Mã đơn hàng: <strong>{orderId || "Không có thông tin"}</strong>
//             </li>
//             <li>
//               Tổng tiền:{" "}
//               <strong>
//                 {totalAmount
//                   ? (Number(totalAmount) / 100).toLocaleString("en-US", {
//                       style: "currency",
//                       currency: "VND",
//                     })
//                   : "Không có thông tin"}
//               </strong>
//             </li>
//             <li>
//               Phương thức thanh toán:{" "}
//               <strong>{paymentMethod || "Không có thông tin"}</strong>
//             </li>
//             <li>
//               Trạng thái thanh toán:{" "}
//               <strong>
//                 {paymentStatus === "00" ? "Thành công" : "Thất bại"}
//               </strong>
//             </li>
//           </ul>
//         </section>

//         {/* <section className="mb-4">
//           <h3>THÔNG TIN KHÁCH HÀNG</h3>
//           <ul className="list-unstyled">
//             <li>
//               Họ tên khách hàng: <strong>{customerName || "Người dùng"}</strong>
//             </li>
//             <li>
//               Địa chỉ Email:{" "}
//               <strong>{customerEmail || "Không có thông tin"}</strong>
//             </li>
//           </ul>
//         </section> */}

//         <footer className="text-center mt-4">
//           <p>
//             Mọi thắc mắc về đơn hàng vui lòng liên hệ số hotline:{" "}
//             <strong>0900000000</strong> hoặc gửi thư vào địa chỉ{" "}
//             <strong>hotro@congtyabc.com</strong> để được giải đáp.
//           </p>
//           <p>Trân trọng cảm ơn</p>
//         </footer>

//         {/* Centered link button */}
//         <div className="text-center mt-3">
//           <Link to="/" className="btn btn-primary">
//             Quay về trang chủ
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Thankyoupage;

import React from "react";
import { Link, useLocation } from "react-router-dom";

const Thankyoupage = () => {
  const location = useLocation(); // Get the current location
  const query = new URLSearchParams(location.search); // Parse query parameters

  // Extract data from query parameters
  const orderInfo = query.get("vnp_OrderInfo"); // This contains the order information
  const orderId = orderInfo ? orderInfo.split(" ").pop() : "Không có thông tin"; // Extract order ID from the last part after splitting
  const totalAmount = query.get("vnp_Amount"); // Amount paid
  const paymentStatus = query.get("vnp_ResponseCode"); // Payment status
  const paymentMethod = query.get("vnp_CardType"); // Payment method
  const customerEmail = ""; // Logic to get customer's email if needed
  const customerName = ""; // Logic to get customer's name if needed

  return (
    <div className="container mt-5">
      <div
        className="border rounded p-4"
        style={{
          backgroundColor: "#A2DFF7",
          maxWidth: "600px",
          margin: "auto",
        }}
      >
        <header className="text-center mb-4">
          <h1 className="text-primary">MOLLA SHOP</h1>
          <h2>THANH TOÁN THÀNH CÔNG</h2>
          <p>
            Cảm ơn <strong>{customerName || "Người dùng"}</strong> đã đặt hàng
            tại Molla Shop. Dưới đây là thông tin đơn hàng của bạn.
            <strong>
              Vui lòng kiểm tra email của bạn để biết thêm chi tiết.
            </strong>
          </p>
        </header>

        <section className="mb-4">
          <h3>THÔNG TIN ĐƠN HÀNG</h3>
          <ul className="list-unstyled">
            <li>
              Mã đơn hàng: <strong>{orderId || "Không có thông tin"}</strong>
            </li>
            <li>
              Tổng tiền:{" "}
              <strong>
                {totalAmount
                  ? (Number(totalAmount) / 100).toLocaleString("en-US", {
                      style: "currency",
                      currency: "VND",
                    })
                  : "Không có thông tin"}
              </strong>
            </li>
            <li>
              Phương thức thanh toán:{" "}
              <strong>{paymentMethod || "Không có thông tin"}</strong>
            </li>
            <li>
              Trạng thái thanh toán:{" "}
              <strong>
                {paymentStatus === "00" ? "Thành công" : "Thất bại"}
              </strong>
            </li>
          </ul>
        </section>

        {/* <section className="mb-4">
          <h3>THÔNG TIN KHÁCH HÀNG</h3>
          <ul className="list-unstyled">
            <li>
              Họ tên khách hàng: <strong>{customerName || "Người dùng"}</strong>
            </li>
            <li>
              Địa chỉ Email:{" "}
              <strong>{customerEmail || "Không có thông tin"}</strong>
            </li>
          </ul>
        </section> */}

        <footer className="text-center mt-4">
          <p>
            Mọi thắc mắc về đơn hàng vui lòng liên hệ số hotline:{" "}
            <strong>09100204</strong> hoặc gửi thư vào địa chỉ{" "}
            <strong>hotro@mollashop.com</strong> để được giải đáp.
          </p>
          <p>Trân trọng cảm ơn</p>
        </footer>

        {/* Centered link button */}
        <div className="text-center mt-3">
          <Link to="/" className="btn btn-primary">
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Thankyoupage;
