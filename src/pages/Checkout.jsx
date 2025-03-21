import React, { useEffect, useState } from "react";
import { cartServices } from "../services/cart";
import { OrderService } from "../services/order";
import { message, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { ValuesServices } from "../services/attribute_value";
import { paymentServices } from "./../services/payments";
import { productsServices } from "./../services/product";
import { AuthServices } from "./../services/auth";

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
  const cartItemsToDisplay = Array.isArray(cartItems) ? cartItems : [];

  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState({
    fullname: "",
    email: "",
    phone_number: "",
    address: "",
  });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchCartData = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));

      if (storedUser?.id) {
        // Nếu đã đăng nhập => Lấy giỏ hàng từ API
        try {
          const cartData = await cartServices.fetchCart();
          setCartItems(cartData);
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu giỏ hàng từ API:", error);
        }
      } else {
        // Nếu chưa đăng nhập => Lấy giỏ hàng từ localStorage
        const localCartData =
          JSON.parse(localStorage.getItem("cart_items")) || [];

        // Fetch thông tin sản phẩm từ API
        const updatedCartItems = await Promise.all(
          localCartData.map(async (item) => {
            try {
              const productDetails = await productsServices.fetchProductById(
                item.product_id
              );

              let variantDetails = null;

              if (item.product_variant_id) {
                variantDetails = productDetails.data.variants.find(
                  (v) => v.id === item.product_variant_id
                );
              }

              // Giá ưu tiên variant, nếu không thì lấy giá của sản phẩm gốc
              const price = variantDetails
                ? variantDetails.sale_price || variantDetails.sell_price
                : productDetails.data.sale_price ||
                  productDetails.data.sell_price;

              return {
                ...item,
                product: productDetails.data,
                product_variant: variantDetails,
                price,
              };
            } catch (error) {
              console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
              return {
                ...item,
                product: null,
                product_variant: null,
                price: 0,
              };
            }
          })
        );

        console.log("✅ Giỏ hàng local đã cập nhật:", updatedCartItems);
        setCartItems(updatedCartItems);
      }
    };

    fetchCartData();
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

  const subtotal = Array.isArray(cartItems)
    ? cartItems.reduce((total, item) => {
        // Lấy giá sản phẩm từ biến thể nếu có
        const productPrice = item.product_variant
          ? item.product_variant.sale_price ||
            item.product_variant.sell_price ||
            0
          : item.product?.sale_price || item.product?.sell_price || 0;

        return total + productPrice * (item.quantity || 1);
      }, 0)
    : 0;

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
      setIsPaymentModalOpen(false);

      // Kiểm tra nếu người dùng chưa chọn phương thức thanh toán
      if (!selectedPayment) {
        message.error("Vui lòng chọn phương thức thanh toán!");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user ? user.id : null;

      // Nếu là khách vãng lai và chọn COD, sẽ báo lỗi
      if (!userId && selectedPayment === 2) {
        message.error("Khách vãng lai chỉ có thể thanh toán qua VNPay");
        return;
      }

      const orderData = {
        user_id: userId || null,
        fullname: userData.fullname,
        email: userData.email,
        phone_number: userData.phone_number,
        address: userData.address,
        total_amount: subtotal,
        payment_method:
          selectedPayment === 2 ? "cod" : selectedPayment === 1 ? "vnpay" : "",
        products: cartItems.map((item) => ({
          product_id: item.product_id,
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
          price:
            item.product_variant?.sale_price || item.product?.sale_price || 0,
        })),
      };

      const orderResponse = await OrderService.placeOrder(orderData);

      console.log("orderResponse:", orderResponse);

      // Nếu có URL thanh toán từ VNPay, chuyển hướng người dùng
      if (orderResponse?.payment_url) {
        window.location.href = orderResponse.payment_url;
        return;
      }

      if (orderResponse?.message === "Đặt hàng thành công!") {
        message.success("🎉 Đơn hàng đã đặt thành công!");
        setCartItems([]);
        localStorage.removeItem("cartAttributes");
        sessionStorage.removeItem("cart");
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

  useEffect(() => {
    const fetchUserAddress = async () => {
      if (userId) {
        try {
          const addressData = await AuthServices.getAddressByIdUser(userId); // Lấy địa chỉ từ userId
          console.log("addressData:", addressData); // Log dữ liệu địa chỉ để kiểm tra
          if (addressData) {
            setDetailaddress(addressData.detail_address); // Cập nhật detail_address vào state
            setUserData((prevData) => ({
              ...prevData,
              address: addressData.detail_address, // Address data properly updated here
            }));
            setDetailaddress(addressData.detail_address); // Make sure to update the detailaddress state directly
          }
        } catch (error) {
          console.error("Lỗi khi lấy địa chỉ:", error);
        }
      }
    };

    fetchUserAddress();
  }, [userId]);

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
                          {cartItemsToDisplay.map((item) => (
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
                                {formatCurrency(
                                  item.product_variant
                                    ? item.product_variant.sale_price ||
                                        item.product_variant.sell_price
                                    : item.product?.sale_price ||
                                        item.product?.sell_price
                                )}
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
              className="btn btn-primary"
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
          <p>Chọn phương thức thanh toán :</p>
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
                    disabled={!userId && method.name.toLowerCase() === "cod"} // Vô hiệu hóa COD nếu là khách vãng lai
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
        </Modal>
      </main>
    </div>
  );
};

export default Checkout;
