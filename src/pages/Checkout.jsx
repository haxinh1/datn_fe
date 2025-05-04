
import React, { useEffect, useState } from "react";
import { cartServices } from "../services/cart";
import { OrderService } from "../services/order";
import {
  Button,
  message,
  Modal,
  Radio,
  Form,
  Select,
  Input,
  notification,
  Tooltip,
  Row,
  Col,
} from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ValuesServices } from "../services/attribute_value";
import { paymentServices } from "../services/payments";
import { productsServices } from "../services/product";
import { AuthServices } from "../services/auth";
import { PlusOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { CouponServices } from "../services/coupon";
import headerBg from "../assets/images/page-header-bg.jpg";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [attributeValues, setAttributeValues] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payMents, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const cartItemsToDisplay = Array.isArray(cartItems) ? cartItems : [];
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mainForm] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [shippingFee, setShippingFee] = useState(0);
  const [usedLoyaltyPoints, setUsedLoyaltyPoints] = useState(0);
  const [formattedLoyaltyPoints, setFormattedLoyaltyPoints] = useState("0");
  const [userData, setUserData] = useState({
    fullname: "",
    email: "",
    phone_number: "",
    address: "",
    loyalty_points: 0,
  });
  const [userId, setUserId] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [userCoupons, setUserCoupons] = useState([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isCouponModalVisible, setIsCouponModalVisible] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // Hàm phụ để lấy giá sản phẩm, kiểm tra sale_price_end_at
  const getProductPrice = (item) => {
    try {
      const currentDate = new Date();
      const salePriceEndAt = item.product_variant?.sale_price_end_at || item.product?.sale_price_end_at;
      let isSaleValid = false;

      // Check if salePriceEndAt is a valid date and not expired
      if (salePriceEndAt) {
        const saleEndDate = new Date(salePriceEndAt);
        isSaleValid = !isNaN(saleEndDate.getTime()) && saleEndDate > currentDate;
      }

      if (item.product_variant) {
        const salePrice = Number(item.product_variant.sale_price);
        const sellPrice = Number(item.product_variant.sell_price);
        return isSaleValid && !isNaN(salePrice) && salePrice > 0
          ? salePrice
          : !isNaN(sellPrice) && sellPrice > 0
            ? sellPrice
            : 0;
      }

      const salePrice = Number(item.product?.sale_price);
      const sellPrice = Number(item.product?.sell_price);
      return isSaleValid && !isNaN(salePrice) && salePrice > 0
        ? salePrice
        : !isNaN(sellPrice) && sellPrice > 0
          ? sellPrice
          : 0;
    } catch (error) {
      console.error("Error in getProductPrice:", error, { item });
      return 0; // Fallback to 0 if there's an error
    }
  };

  // Validator cho fullname
  const validateFullname = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng nhập tên khách hàng!"));
    }
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+/;
    if (specialCharRegex.test(value)) {
      return Promise.reject(new Error("Tên không được chứa ký tự đặc biệt!"));
    }
    const multipleSpacesRegex = /\s{2,}/;
    if (multipleSpacesRegex.test(value)) {
      return Promise.reject(new Error("Tên không được chứa nhiều khoảng trắng liên tiếp!"));
    }
    return Promise.resolve();
  };

  // Validator cho email
  const validateEmail = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng nhập email!"));
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return Promise.reject(new Error("Vui lòng nhập email đúng định dạng!"));
    }
    return Promise.resolve();
  };

  // Validator cho phone_number
  const validatePhoneNumber = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng nhập số điện thoại!"));
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(value)) {
      return Promise.reject(new Error("Số điện thoại phải là 10 chữ số!"));
    }
    return Promise.resolve();
  };

  // Lấy dữ liệu sản phẩm được chọn
  useEffect(() => {
    const fetchCartData = async () => {
      setIsLoading(true);
      const { selectedItems } = location.state || { selectedItems: [] };

      if (!selectedItems || selectedItems.length === 0) {
        message.error("Không có sản phẩm nào được chọn để thanh toán!");
        navigate("/cart");
        return;
      }

      try {
        const detailedCart = await Promise.all(
          selectedItems.map(async (item) => {
            try {
              const productDetails = await productsServices.ProductById(item.product_id);
              if (!productDetails?.data) {
                throw new Error(`Product not found for ID: ${item.product_id}`);
              }

              let variantDetails = null;
              if (item.product_variant_id) {
                variantDetails = productDetails.data.variants?.find(
                  (v) => v.id === item.product_variant_id
                );
                if (!variantDetails) {
                  console.warn(`Variant not found for ID: ${item.product_variant_id}`);
                }
              }

              const price = getProductPrice({
                product: productDetails.data,
                product_variant: variantDetails,
              });

              return {
                ...item,
                product: productDetails.data,
                product_variant: variantDetails,
                price,
              };
            } catch (error) {
              console.error(`Error processing item ${item.product_id}:`, error);
              return null; // Skip invalid items
            }
          })
        );

        // Filter out null items (failed fetches)
        const validCartItems = detailedCart.filter((item) => item !== null);
        setCartItems(validCartItems);

        if (validCartItems.length === 0) {
          message.error("Không thể tải dữ liệu sản phẩm hợp lệ!");
          navigate("/cart");
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
        message.error("Không thể tải dữ liệu sản phẩm!");
        navigate("/cart");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartData();
  }, [location.state, navigate]);

  // Lấy dữ liệu người dùng
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser?.id) return;

        setUserId(storedUser.id);
        const response = await AuthServices.getAUser(storedUser.id);
        if (response) {
          const data = response;
          setUserData({
            fullname: data.fullname || "",
            email: data.email || "",
            phone_number: data.phone_number || "",
            address: data.address?.address || "",
            loyalty_points: Number(data.loyalty_points) || 0,
          });
          mainForm.setFieldsValue({
            fullname: data.fullname || "",
            email: data.email || "",
            phone_number: data.phone_number || "",
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng từ DB:", error);
      }
    };

    fetchUserData();
  }, [mainForm]);

  // Lấy danh sách tỉnh/thành phố
  useEffect(() => {
    const token = "bc7b2c04-055c-11f0-b2ef-7aa43f19aaea";
    fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token: token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          setProvinces(data.data);
        } else {
          console.error("Dữ liệu tỉnh/thành phố không hợp lệ:", data);
        }
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu tỉnh thành phố:", error);
      });
  }, []);

  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    setDistricts([]);
    setWards([]);
    setSelectedDistrict(null);
    setSelectedWard(null);

    if (!value) return;

    const selectedProvince = provinces.find((p) => p.ProvinceID === value);
    if (!selectedProvince) return;

    const provinceId = selectedProvince.ProvinceID;
    const token = "bc7b2c04-055c-11f0-b2ef-7aa43f19aaea";
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
        if (Array.isArray(data.data)) {
          setDistricts(data.data);
        } else {
          console.error("Dữ liệu quận/huyện không hợp lệ:", data);
        }
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu quận/huyện:", error);
      });
  };

  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
    setWards([]);
    setSelectedWard(null);

    if (!value) return;

    const selectedDistrictData = districts.find((d) => d.DistrictID === value);
    if (!selectedDistrictData) return;

    const districtId = selectedDistrictData.DistrictID;
    const token = "bc7b2c04-055c-11f0-b2ef-7aa43f19aaea";
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
          setWards(data.data);
        } else {
          console.error("Dữ liệu phường/xã không hợp lệ:", data);
        }
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu phường/xã:", error);
      });
  };

  const handleWardChange = (value) => {
    setSelectedWard(value);
  };

  const { mutate } = useMutation({
    mutationFn: async (userData) => {
      const response = await AuthServices.addAddress(userData);
      return response;
    },
    onSuccess: () => {
      notification.success({
        message: "Địa chỉ mới đã được thêm",
      });
      fetchAddresses();
      addressForm.resetFields();
      setSelectedProvince(null);
      setSelectedDistrict(null);
      setSelectedWard(null);
      setDistricts([]);
      setWards([]);
      setIsModalVisible(false);
    },
    onError: (error) => {
      notification.error({
        message: "Thêm thất bại",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại!",
      });
    },
  });

  const fetchAddresses = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.id;

    if (userId) {
      try {
        const data = await AuthServices.getAddressByIdUser(userId);
        if (Array.isArray(data)) {
          setAddresses(data);
          const defaultAddress = data.find((address) => address.id_default);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress.id);
            if (defaultAddress.DistrictID && defaultAddress.WardCode) {
              const fee = await calculateShippingFee(defaultAddress.DistrictID, defaultAddress.WardCode);
              setShippingFee(fee);
            } else {
              setShippingFee(0);
              message.warning("Địa chỉ mặc định không hợp lệ, vui lòng chọn địa chỉ khác.");
            }
          } else {
            setShippingFee(0);
            message.warning("Không có địa chỉ mặc định, vui lòng chọn địa chỉ.");
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy địa chỉ:", error);
        setShippingFee(0);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAdd = async (values) => {
    try {
      const formattedAddress = [
        values.ward
          ? wards.find((w) => w.WardCode === String(values.ward))?.WardName
          : "",
        values.district
          ? districts.find((d) => d.DistrictID === Number(values.district))?.DistrictName
          : "",
        values.province
          ? provinces.find((p) => p.ProvinceID === Number(values.province))?.ProvinceName
          : "",
      ]
        .filter(Boolean)
        .join(", ");

      const userData = {
        address: formattedAddress,
        detail_address: values.detail_address,
        id_default: values.id_default,
        ProvinceID: values.province,
        DistrictID: values.district,
        WardCode: values.ward,
      };

      await mutate(userData);
    } catch (error) {
      console.error("Lỗi khi thêm địa chỉ:", error);
      notification.error({
        message: "Thêm thất bại",
        description: "Có lỗi xảy ra khi thêm địa chỉ, vui lòng thử lại!",
      });
    }
  };

  // Tính tổng tiền
  const subtotal = Array.isArray(cartItems)
    ? cartItems.reduce((total, item) => {
      const price = getProductPrice(item);
      const quantity = Number(item.quantity) || 1;
      return total + price * quantity;
    }, 0)
    : 0;

  const finalTotal = Math.max(
    0,
    subtotal - discountAmount + shippingFee - usedLoyaltyPoints
  );

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const payData = await paymentServices.getPayment();
        setPayments(Array.isArray(payData) ? payData : []);
      } catch (error) {
        console.error("Lỗi khi lấy phương thức thanh toán:", error);
      }
    };
    fetchPayments();
  }, []);

  useEffect(() => {
    const fetchAttributeValues = async () => {
      try {
        const data = await ValuesServices.fetchValues();
        setAttributeValues(data || { data: [] });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu attribute values:", error);
      }
    };
    fetchAttributeValues();
  }, []);

  const handleConfirmPayment = async () => {
    try {
      await mainForm.validateFields();
      setIsPaymentModalOpen(false);

      if (!selectedPayment) {
        message.error("Vui lòng chọn phương thức thanh toán!");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user ? user.id : null;

      let fullAddress = "";
      if (userId) {
        if (!selectedAddress) {
          message.error("Chưa có địa chỉ đặt hàng!");
          return;
        }
        const selectedAddressData = addresses.find(
          (address) => address.id === selectedAddress
        );
        if (!selectedAddressData) {
          message.error("Địa chỉ không hợp lệ!");
          return;
        }
        fullAddress = `${selectedAddressData.detail_address}, ${selectedAddressData.address}`;
      } else {
        if (
          !selectedProvince ||
          !selectedDistrict ||
          !selectedWard ||
          !userData.address
        ) {
          message.error("Vui lòng điền đầy đủ thông tin địa chỉ!");
          return;
        }
        const province = provinces.find(
          (p) => p.ProvinceID === selectedProvince
        );
        const district = districts.find(
          (d) => d.DistrictID === selectedDistrict
        );
        const ward = wards.find((w) => w.WardCode === selectedWard);
        if (!province || !district || !ward) {
          message.error("Thông tin địa chỉ không hợp lệ!");
          return;
        }
        fullAddress = `${userData.address}, ${ward.WardName}, ${district.DistrictName}, ${province.ProvinceName}`;
      }

      if (usedLoyaltyPoints < 0) {
        message.error("Số điểm sử dụng không hợp lệ!");
        return;
      }
      if (discountAmount < 0) {
        message.error("Số tiền giảm giá không hợp lệ!");
        return;
      }
      if (shippingFee < 0) {
        message.error("Phí vận chuyển không hợp lệ!");
        return;
      }

      const orderData = {
        user_id: userId || null,
        fullname: userData.fullname,
        email: userData.email,
        phone_number: userData.phone_number,
        address: fullAddress,
        used_points: Number(usedLoyaltyPoints) || 0,
        shipping_fee: Number(shippingFee) || 0,
        coupon_code: selectedCoupon ? selectedCoupon.code : null,
        discount_amount: Number(discountAmount) || 0,
        total_amount: Number(finalTotal) || 0,
        payment_method:
          selectedPayment === 2
            ? "cod"
            : selectedPayment === 1
              ? "vnpay"
              : selectedPayment === 3
                ? "momo"
                : null,
        products: cartItems.map((item) => ({
          id: item.id,
          product_id: item.product_id,
          product_variant_id: item.product_variant_id || null,
          quantity: Number(item.quantity) || 1,
          price: getProductPrice(item),
        })),
      };

      const orderResponse = await OrderService.placeOrder(orderData);

      if (orderResponse?.payment_url) {
        window.location.href = orderResponse.payment_url;
        return;
      }

      if (orderResponse?.message === "Đặt hàng thành công!" || orderResponse?.order) {
        message.success("🎉 Đơn hàng đã đặt thành công!");

        if (!userId) {
          try {
            let localCart = JSON.parse(localStorage.getItem("cart_items") || "[]");
            let cartAttributes = JSON.parse(localStorage.getItem("cartAttributes") || "[]");

            const purchasedItems = cartItems.map((item) => ({
              product_id: item.product_id,
              product_variant_id: item.product_variant_id || null,
            }));

            localCart = localCart.filter(
              (cartItem) =>
                !purchasedItems.some(
                  (purchased) =>
                    purchased.product_id === cartItem.product_id &&
                    (purchased.product_variant_id === (cartItem.product_variant_id || null))
                )
            );

            cartAttributes = cartAttributes.filter(
              (attr) =>
                !purchasedItems.some(
                  (purchased) =>
                    purchased.product_id === attr.product_id &&
                    (purchased.product_variant_id === (attr.product_variant_id || null))
                )
            );

            localStorage.setItem("cart_items", JSON.stringify(localCart));
            localStorage.setItem("cartAttributes", JSON.stringify(cartAttributes));

            window.dispatchEvent(new Event("cart-updated"));
            setCartItems([]);
          } catch (error) {
            console.error("Lỗi khi cập nhật giỏ hàng trên client-side:", error);
          }
        }
        window.dispatchEvent(new Event("cart-updated"));
        navigate(`/dashboard/orders/${userId || "guest"}`);
      } else {
        message.error(orderResponse?.message || "Không thể đặt hàng, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("❌ Lỗi khi đặt hàng:", error);
      message.error(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const getAttributeValue = (product) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user ? user.id : null;

      if (userId) {
        if (product.product_variant && product.product_variant.attribute_value_product_variants) {
          return product.product_variant.attribute_value_product_variants
            .map((attr) => {
              if (!attributeValues?.data) return "Không xác định";
              const attribute = attributeValues.data.find(
                (av) => String(av.id) === String(attr.attribute_value_id)
              );
              return attribute ? attribute.value : "Không xác định";
            })
            .join(", ");
        }
        return "Không xác định";
      } else {
        const attributes = JSON.parse(localStorage.getItem("cartAttributes") || "[]") || [];
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
      }
    } catch (error) {
      console.error("Error in getAttributeValue:", error, { product });
      return "Không xác định";
    }
  };

  const formatCurrency = (value) => {
    try {
      return new Intl.NumberFormat("vi-VN", {}).format(Number(value) || 0);
    } catch (error) {
      console.error("Error in formatCurrency:", error, { value });
      return "0";
    }
  };

  const formatNumber = (value) => {
    try {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    } catch (error) {
      console.error("Error in formatNumber:", error, { value });
      return value.toString();
    }
  };

  const unformatNumber = (value) => {
    try {
      return Number(value.replace(/\./g, ""));
    } catch (error) {
      console.error("Error in unformatNumber:", error, { value });
      return 0;
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    addressForm.resetFields();
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
  };

  const handleAddressChange = async (value) => {
    try {
      const address = addresses.find((addr) => addr.id === value);
      if (address && address.DistrictID && address.WardCode) {
        const fee = await calculateShippingFee(address.DistrictID, address.WardCode);
        setShippingFee(fee);
      } else {
        setShippingFee(0);
      }
      setSelectedAddress(value);
    } catch (error) {
      console.error("Error in handleAddressChange:", error);
      setShippingFee(0);
    }
  };

  useEffect(() => {
    const fetchShippingFeeForGuest = async () => {
      if (!userId && selectedDistrict && selectedWard) {
        try {
          const fee = await calculateShippingFee(selectedDistrict, selectedWard);
          setShippingFee(fee);
        } catch (error) {
          console.error("Error in fetchShippingFeeForGuest:", error);
          setShippingFee(0);
        }
      }
    };

    fetchShippingFeeForGuest();
  }, [userId, selectedDistrict, selectedWard]);

  const calculateShippingFee = async (DistrictId, WardCode) => {
    const token = "bc7b2c04-055c-11f0-b2ef-7aa43f19aaea";
    const shop_id = "5665125";

    const params = {
      service_id: 53320,
      service_type_id: 1,
      insurance_value: Math.max(subtotal, 0),
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
      let data = await tryServiceId(53320);
      if (data.code === 200) {
        return data.data.total;
      } else {
        data = await tryServiceId(53322);
        if (data.code === 200) {
          return data.data.total;
        } else {
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

  // useEffect(() => {
  //   const fetchCouponsData = async () => {
  //     try {
  //       const storedUser = JSON.parse(localStorage.getItem("user"));

  //       let userCouponsData = [];
  //       let availableCouponsData = [];

  //       if (storedUser?.id) {
  //         userCouponsData = await CouponServices.getCounponById(storedUser.id);
  //         setUserCoupons(Array.isArray(userCouponsData) ? userCouponsData : []);
  //       }

  //       const searchParams = {
  //         is_active: 1,
  //         page: 1,
  //       };
  //       availableCouponsData = await CouponServices.searchCoupons(searchParams);

  //       if (availableCouponsData?.data) {
  //         setCoupons(availableCouponsData.data);
  //       } else {
  //         setCoupons([]);
  //       }
  //     } catch (error) {
  //       console.error("❌ Lỗi khi lấy danh sách mã giảm giá:", error);
  //     }
  //   };

  //   fetchCouponsData();
  // }, []);

  useEffect(() => {
    const fetchCouponsData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        let userCouponsData = [];
        let availableCouponsData = [];

        // Lấy coupon theo ID người dùng (nếu đã đăng nhập)
        if (storedUser?.id) {
          userCouponsData = await CouponServices.getCounponById(storedUser.id);
          setUserCoupons(Array.isArray(userCouponsData) ? userCouponsData : []);
        }

        // Lấy danh sách coupon công khai/có sẵn thông qua getAvailableCoupons
        availableCouponsData = await CouponServices.getAvailableCoupons();

        // Kết hợp danh sách coupon
        if (availableCouponsData?.data) {
          // Gộp userCouponsData và availableCouponsData, loại bỏ trùng lặp (dựa trên coupon ID hoặc code)
          const combinedCoupons = [
            ...(Array.isArray(userCouponsData) ? userCouponsData : []),
            ...(Array.isArray(availableCouponsData.data) ? availableCouponsData.data : []),
          ].reduce((unique, coupon) => {
            // Kiểm tra trùng lặp dựa trên ID hoặc code
            if (!unique.some((item) => item.id === coupon.id || item.code === coupon.code)) {
              unique.push(coupon);
            }
            return unique;
          }, []);

          setCoupons(combinedCoupons);
        } else {
          // Nếu không có coupon công khai, chỉ sử dụng coupon của người dùng
          setCoupons(Array.isArray(userCouponsData) ? userCouponsData : []);
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách mã giảm giá:", error);
        setCoupons([]);
      }
    };

    fetchCouponsData();
  }, []);

  const applyDiscount = () => {
    if (!selectedCoupon) {
      message.error("Vui lòng chọn mã giảm giá.");
      return;
    }

    try {
      let discountValue = 0;

      if (selectedCoupon.discount_type === "percent") {
        discountValue = (subtotal * selectedCoupon.discount_value) / 100;
      } else if (selectedCoupon.discount_type === "fix_amount") {
        discountValue = selectedCoupon.discount_value;
      }

      if (discountValue > subtotal) {
        discountValue = subtotal;
        message.warning(
          `Mã giảm giá vượt quá giá trị đơn hàng. Tổng tiền đã được giảm xuống 0 VNĐ (không bao gồm phí vận chuyển).`
        );
      }

      setDiscountAmount(discountValue);
      message.success(`Mã giảm giá ${selectedCoupon.code} đã được áp dụng!`);
      setIsCouponModalVisible(false);
    } catch (error) {
      console.error("Error in applyDiscount:", error);
      message.error("Lỗi khi áp dụng mã giảm giá!");
    }
  };

  const handleRemoveCoupon = () => {
    setSelectedCoupon(null);
    setDiscountAmount(0);
    message.success("Mã giảm giá đã được hủy!");
    setIsCouponModalVisible(false);
  };

  return (
    <div>
      <main className="main">
        <div
          className="page-header text-center"
          style={{ backgroundImage: `url(${headerBg})` }}
        >
          <div className="container">
            <h1 className="page-title">Thanh Toán</h1>
          </div>
        </div>

        <nav aria-label="breadcrumb" className="breadcrumb-nav">
          <div className="container">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/">
                  <span>Trang Chủ</span>
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/cart">
                  <span>Giỏ Hàng</span>
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                <span>Thanh Toán</span>
              </li>
            </ol>
          </div>
        </nav>

        <div className="page-content">
          <div className="checkout">
            <div className="container">
              <Form form={mainForm} layout="vertical">
                <div className="row">
                  <div className="col-lg-9">
                    <h1 className="mb-5" style={{ color: "#eea287" }}>
                      Thông tin giao hàng
                    </h1>
                    <div className="row">
                      <div className="col-sm-6">
                        <Form.Item
                          label="Tên khách hàng"
                          name="fullname"
                          rules={[{ validator: validateFullname }]}
                        >
                          <Input
                            className="input-item"
                            type="text"
                            value={userData.fullname}
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                fullname: e.target.value,
                              })
                            }
                          />
                        </Form.Item>
                      </div>

                      <div className="col-sm-6">
                        <Form.Item
                          label="Số điện thoại"
                          name="phone_number"
                          rules={[{ validator: validatePhoneNumber }]}
                        >
                          <Input
                            className="input-item"
                            type="text"
                            value={userData.phone_number}
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                phone_number: e.target.value,
                              })
                            }
                          />
                        </Form.Item>
                      </div>
                    </div>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[{ validator: validateEmail }]}
                    >
                      <Input
                        className="input-item"
                        type="text"
                        value={userData.email}
                        onChange={(e) =>
                          setUserData({ ...userData, email: e.target.value })
                        }
                      />
                    </Form.Item>

                    {!userId ? (
                      <div>
                        <div className="row">
                          <div className="col-sm-6">
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
                                className="input-item"
                                onChange={handleProvinceChange}
                                placeholder="Chọn tỉnh/thành phố"
                              >
                                {provinces.map((province) => (
                                  <Select.Option
                                    key={province.ProvinceID}
                                    value={province.ProvinceID}
                                  >
                                    {province.ProvinceName}
                                  </Select.Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </div>

                          <div className="col-sm-6">
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
                                className="input-item"
                                placeholder="Chọn Quận/Huyện"
                                onChange={handleDistrictChange}
                                disabled={!selectedProvince}
                              >
                                {districts.map((district) => (
                                  <Select.Option
                                    key={district.DistrictID}
                                    value={district.DistrictID}
                                  >
                                    {district.DistrictName}
                                  </Select.Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-sm-6">
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
                                className="input-item"
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
                          </div>

                          <div className="col-sm-6">
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
                                value={userData.address}
                                onChange={(e) =>
                                  setUserData({
                                    ...userData,
                                    address: e.target.value,
                                  })
                                }
                                placeholder="Nhập địa chỉ giao hàng"
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Form.Item label="Chọn địa chỉ" name="address">
                          <div className="attribute">
                            <Select
                              className="input-item"
                              value={selectedAddress}
                              onChange={handleAddressChange}
                              placeholder="Chọn địa chỉ"
                              allowClear
                            >
                              {addresses.length > 0 ? (
                                addresses.map((address) => (
                                  <Select.Option key={address.id} value={address.id}>
                                    {`${address.detail_address}, ${address.address}`}{" "}
                                    {address.id_default && "(Mặc định)"}
                                  </Select.Option>
                                ))
                              ) : (
                                <Select.Option disabled key="no-address" value="">
                                  Chưa có
                                </Select.Option>
                              )}
                            </Select>

                            <Tooltip title="Thêm địa chỉ mới">
                              <Button
                                className="btn-import"
                                style={{ backgroundColor: "#eea287", color: "white" }}
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={showModal}
                              />
                            </Tooltip>
                          </div>
                        </Form.Item>
                      </div>
                    )}

                    <Modal
                      title="Thêm địa chỉ mới"
                      open={isModalVisible}
                      onCancel={handleCancel}
                      footer={null}
                    >
                      <Form form={addressForm} layout="vertical" onFinish={handleAdd}>
                        <Row gutter={24}>
                          <Col span={12}>
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
                                className="input-item"
                                onChange={handleProvinceChange}
                                placeholder="Chọn tỉnh/thành phố"
                                value={selectedProvince}
                              >
                                {provinces.map((province) => (
                                  <Select.Option
                                    key={province.ProvinceID}
                                    value={province.ProvinceID}
                                  >
                                    {province.ProvinceName}
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
                                className="input-item"
                                placeholder="Chọn Phường/Xã"
                                disabled={!selectedDistrict}
                                onChange={handleWardChange}
                                value={selectedWard}
                              >
                                {wards.map((ward) => (
                                  <Select.Option key={ward.WardCode} value={ward.WardCode}>
                                    {ward.WardName}
                                  </Select.Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>

                          <Col span={12}>
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
                                className="input-item"
                                placeholder="Chọn Quận/Huyện"
                                onChange={handleDistrictChange}
                                disabled={!selectedProvince}
                                value={selectedDistrict}
                              >
                                {districts.map((district) => (
                                  <Select.Option
                                    key={district.DistrictID}
                                    value={district.DistrictID}
                                  >
                                    {district.DistrictName}
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
                              <Input className="input-item" placeholder="Nhập địa chỉ cụ thể" />
                            </Form.Item>
                          </Col>
                        </Row>

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
                          <Button
                            style={{ backgroundColor: "#eea287", color: "white" }}
                            type="primary"
                            htmlType="submit"
                          >
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
                        <thead style={{ backgroundColor: "#f1f1f1", fontSize: "1.1rem" }}>
                          <tr>
                            <th style={{ textAlign: "left", padding: "10px" }}>Sản phẩm</th>
                            <th style={{ textAlign: "right", padding: "10px" }}>Giá</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartItemsToDisplay.map((item) => (
                            <tr key={item.id || `${item.product_id}-${item.product_variant_id}`}>
                              <td style={{ padding: "10px" }}>
                                {item.product?.name || `Sản phẩm #${item.product_id}`}{" "}
                                {item.product_variant_id && (
                                  <span className="text-muted">({getAttributeValue(item)})</span>
                                )}
                                (x{item.quantity})
                              </td>
                              <td style={{ textAlign: "right", padding: "10px" }}>
                                {formatCurrency(getProductPrice(item) * item.quantity)} VNĐ
                              </td>
                            </tr>
                          ))}

                          <tr
                            className="summary-subtotal"
                            style={{ fontSize: "1.1rem", fontWeight: "bold" }}
                          >
                            <td style={{ padding: "10px" }}>Tổng:</td>
                            <td style={{ textAlign: "right", padding: "10px" }}>
                              {formatCurrency(subtotal)} VNĐ
                            </td>
                          </tr>

                          <tr style={{ fontSize: "12px", fontWeight: "bold" }}>
                            <td style={{ padding: "10px" }}>Phí vận chuyển:</td>
                            <td style={{ textAlign: "right", padding: "10px", color: "green" }}>
                              {formatCurrency(shippingFee)} VNĐ
                            </td>
                          </tr>

                          {!userId ? null : (
                            <>
                              <tr style={{ fontSize: "12px", fontWeight: "bold" }}>
                                <td style={{ padding: "10px" }}>
                                  Điểm tiêu dùng ({formatCurrency(userData.loyalty_points || 0)}):
                                </td>
                                <td style={{ textAlign: "right", padding: "10px" }}>
                                  <input
                                    type="text"
                                    placeholder="Nhập điểm đổi"
                                    value={formattedLoyaltyPoints}
                                    onChange={(e) => {
                                      try {
                                        const rawValue = e.target.value;
                                        const numericValue = unformatNumber(rawValue);

                                        if (numericValue <= userData.loyalty_points && numericValue >= 0) {
                                          setUsedLoyaltyPoints(numericValue);
                                          setFormattedLoyaltyPoints(formatNumber(numericValue));
                                        } else {
                                          message.warning(
                                            numericValue < 0
                                              ? "Số điểm không thể âm!"
                                              : "Bạn không thể dùng quá số điểm hiện có!"
                                          );
                                          setUsedLoyaltyPoints(userData.loyalty_points);
                                          setFormattedLoyaltyPoints(formatNumber(userData.loyalty_points));
                                        }
                                      } catch (error) {
                                        console.error("Error in loyalty points input:", error);
                                      }
                                    }}
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
                              <tr style={{ fontSize: "12px", fontWeight: "bold" }}>
                                <td style={{ padding: "10px" }}>Mã giảm giá:</td>
                                <td style={{ textAlign: "right", padding: "10px" }}>
                                  {selectedCoupon ? (
                                    <span
                                      style={{ cursor: "pointer", color: "#e48948" }}
                                      onClick={() => setIsCouponModalVisible(true)}
                                    >
                                      {selectedCoupon.code}
                                    </span>
                                  ) : (
                                    <span
                                      style={{ cursor: "pointer", color: "#e48948" }}
                                      onClick={() => setIsCouponModalVisible(true)}
                                    >
                                      Chọn mã giảm giá
                                    </span>
                                  )}
                                  {selectedCoupon && (
                                    <button
                                      style={{
                                        marginLeft: "10px",
                                        backgroundColor: "transparent",
                                        color: "gray",
                                        border: "none",
                                        fontSize: "16px",
                                        cursor: "pointer",
                                      }}
                                      onClick={handleRemoveCoupon}
                                    >
                                      <i className="fa-solid fa-xmark"></i>
                                    </button>
                                  )}
                                </td>
                              </tr>
                              {(usedLoyaltyPoints > 0 || discountAmount > 0) && (
                                <tr style={{ fontSize: "12px", fontWeight: "bold" }}>
                                  <td style={{ padding: "10px" }}>Số tiền giảm:</td>
                                  <td style={{ textAlign: "right", padding: "10px" }}>
                                    <div style={{ color: "#e48948" }}>
                                      {usedLoyaltyPoints > 0 && (
                                        <div>-{formatCurrency(usedLoyaltyPoints)} (Điểm)</div>
                                      )}
                                      {discountAmount > 0 && (
                                        <div>-{formatCurrency(discountAmount)} VNĐ (Mã)</div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}

                              <Modal
                                title="Chọn mã giảm giá"
                                open={isCouponModalVisible}
                                onCancel={() => setIsCouponModalVisible(false)}
                                footer={null}
                                width={400}
                                centered
                              >
                                <div className="coupon-list">
                                  {coupons && coupons.length > 0 ? (
                                    coupons.map((coupon) => {
                                      const startDate = new Date(coupon.start_date);
                                      const endDate = new Date(coupon.end_date);
                                      const currentDate = new Date();
                                      const isValid = !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && currentDate >= startDate && currentDate <= endDate;

                                      return (
                                        <div
                                          key={coupon.id}
                                          style={{
                                            padding: "10px",
                                            marginBottom: "10px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            backgroundColor:
                                              selectedCoupon?.id === coupon.id ? "#e48948" : "",
                                            color: selectedCoupon?.id === coupon.id ? "white" : "",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                          }}
                                          onClick={() => isValid && setSelectedCoupon(coupon)}
                                        >
                                          <span>
                                            {coupon.code} -{" "}
                                            {coupon.discount_type === "percent"
                                              ? `${coupon.discount_value}%`
                                              : `${coupon.discount_value} VNĐ`}{" "}
                                            {coupon.coupon_type === "public"
                                              ? ""
                                              : coupon.coupon_type === "private"
                                                ? "(Dành riêng bạn)"
                                                : coupon.coupon_type === "rank"
                                                  ? "(Theo hạng)"
                                                  : ""}
                                          </span>
                                          <span style={{ fontSize: "0.8rem", color: isValid ? "green" : "red" }}>
                                            {isValid ? "Hiệu lực" : "Hết hạn"}: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                                          </span>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <p>Không có mã giảm giá nào.</p>
                                  )}
                                </div>
                                <button
                                  type="primary"
                                  onClick={applyDiscount}
                                  className="btn btn-outline-primary-2 btn-order btn-block fs-5"
                                >
                                  Sử dụng
                                </button>
                              </Modal>
                            </>
                          )}

                          <tr
                            className="summary-total"
                            style={{
                              backgroundColor: "#f8f8f8",
                              fontSize: "1rem",
                              fontWeight: "bold",
                            }}
                          >
                            <td style={{ padding: "10px" }}>Tổng tiền:</td>
                            <td style={{ textAlign: "right", padding: "10px", color: "red" }}>
                              {formatCurrency(finalTotal)} VNĐ
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <button
                        type="primary"
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
                          try {
                            await mainForm.validateFields();

                            if (!userId) {
                              if (
                                !userData.address ||
                                !selectedProvince ||
                                !selectedDistrict ||
                                !selectedWard
                              ) {
                                return message.error(
                                  "Vui lòng điền đầy đủ thông tin địa chỉ trước khi thanh toán."
                                );
                              }
                              setIsPaymentModalOpen(true);
                            } else {
                              if (!selectedAddress) {
                                return message.error(
                                  "Vui lòng chọn địa chỉ giao hàng trước khi thanh toán."
                                );
                              }
                              setIsPaymentModalOpen(true);
                            }
                          } catch (error) {
                            console.error("Error in payment button click:", error);
                            message.error("Vui lòng kiểm tra lại thông tin nhập vào!");
                          }
                        }}
                      >
                        Thanh Toán
                      </button>
                    </div>
                  </aside>
                </div>
              </Form>
            </div>
          </div>
        </div>
        <Modal
          title="Chọn phương thức thanh toán"
          open={isPaymentModalOpen}
          onCancel={() => setIsPaymentModalOpen(false)}
          footer={null}
        >
          <div className="d-block my-3">
            {payMents.length > 0 ? (
              payMents.map((method) => {
                if (!userId && method.name.toLowerCase() === "cod") {
                  return null;
                }

                const displayName =
                  method.name.toLowerCase() === "cod"
                    ? "Thanh toán khi nhận hàng"
                    : method.name.toLowerCase() === "vnpay"
                      ? "Thanh toán qua VNPay"
                      : method.name.toLowerCase() === "momo"
                        ? "Thanh toán qua Momo"
                        : method.name;

                return (
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
                    <label className="custom-control-label" htmlFor={`httt-${method.id}`}>
                      {displayName}
                    </label>
                  </div>
                );
              })
            ) : (
              <p className="text-center font-italic">Đang tải phương thức thanh toán...</p>
            )}
          </div>

          <div className="add">
            <Button
              key="submit"
              type="primary"
              onClick={handleConfirmPayment}
              style={{ backgroundColor: "#eea287", color: "white" }}
            >
              Xác nhận
            </Button>
          </div>
        </Modal>
      </main>
    </div>
  );
};

export default Checkout;