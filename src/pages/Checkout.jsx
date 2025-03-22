import React, { useEffect, useState } from "react";
import { cartServices } from "../services/cart";
import { OrderService } from "../services/order";
import {
  Button,
  message,
  Modal,
  Radio,
  Skeleton,
  Table,
  Tooltip,
  Form,
  Select,
  Input,
  notification,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ValuesServices } from "../services/attribute_value";
import { paymentServices } from "./../services/payments";
import { productsServices } from "./../services/product";
import { AuthServices } from "../services/auth";
import { CheckOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
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

  const handleProvinceChange = (value) => {
    const province = provinces.find((p) => p.code === Number(value));
    setDistricts(province ? province.districts : []);
    setWards([]);
    form.setFieldsValue({ district: null, ward: null });
  };

  const handleDistrictChange = (value) => {
    const district = districts.find((d) => d.code === Number(value));
    setWards(district ? district.wards : []);
    form.setFieldsValue({ ward: null });
  };

  // thêm địa chỉ mới
  const { mutate } = useMutation({
    mutationFn: async (userData) => {
      const response = await AuthServices.addAddress(userData);
      return response;
    },
    onSuccess: (_, userData) => {
      notification.success({
        message: "Địa chỉ mới đã được thêm",
      });
      form.setFieldsValue();
      setIsModalVisible(false);
    },
    onError: (error) => {
      notification.error({
        message: "Thêm thất bại",
        description: error.message,
      });
    },
  });

  const handleAdd = (values) => {
    const formattedAddress = [
      values.ward
        ? wards.find((w) => w.code === Number(values.ward))?.name
        : "",
      values.district
        ? districts.find((d) => d.code === Number(values.district))?.name
        : "",
      values.province
        ? provinces.find((p) => p.code === Number(values.province))?.name
        : "",
    ]
      .filter(Boolean)
      .join(", ");

    const userData = {
      address: formattedAddress,
      detail_address: values.detail_address,
      id_default: values.id_default,
    };

    console.log("Dữ liệu gửi đi:", userData);
    mutate(userData);
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

      if (!selectedAddress && !userData.address) {
        message.error("Chưa có địa chỉ đặt hàng!");
        return;
      }
      const selectedAddressData = addresses.find(
        (address) => address.id === selectedAddress
      );

      // Nếu không tìm thấy địa chỉ đã chọn, thông báo lỗi
      if (!selectedAddressData && !userData.address) {
        message.error("Địa chỉ không hợp lệ!");
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
        address: selectedAddressData
          ? selectedAddressData.detail_address && selectedAddressData.address
          : userData.address, // Nếu là khách vãng lai thì lấy userData.address
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
    const fetchAddresses = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.id; // Lấy id từ localStorage

      if (userId) {
        try {
          const data = await AuthServices.getAddressByIdUser(userId); // Lấy địa chỉ người dùng
          setAddresses(data);

          // Tự động chọn địa chỉ mặc định nếu có
          const defaultAddress = data.find((address) => address.id_default);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress.id); // Đặt giá trị selectedAddress bằng id của địa chỉ mặc định
          }
        } catch (error) {
          console.error("Lỗi khi lấy địa chỉ:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAddresses();
  }, []);

  const handleAddressChange = (e) => {
    setSelectedAddress(e.target.value); // Lưu id địa chỉ đã chọn
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
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
                    {!userId ? (
                      <div>
                        <label>Địa chỉ giao hàng:</label>
                        <Input
                          value={userData.address} // Lấy giá trị từ userData.address
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              address: e.target.value, // Cập nhật địa chỉ mới vào userData
                            })
                          }
                          placeholder="Nhập địa chỉ giao hàng"
                        />
                      </div>
                    ) : (
                      addresses.length > 0 && (
                        <div>
                          <label>Chọn địa chỉ</label>
                          <Radio.Group
                            onChange={handleAddressChange}
                            value={selectedAddress}
                          >
                            {addresses.map((address) => (
                              <Radio key={address.id} value={address.id}>
                                <div>{`${address.detail_address}, ${address.address}`}</div>
                                {address.id_default && " (Mặc định)"}
                              </Radio>
                            ))}
                          </Radio.Group>
                        </div>
                      )
                    )}

                    {!userId ? null : (
                      <Button
                        color="primary"
                        variant="solid"
                        icon={<PlusOutlined />}
                        onClick={showModal}
                      >
                        Thêm mới
                      </Button>
                    )}

                    <Modal
                      title="Thêm địa chỉ mới"
                      visible={isModalVisible}
                      onCancel={handleCancel}
                      footer={null}
                    >
                      <Form form={form} layout="vertical" onFinish={handleAdd}>
                        <Form.Item
                          name="province"
                          label="Tỉnh/Thành phố"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn tỉnh/thành phố",
                            },
                          ]}
                        >
                          <Select
                            onChange={handleProvinceChange}
                            className="input-item"
                            placeholder="Chọn tỉnh/thành phố"
                          >
                            {provinces.map((p) => (
                              <Select.Option key={p.code} value={p.code}>
                                {p.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          name="district"
                          label="Quận/Huyện"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn quận/huyện",
                            },
                          ]}
                        >
                          <Select
                            onChange={handleDistrictChange}
                            disabled={!districts.length}
                            className="input-item"
                            placeholder="Chọn quận/huyện"
                          >
                            {districts.map((d) => (
                              <Select.Option key={d.code} value={d.code}>
                                {d.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          name="ward"
                          label="Phường/Xã"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn phường/xã",
                            },
                          ]}
                        >
                          <Select
                            disabled={!wards.length}
                            className="input-item"
                            placeholder="Chọn phường/xã"
                          >
                            {wards.map((w) => (
                              <Select.Option key={w.code} value={w.code}>
                                {w.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          name="detail_address"
                          label="Địa chỉ cụ thể"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập địa chỉ cụ thể",
                            },
                          ]}
                        >
                          <Input
                            className="input-item"
                            placeholder="Nhập địa chỉ cụ thể"
                          />
                        </Form.Item>

                        <Form.Item
                          name="id_default"
                          label="Đặt làm địa chỉ mặc định"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn địa chỉ mặc định",
                            },
                          ]}
                        >
                          <Radio.Group>
                            <Radio value={1}>Có</Radio>
                            <Radio value={0}>Không</Radio>
                          </Radio.Group>
                        </Form.Item>

                        <div className="add">
                          <Button type="primary" htmlType="submit">
                            Lưu
                          </Button>
                        </div>
                      </Form>
                    </Modal>
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
