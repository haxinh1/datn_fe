import React, { useEffect, useState } from "react";
import { cartServices } from "../services/cart";
import { OrderService } from "../services/order";
import { Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { ValuesServices } from "../services/attribute_value";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const nav = useNavigate();
  const [attributeValues, setAttributeValues] = useState([]);

  const [userData, setUserData] = useState({
    fullname: "",
    email: "",
    phone_number: "",
    address: "",
  });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const cartData = await cartServices.fetchCart();
      setCartItems(cartData);
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Lấy userId từ localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.id) {
      setUserId(storedUser.id);
    }
  }, []);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    try {
      if (
        !userData.fullname ||
        !userData.email ||
        !userData.phone_number ||
        !userData.address
      ) {
        Modal.error({
          title: "Vui lòng điền đầy đủ thông tin nhận hàng!",
        });
        return;
      }

      if (!userId) {
        Modal.error({
          title: "Không tìm thấy user_id, vui lòng đăng nhập lại!",
        });
        return;
      }

      const orderData = {
        user_id: userId,
        fullname: userData.fullname,
        email: userData.email,
        phone_number: userData.phone_number,
        address: userData.address,
        total_amount: subtotal,
      };

      console.log("📦 Gửi đơn hàng với dữ liệu:", orderData);

      // Gọi API đặt hàng
      const orderResponse = await OrderService.placeOrder(orderData);
      console.log("✅ Kết quả phản hồi từ API:", orderResponse);

      if (orderResponse?.message === "Đặt hàng thành công!") {
        Modal.success({
          title: "🎉 Đơn hàng của bạn đã được đặt thành công!",
          onOk() {
            setCartItems([]);
            const orderId = orderResponse?.order?.id; // Check if order_id exists
            const totalAmount = orderData.total_amount;
            const fullName = userData.fullname;
            const Email = userData.email;
            const phoneNumber = userData.phone_number;
            const Address = userData.address;
            console.log("orderId from API response:", orderId);
            nav("/payments", {
              state: {
                orderId,
                totalAmount,
                fullName,
                Email,
                phoneNumber,
                Address,
              },
            });
          },
        });
      } else {
        Modal.error({
          title: "❌ Đặt hàng thất bại!",
          content: orderResponse?.message || "Lỗi không xác định",
        });
      }
    } catch (error) {
      console.error("❌ Lỗi khi đặt hàng:", error);
      Modal.error({
        title: "Có lỗi xảy ra, vui lòng thử lại.",
      });
    }
  };

  useEffect(() => {
    const fetchAttributeValues = async () => {
      try {
        const data = await ValuesServices.fetchValues(); // Gọi API từ services
        setAttributeValues(data);
        console.log("Dữ liệu attributeValues từ API:", data); // ✅ Log ra console
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu attribute values:", error);
      }
    };

    fetchAttributeValues();
  }, []);

  const getAttributeValue = (product) => {
    const attributes = JSON.parse(localStorage.getItem("cartAttributes")) || [];
    console.log("Dữ liệu từ localStorage:", attributes);
    console.log("Dữ liệu từ API attributeValues:", attributeValues);

    return attributes
      .map((attr) => {
        if (!attributeValues?.data) return "Không xác định"; // Kiểm tra nếu API chưa load
        const attribute = attributeValues.data.find(
          (av) => String(av.id) === String(attr.attribute_value_id)
        );
        return attribute ? attribute.value : "Không xác định";
      })
      .join(", ");
  };
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {}).format(value);
  };
  return (
    <div>
      <main className="main">
        <div
          className="page-header text-center"
          style={{ backgroundImage: "url('assets/images/page-header-bg.jpg')" }}
        >
          <div className="container">
            <h1 className="page-title">
              Checkout<span>Shop</span>
            </h1>
          </div>
        </div>

        <nav aria-label="breadcrumb" className="breadcrumb-nav">
          <div className="container">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="index.html">Home</a>
              </li>
              <li className="breadcrumb-item">
                <a href="#">Shop</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Checkout
              </li>
            </ol>
          </div>
        </nav>

        <div className="page-content">
          <div className="checkout">
            <div className="container">
              <div className="checkout-discount">
                <form onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="text"
                    className="form-control"
                    required
                    id="checkout-discount-input"
                  />
                  <label
                    for="checkout-discount-input"
                    className="text-truncate"
                  >
                    Have a coupon? <span>Click here to enter your code</span>
                  </label>
                </form>
              </div>
              <form action="#">
                <div className="row">
                  <div className="col-lg-9">
                    <h2 className="checkout-title">Billing Details</h2>
                    <div className="row">
                      <div className="col-sm-6">
                        <label>Họ và tên: </label>
                        <input
                          className="form-control"
                          type="text"
                          name="fullname"
                          value={userData.fullname}
                          required
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              fullname: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="col-sm-6">
                        <label>Số điện thoại</label>
                        <input
                          type="text"
                          className="form-control"
                          name="phone_number"
                          value={userData.phone_number}
                          required
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              phone_number: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <label>Email:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="email"
                      value={userData.email}
                      required
                      onChange={(e) =>
                        setUserData({ ...userData, email: e.target.value })
                      }
                    />

                    <label>Địa chỉ nhận hàng</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={userData.address}
                      required
                      onChange={(e) =>
                        setUserData({ ...userData, address: e.target.value })
                      }
                    />
                  </div>
                  {/* <div className="input-group">
                    <input
                      className="form-control"
                      placeholder="Mã khuyến mãi"
                      type="text"
                    />
                    <div className="input-group-append">
                      <button className="btn btn-secondary" type="submit">
                        Xác nhận
                      </button>
                    </div>
                  </div> */}

                  <aside className="col-lg-3">
                    <div
                      className="summary"
                      style={{
                        fontSize: "1.2rem",
                        padding: "20px",
                        backgroundColor: "#f9f9f9",
                        borderRadius: "8px",
                        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <h3
                        className="summary-title"
                        style={{
                          fontSize: "1.6rem",
                          fontWeight: "bold",
                          textAlign: "center",
                          marginBottom: "15px",
                        }}
                      >
                        Your Order
                      </h3>

                      <table
                        className="table table-summary"
                        style={{ width: "100%", backgroundColor: "white" }}
                      >
                        <thead
                          style={{
                            backgroundColor: "#f1f1f1",
                            fontSize: "1.1rem",
                          }}
                        >
                          <tr>
                            <th style={{ textAlign: "left", padding: "10px" }}>
                              Product
                            </th>
                            <th style={{ textAlign: "right", padding: "10px" }}>
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Danh sách sản phẩm */}
                          {cartItems.map((item) => (
                            <tr key={item.id}>
                              <td style={{ padding: "10px" }}>
                                {item.product?.name || `Sản phẩm #${item.id}`}{" "}
                                <span className="text-muted">
                                  ({getAttributeValue(item)})
                                </span>
                                (x{item.quantity})
                              </td>
                              <td
                                style={{ textAlign: "right", padding: "10px" }}
                              >
                                {formatCurrency(item.price)}VNĐ
                                {/* {item.price.toLocaleString()} VND */}
                              </td>
                            </tr>
                          ))}

                          {/* Subtotal */}
                          <tr
                            className="summary-subtotal"
                            style={{ fontSize: "1.1rem", fontWeight: "bold" }}
                          >
                            <td style={{ padding: "10px" }}>Subtotal:</td>
                            <td style={{ textAlign: "right", padding: "10px" }}>
                              {subtotal.toLocaleString()} VND
                            </td>
                          </tr>

                          {/* Shipping */}
                          <tr
                            style={{ fontSize: "1.1rem", fontWeight: "bold" }}
                          >
                            <td style={{ padding: "10px" }}>Shipping:</td>
                            <td
                              style={{
                                textAlign: "right",
                                padding: "10px",
                                color: "green",
                              }}
                            >
                              Free shipping
                            </td>
                          </tr>

                          {/* Tổng tiền */}
                          <tr
                            className="summary-total"
                            style={{
                              backgroundColor: "#f8f8f8",
                              fontSize: "1rem",
                              fontWeight: "bold",
                            }}
                          >
                            <td style={{ padding: "10px" }}>Total:</td>
                            <td
                              style={{
                                textAlign: "right",
                                padding: "10px",
                                color: "red",
                              }}
                            >
                              {subtotal.toLocaleString()} VND
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <button
                        type="button"
                        className="btn btn-primary btn-block"
                        style={{
                          fontSize: "1.2rem",
                          padding: "12px",
                          fontWeight: "bold",
                          marginTop: "15px",
                          width: "100%",
                          borderRadius: "6px",
                        }}
                        onClick={handlePlaceOrder}
                      >
                        Đến trang thanh toán
                      </button>
                    </div>
                  </aside>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
