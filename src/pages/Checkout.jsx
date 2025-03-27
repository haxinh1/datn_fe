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
  const [shippingFee, setShippingFee] = useState(0);
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
    const token = "bc7b2c04-055c-11f0-b2ef-7aa43f19aaea"; // Thay token của bạn vào đây
    fetch(
      "https://online-gateway.ghn.vn/shiip/public-api/master-data/province",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          setProvinces(data.data); // Lưu vào state provinces
        }
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu tỉnh thành phố:", error);
      });
  }, []);

  // Xử lý sự kiện khi người dùng chọn tỉnh/thành phố
  const handleProvinceChange = (value) => {
    // Reset districts and wards when province changes
    setDistricts([]);
    setWards([]);

    setSelectedProvince(value);

    if (!value) {
      console.error("Invalid province ID:", value);
      return;
    }
    console.log("ProvinceID:", value);
    // Get the ProvinceID instead of Code
    const selectedProvince = provinces.find((p) => p.ProvinceID === value);

    if (!selectedProvince) {
      console.error("Province not found for value:", value);
      return;
    }

    const provinceId = selectedProvince.ProvinceID; // Use the correct ProvinceID

    const token = "bc7b2c04-055c-11f0-b2ef-7aa43f19aaea"; // Replace with your actual token
    fetch(
      `https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${provinceId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 400) {
          console.error("Error fetching districts:", data.message);
        } else if (Array.isArray(data.data)) {
          setDistricts(data.data); // Update districts with the fetched data
        } else {
          console.error("Unexpected response format:", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching districts:", error);
      });
  };

  // Xử lý sự kiện khi người dùng chọn quận/huyện
  const handleDistrictChange = (value) => {
    setWards([]); // Reset wards when district changes
    setSelectedDistrict(value);
    setSelectedWard(null); // Reset selectedWard when district changes

    if (!value) {
      console.error("Invalid district ID:", value);
      return;
    }
    console.log("DistrictID:", value);
    // Find the district from selected districts
    const selectedDistrictData = districts.find((d) => d.DistrictID === value);
    if (!selectedDistrictData) {
      console.error("District not found for value:", value);
      return;
    }

    const districtId = selectedDistrictData.DistrictID;

    const token = "bc7b2c04-055c-11f0-b2ef-7aa43f19aaea"; // Replace with your actual token
    fetch(
      `https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${districtId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          setWards(data.data); // Update wards with the fetched data
        } else {
          console.error("Error fetching wards:", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching wards:", error);
      });
  };
  const handleWardChange = (value) => {
    setSelectedWard(value); // Cập nhật selectedWard khi chọn phường xã

    if (!value) {
      console.error("Invalid ward code:", value);
      return;
    }

    // Log WardCode khi thay đổi phường xã
    console.log("WardCode:", value);
  };

  // thêm địa chỉ mới
  // Thêm địa chỉ mới
  const { mutate } = useMutation({
    mutationFn: async (userData) => {
      const response = await AuthServices.addAddress(userData);
      return response;
    },
    onSuccess: (_, userData) => {
      notification.success({
        message: "Địa chỉ mới đã được thêm",
      });
      form.resetFields(); // Reset form fields after success
      setIsModalVisible(false); // Đóng modal sau khi thêm thành công
    },
    onError: (error) => {
      notification.error({
        message: "Thêm thất bại",
        description: error.message,
      });
    },
  });

  const handleAdd = (values) => {
    // Xây dựng chuỗi địa chỉ từ các giá trị người dùng nhập
    const formattedAddress = [
      values.ward
        ? wards.find((w) => w.WardCode === String(values.ward))?.WardName
        : "",
      values.district
        ? districts.find((d) => d.DistrictID === Number(values.district))
            ?.DistrictName
        : "",
      values.province
        ? provinces.find((p) => p.ProvinceID === Number(values.province))
            ?.ProvinceName
        : "",
    ]
      .filter(Boolean)
      .join(", ");

    // Tạo dữ liệu để gửi đi
    const userData = {
      address: formattedAddress, // Địa chỉ đã xâu chuỗi
      detail_address: values.detail_address, // Địa chỉ chi tiết
      id_default: values.id_default, // Địa chỉ mặc định
      ProvinceID: values.province, // ProvinceID tương ứng với tỉnh thành
      DistrictID: values.district, // DistrictID tương ứng với quận huyện
      WardCode: values.ward, // WardCode tương ứng với phường xã
    };

    console.log("Dữ liệu gửi đi:", userData);
    mutate(userData); // Gửi dữ liệu tới API
  };

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

      // Nếu không tìm thấy địa chỉ đã chọn, thông báo lỗi
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user ? user.id : null;

      // Nếu là khách vãng lai và chọn COD, sẽ báo lỗi

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
        nav("/");
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

  useEffect(() => {
    const fetchAddresses = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.id; // Lấy id từ localStorage

      if (userId) {
        try {
          const data = await AuthServices.getAddressByIdUser(userId); // Lấy địa chỉ người dùng
          setAddresses(data);
          console.log("Dữ liệu địa chỉ:", data); // ✅ Log ra console
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

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAddressChange = async (value) => {
    // Ensure that value is not undefined and exists in the address list
    const address = addresses.find((addr) => addr.id === value);

    if (address && address.DistrictID && address.WardCode) {
      // If a valid address is selected, calculate shipping fee
      const fee = await calculateShippingFee(
        address.DistrictID,
        address.WardCode
      );
      setShippingFee(fee);
    } else {
      // Handle invalid address selection or reset shipping fee
      setShippingFee(0);
    }

    // Set the selected address (using `value` from the Select or Radio)
    setSelectedAddress(value);
  };

  useEffect(() => {
    const fetchShippingFeeForGuest = async () => {
      if (!userId && selectedDistrict && selectedWard) {
        const fee = await calculateShippingFee(selectedDistrict, selectedWard);
        setShippingFee(fee);
      }
    };

    fetchShippingFeeForGuest();
  }, [userId, selectedDistrict, selectedWard]);
  //hàm tính phí ship
  const calculateShippingFee = async (DistrictId, WardCode) => {
    const token = "bc7b2c04-055c-11f0-b2ef-7aa43f19aaea";
    const shop_id = "5665125";

    const params = {
      service_id: 53320, // Start with service_id: 53320
      service_type_id: 1,
      insurance_value: subtotal,
      coupon: "",
      to_ward_code: WardCode,
      to_district_id: Number(DistrictId),
      from_district_id: 3440,
      weight: 1000,
      length: 60,
      width: 40,
      height: 3,
    };

    const tryServiceId = async (serviceId) => {
      params.service_id = serviceId;
      const response = await fetch(
        `https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token,
            ShopId: shop_id,
          },
          body: JSON.stringify(params),
        }
      );
      const data = await response.json();
      return data;
    };

    try {
      // Try with service_id 53320 first
      let data = await tryServiceId(53320);
      if (data.code === 200) {
        return data.data.total;
      } else {
        console.log("Service ID 53320 failed. Trying 53322...");
        data = await tryServiceId(53322);
        if (data.code === 200) {
          return data.data.total;
        } else {
          console.log("Service ID 53322 failed. Trying 53321...");
          data = await tryServiceId(53321);
          if (data.code === 200) {
            return data.data.total;
          } else {
            message.error("Không tính được phí vận chuyển.");
            return 0;
          }
        }
      }
    } catch (error) {
      console.error("Lỗi gọi API phí ship:", error);
      return 0;
    }
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
                        <Form.Item
                          name="province"
                          label="Tỉnh/Thành phố"
                          rules={[
                            {
                              message: "Vui lòng chọn tỉnh/thành phố",
                            },
                          ]}
                        >
                          <Select
                            onChange={handleProvinceChange}
                            placeholder="Chọn tỉnh/thành phố"
                          >
                            {provinces.map((province) => (
                              <Select.Option
                                key={province.ProvinceID} // Sử dụng ProvinceID làm key
                                value={province.ProvinceID} // Sử dụng ProvinceID làm value
                              >
                                {province.ProvinceName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          name="district"
                          label="Quận/Huyện"
                          rules={[
                            {
                              message: "Vui lòng chọn quận/huyện",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Chọn Quận/Huyện"
                            onChange={handleDistrictChange}
                            disabled={!selectedProvince}
                          >
                            {districts.map((district) => (
                              <Select.Option
                                key={district.DistrictID} // Sử dụng DistrictID làm key
                                value={district.DistrictID} // Sử dụng DistrictID làm value
                              >
                                {district.DistrictName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          name="ward"
                          label="Phường/Xã"
                          rules={[
                            {
                              message: "Vui lòng chọn phường/xã",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Chọn Phường/Xã"
                            disabled={!selectedDistrict}
                            onChange={handleWardChange}
                          >
                            {wards.map((ward) => (
                              <Select.Option
                                key={ward.WardCode}
                                value={ward.WardCode}
                              >
                                {ward.WardName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <label>Địa chỉ cụ thể:</label>
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
                          <Form.Item
                            name="address"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn địa chỉ",
                              },
                            ]}
                          >
                            <Select
                              value={selectedAddress}
                              onChange={handleAddressChange}
                              placeholder="Chọn địa chỉ"
                            >
                              {addresses.map((address) => (
                                <Select.Option
                                  key={address.id}
                                  value={address.id}
                                >
                                  {`${address.detail_address}, ${address.address}`}{" "}
                                  {address.id_default && "(Mặc định)"}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
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
                            placeholder="Chọn tỉnh/thành phố"
                          >
                            {provinces.map((province) => (
                              <Select.Option
                                key={province.ProvinceID} // Sử dụng ProvinceID làm key
                                value={province.ProvinceID} // Sử dụng ProvinceID làm value
                              >
                                {province.ProvinceName}
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
                            placeholder="Chọn Quận/Huyện"
                            onChange={handleDistrictChange}
                            disabled={!selectedProvince}
                          >
                            {districts.map((district) => (
                              <Select.Option
                                key={district.DistrictID} // Sử dụng DistrictID làm key
                                value={district.DistrictID} // Sử dụng DistrictID làm value
                              >
                                {district.DistrictName}
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
                            placeholder="Chọn Phường/Xã"
                            disabled={!selectedDistrict}
                            onChange={handleWardChange}
                          >
                            {wards.map((ward) => (
                              <Select.Option
                                key={ward.WardCode}
                                value={ward.WardCode}
                              >
                                {ward.WardName}
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
                        Đơn hàng của bạn
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
                              Sản phẩm
                            </th>
                            <th style={{ textAlign: "right", padding: "10px" }}>
                              Giá
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
                                )}{" "}
                                VND
                              </td>
                            </tr>
                          ))}

                          {/* Subtotal */}
                          <tr
                            className="summary-subtotal"
                            style={{ fontSize: "1.1rem", fontWeight: "bold" }}
                          >
                            <td style={{ padding: "10px" }}>Tổng :</td>
                            <td style={{ textAlign: "right", padding: "10px" }}>
                              {subtotal.toLocaleString()} VND
                            </td>
                          </tr>

                          {/* Shipping */}
                          <tr
                            style={{ fontSize: "1.1rem", fontWeight: "bold" }}
                          >
                            <td style={{ padding: "10px" }}>Phí ship:</td>
                            <td
                              style={{
                                textAlign: "right",
                                padding: "10px",
                                color: "green",
                              }}
                            >
                              {formatCurrency(shippingFee)} VND
                            </td>
                          </tr>

                          {/* Đổi điểm */}
                          {!userId ? null : (
                            <tr
                              style={{ fontSize: "1.1rem", fontWeight: "bold" }}
                            >
                              <td style={{ padding: "10px" }}>Đổi điểm:</td>
                              <td
                                style={{ textAlign: "right", padding: "10px" }}
                              >
                                <input
                                  type="number"
                                  placeholder="Nhập điểm đổi"
                                  min={0}
                                  style={{
                                    border: "none",
                                    borderBottom: "1px solid #ccc",
                                    outline: "none",
                                    fontSize: "1.3rem",
                                    width: "80%",
                                    textAlign: "right",
                                    padding: "4px",
                                  }}
                                />
                              </td>
                            </tr>
                          )}
                          {/* Tổng tiền */}
                          <tr
                            className="summary-total"
                            style={{
                              backgroundColor: "#f8f8f8",
                              fontSize: "1rem",
                              fontWeight: "bold",
                            }}
                          >
                            <td style={{ padding: "10px" }}>Tổng tiền:</td>
                            <td
                              style={{
                                textAlign: "right",
                                padding: "10px",
                                color: "red",
                              }}
                            >
                              {formatCurrency(subtotal + shippingFee)} VND
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
                        onClick={async () => {
                          if (!userId) {
                            // Người dùng chưa đăng nhập => tạo đơn hàng thanh toán VNPay
                            try {
                              if (
                                !userData.fullname ||
                                !userData.phone_number ||
                                !userData.email ||
                                !userData.address
                              ) {
                                return message.error(
                                  "Vui lòng điền đầy đủ thông tin trước khi thanh toán."
                                );
                              }

                              const orderData = {
                                user_id: null,
                                fullname: userData.fullname,
                                email: userData.email,
                                phone_number: userData.phone_number,
                                address: `${userData.address}, ${
                                  wards.find((w) => w.WardCode === selectedWard)
                                    ?.WardName || ""
                                }, ${
                                  districts.find(
                                    (d) => d.DistrictID === selectedDistrict
                                  )?.DistrictName || ""
                                }, ${
                                  provinces.find(
                                    (p) => p.ProvinceID === selectedProvince
                                  )?.ProvinceName || ""
                                }`
                                  .replace(/^, | ,| , $/g, "")
                                  .trim(),
                                total_amount: subtotal,
                                payment_method: "vnpay",
                                products: cartItems.map((item) => ({
                                  product_id: item.product_id,
                                  product_variant_id: item.product_variant_id,
                                  quantity: item.quantity,
                                  price:
                                    item.product_variant?.sale_price ||
                                    item.product?.sale_price ||
                                    0,
                                })),
                              };

                              const orderResponse =
                                await OrderService.placeOrder(orderData);

                              if (orderResponse?.payment_url) {
                                window.location.href =
                                  orderResponse.payment_url;
                                return;
                              }

                              if (
                                orderResponse?.message ===
                                "Đặt hàng thành công!"
                              ) {
                                message.success(
                                  "🎉 Đơn hàng đã đặt thành công!"
                                );
                                nav("/");
                                setCartItems([]);
                                localStorage.removeItem("cartAttributes");
                              } else {
                                message.error(
                                  orderResponse?.message || "Lỗi không xác định"
                                );
                              }
                            } catch (error) {
                              console.error(
                                "Lỗi khi đặt hàng với khách vãng lai:",
                                error
                              );
                              message.error("Có lỗi xảy ra khi thanh toán.");
                            }
                          } else {
                            // Đã đăng nhập => mở modal để chọn phương thức thanh toán
                            setIsPaymentModalOpen(true);
                          }
                        }}
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
