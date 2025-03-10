import React, { useEffect, useState } from "react";
import { cartServices } from "../services/cart";
import { OrderService } from "../services/order";
import { message, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { ValuesServices } from "../services/attribute_value";
import { paymentServices } from "./../services/payments";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const nav = useNavigate();
  const [attributeValues, setAttributeValues] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [detailaddress, setDetailaddress] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payMents, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    // Lấy userId và thông tin người dùng từ localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.id) {
      setUserId(storedUser.id);
      setUserData({
        fullname: storedUser.fullname || "", // Lấy fullname từ user
        email: storedUser.email || "", // Lấy email từ user
        phone_number: storedUser.phone_number || "", // Lấy phone_number từ user
        address: storedUser.address || "", // Nếu có address, bạn có thể thêm vào
      });
    }
  }, []);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then((res) => res.json())
      .then((data) => {
        setProvinces(data);
        setLoading(false);
      });
  }, []);

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    const province = provinces.find((p) => p.code === Number(provinceCode));

    setSelectedProvince(provinceCode);
    setDistricts(province ? province.districts : []);
    setWards([]);
    setSelectedDistrict("");
    setSelectedWard("");
  };

  const handleDistrictChange = (e) => {
    const districtCode = e.target.value;
    const district = districts.find((d) => d.code === Number(districtCode));

    setSelectedDistrict(districtCode);
    setWards(district ? district.wards : []);
    setSelectedWard("");
  };

  const handleWardChange = (e) => {
    setSelectedWard(e.target.value);
  };

  // Tạo chuỗi địa chỉ theo định dạng mong muốn
  const formattedAddress =
    `${detailaddress}, ` +
    `${
      selectedWard
        ? wards.find((w) => w.code === Number(selectedWard))?.name
        : ""
    }, ` +
    `${
      selectedDistrict
        ? districts.find((d) => d.code === Number(selectedDistrict))?.name
        : ""
    }, ` +
    `${
      selectedProvince
        ? provinces.find((p) => p.code === Number(selectedProvince))?.name
        : ""
    }, `;

  // Cập nhật userData.address mỗi khi `formattedAddress` thay đổi
  useEffect(() => {
    setUserData((prevData) => ({
      ...prevData,
      address: formattedAddress, // Gán địa chỉ đã định dạng vào userData
    }));
  }, [formattedAddress]);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (
      !userData.fullname ||
      !userData.email ||
      !userData.phone_number ||
      !userData.address
    ) {
      message.error("Vui lòng điền đầy đủ thông tin nhận hàng!");
      return;
    }

    if (!userId) {
      message.error("Không tìm thấy user_id, vui lòng đăng nhập lại!");
      return;
    }

    setIsPaymentModalOpen(true); // Mở modal để chọn phương thức thanh toán
  };

  // const handlePayment = async () => {
  //   if (!selectedPayment) {
  //     setErrorMessage("Vui lòng chọn phương thức thanh toán.");
  //     return;
  //   }

  //   if (selectedPayment === 1) {
  //     setSuccessMessage("Thanh toán thành công!");
  //     navigate("/thanks"); // Use navigate to redirect to /thanks
  //     return;
  //   }

  //   setLoading(true);
  //   setErrorMessage(null);

  //   try {
  //     const paymentData = {
  //       orderId,
  //       paymentMethod: selectedPayment === 2 ? "vnpay" : "",
  //       paymentId: selectedPayment,
  //       bankCode: null,
  //     };

  //     console.log("🔍 Data being sent to API:", paymentData);

  //     const response = await paymentServices.createPaymentVNP(paymentData);

  //     if (response && response.data.payment_url) {
  //       console.log("✅ Redirecting to:", response.data.payment_url);
  //       window.location.href = response.data.payment_url;
  //     } else {
  //       setErrorMessage("Lỗi tạo liên kết thanh toán.");
  //     }
  //   } catch (error) {
  //     console.error("❌ Payment error:", error.response?.data || error);
  //     setErrorMessage(
  //       error.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại."
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const payData = await paymentServices.getPayment();
        setPayments(payData);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        setErrorMessage("Không thể lấy phương thức thanh toán.");
      }
    };
    fetchPayments();
  }, []);

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

  const handleConfirmPayment = async () => {
    try {
      setIsPaymentModalOpen(false); // Đóng modal

      if (!selectedPayment) {
        message.error("Vui lòng chọn phương thức thanh toán!");
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
      const orderResponse = await OrderService.placeOrder(orderData);

      if (orderResponse?.message === "Đặt hàng thành công!") {
        const orderId = orderResponse?.order?.id;
        if (selectedPayment === 2) {
          // Nếu chọn VNPAY, gọi API tạo thanh toán
          const paymentData = {
            orderId,
            paymentMethod: "vnpay",
            paymentId: selectedPayment,
            bankCode: null,
          };

          console.log("🔍 Gửi dữ liệu đến VNPAY:", paymentData);
          const response = await paymentServices.createPaymentVNP(paymentData);

          if (response && response.data.payment_url) {
            console.log(
              "✅ Chuyển hướng đến VNPAY:",
              response.data.payment_url
            );
            window.location.href = response.data.payment_url;
            return; // Dừng tại đây, không hiển thị thông báo ngay
          } else {
            message.error("Lỗi tạo liên kết thanh toán.");
            return;
          }
        }

        // Nếu không phải VNPAY, hiển thị thông báo đặt hàng thành công
        message.success("🎉 Đơn hàng của bạn đã được đặt thành công!");
        setCartItems([]);
        localStorage.removeItem("cartAttributes");
      } else {
        message.error(orderResponse?.message || "Lỗi không xác định");
      }
    } catch (error) {
      console.error("❌ Lỗi khi đặt hàng:", error);
      message.error("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const getAttributeValue = (product) => {
    const attributes = JSON.parse(localStorage.getItem("cartAttributes")) || [];

    // Tìm đúng sản phẩm có cùng `product_id` và `product_variant_id`
    const productAttributes = attributes.find(
      (attr) =>
        attr.product_id === product.product_id &&
        attr.product_variant_id === product.product_variant_id
    );

    if (!productAttributes || !productAttributes.attributes) {
      return "Không xác định";
    }

    return productAttributes.attributes
      .map((attr) => {
        if (!attributeValues?.data) return "Không xác định";
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
                          value={userData.fullname} // Lấy fullname từ userData
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

                    <div className="form-group">
                      <label for="province">Tỉnh/Thành phố</label>
                      <select
                        id="province"
                        class="form-control"
                        onChange={handleProvinceChange}
                        value={selectedProvince}
                        required
                      >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label for="district">Quận/Huyện</label>
                      <select
                        id="district"
                        class="form-control"
                        onChange={handleDistrictChange}
                        value={selectedDistrict}
                        required
                        disabled={!selectedProvince}
                      >
                        <option value="">Chọn quận/huyện</option>
                        {districts.map((district) => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label for="ward">Phường/Xã</label>
                      <select
                        id="ward"
                        class="form-control"
                        onChange={handleWardChange}
                        value={selectedWard}
                        required
                        disabled={!selectedDistrict}
                      >
                        <option value="">Chọn phường/xã</option>
                        {wards.map((ward) => (
                          <option key={ward.code} value={ward.code}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Địa chỉ cụ thể</label>
                      <input
                        type="text"
                        className="form-control"
                        value={detailaddress}
                        onChange={(e) => setDetailaddress(e.target.value)}
                      />
                    </div>
                  </div>

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
                                {item.product_variant_id && (
                                  <span className="text-muted">
                                    ({getAttributeValue(item)})
                                  </span>
                                )}
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
                        onClick={() => setIsPaymentModalOpen(true)}
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
        <Modal
          title="Thanh Toán"
          visible={isPaymentModalOpen}
          onCancel={() => setIsPaymentModalOpen(false)}
          footer={[
            <button
              className="btn btn-primary "
              key="cancel"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              Hủy
            </button>,
            <button
              key="pay"
              className="btn btn-success"
              onClick={handleConfirmPayment}
            >
              Xác nhận thanh toán
            </button>,
          ]}
        >
          <p>Chọn phương thức thanh toán:</p>
          <div className="d-block my-3">
            {payMents.length > 0 ? (
              payMents.map((method) => (
                <div key={method.id} className="custom-control custom-radio">
                  <input
                    className="custom-control-input"
                    id={`httt-${method.id}`}
                    name="paymentMethod"
                    type="radio"
                    value={method.id}
                    checked={selectedPayment === method.id}
                    onChange={() => setSelectedPayment(method.id)}
                    required
                  />
                  <label
                    className="custom-control-label"
                    htmlFor={`httt-${method.id}`}
                  >
                    {method.name}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-center font-italic">
                Loading payment methods...
              </p>
            )}
          </div>

          <hr className="mb-4" />
        </Modal>
      </main>
    </div>
  );
};

export default Checkout;
