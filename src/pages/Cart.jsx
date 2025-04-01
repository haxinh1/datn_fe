import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartServices } from "./../services/cart";
import {
  message,
  Modal,
  Button,
  Table,
  InputNumber,
  Tooltip,
  Image,
} from "antd";
import { productsServices } from "./../services/product";
import { ValuesServices } from "../services/attribute_value";
import { DeleteOutlined } from "@ant-design/icons";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [attributeValues, setAttributeValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getCart = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user ? user.id : null;

        if (userId) {
          const cartData = await cartServices.fetchCart();
          setCartItems(cartData);
        } else {
          let localCartData =
            JSON.parse(localStorage.getItem("cart_items")) || [];

          const detailedCart = await Promise.all(
            localCartData.map(async (item) => {
              const productDetails = await productsServices.fetchProductById(
                item.product_id
              );
              let variantDetails = null;

              if (item.product_variant_id) {
                variantDetails = productDetails.data.variants.find(
                  (v) => v.id === item.product_variant_id
                );
              }

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
            })
          );

          setCartItems(detailedCart);
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy giỏ hàng:", error);
        message.error("Không thể lấy giỏ hàng, vui lòng thử lại!");
      }
    };

    getCart();
  }, []);

  useEffect(() => {
    const fetchAttributeValues = async () => {
      try {
        const data = await ValuesServices.fetchValues();
        setAttributeValues(data.data || []);
        console.log("Attribute values:", data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu attribute values:", error);
      }
    };

    fetchAttributeValues();
  }, []);

  const getAttributeValue = (product) => {
    const attributes = JSON.parse(localStorage.getItem("cartAttributes")) || [];
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
        const attribute = attributeValues.find(
          (av) => String(av.id) === String(attr.attribute_value_id)
        );
        return attribute ? attribute.value : "Không xác định";
      })
      .join(", ");
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const subtotal = cartItems.reduce((total, item) => {
    const price = item.product_variant
      ? item.product_variant.sale_price || item.product_variant.sell_price
      : item.price;
    return total + price * item.quantity;
  }, 0);

  const total = subtotal + shippingCost;

  const handleQuantityChange = async (index, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCartItems = [...cartItems];
    updatedCartItems[index].quantity = newQuantity;
    setCartItems(updatedCartItems);

    const productId = updatedCartItems[index].product_id;
    const variantId = updatedCartItems[index].product_variant_id || null;

    try {
      const user = localStorage.getItem("user");
      const parsedUser = user ? JSON.parse(user) : null;
      const userId = parsedUser ? parsedUser.id : null;

      if (userId) {
        await cartServices.updateCartItem(productId, newQuantity, variantId);
        message.success("Cập nhật số lượng thành công");
      } else {
        let localCart = JSON.parse(localStorage.getItem("cart_items")) || [];
        const key = productId + "-" + (variantId ?? "default");
        const existingItemIndex = localCart.findIndex(
          (item) =>
            item.product_id === productId &&
            (item.product_variant_id === variantId || !variantId)
        );

        if (existingItemIndex !== -1) {
          localCart[existingItemIndex].quantity = newQuantity;
        }

        localStorage.setItem("cart_items", JSON.stringify(localCart));
        message.success("Cập nhật số lượng thành công");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
      message.error("Lỗi khi cập nhật số lượng, vui lòng thử lại!");
    }
  };

  const handleRemoveItem = async (productId, productVariantId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await cartServices.removeCartItem(productId, productVariantId);
          setCartItems((prevItems) =>
            prevItems.filter((item) =>
              productVariantId
                ? item.product_variant_id !== productVariantId
                : item.product_id !== productId
            )
          );
          message.success("Sản phẩm đã được xóa thành công!");
        } catch (error) {
          console.error("Lỗi khi xóa sản phẩm:", error);
          message.error("Lỗi khi xóa sản phẩm, vui lòng thử lại!");
        }
      },
    });
  };

  const handleCheckout = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user ? user.id : null;

      if (userId) {
        // Đã đăng nhập → kiểm tra giỏ hàng từ database
        const cartData = await cartServices.fetchCart();
        if (!cartData || cartData.length === 0) {
          message.warning("Giỏ hàng của bạn đang trống!");
          return;
        }
      } else {
        // Vãng lai → kiểm tra localStorage
        const localCart = JSON.parse(localStorage.getItem("cart_items")) || [];
        if (localCart.length === 0) {
          message.warning("Giỏ hàng của bạn đang trống!");
          return;
        }
      }

      // Nếu có sản phẩm trong giỏ → chuyển sang trang thanh toán
      navigate("/checkout");
    } catch (error) {
      console.error("Lỗi khi kiểm tra giỏ hàng:", error);
      message.error("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };
  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "product",
      align: "center",
      render: (product, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Image src={product.thumbnail} width={60} />
          <div>
            {product.name}
            {record.product_variant_id && (
              <span className="text-muted" style={{ fontSize: "14px" }}>
                ({getAttributeValue(record)})
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      render: (price) => formatCurrency(price),
      align: "center",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      align: "center",
      render: (quantity, record, index) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(newQuantity) => handleQuantityChange(index, newQuantity)}
        />
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "total",
      align: "center",
      render: (_, record) => formatCurrency(record.price * record.quantity),
    },
    {
      title: "",
      render: (_, record) => (
        <Tooltip title="Xóa sản phẩm">
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() =>
              handleRemoveItem(record.product_id, record.product_variant_id)
            }
          />
        </Tooltip>
      ),
    },
  ];

  const clearCart = async () => {
    Modal.confirm({
      title: "Xác nhận xóa giỏ hàng",
      content: "Bạn có chắc muốn xóa toàn bộ sản phẩm trong giỏ hàng?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const response = await cartServices.clearCart();
          message.success("xóa toàn bộ sản phẩm thành công");

          // Clear the cart items locally as well
          setCartItems([]);
        } catch (error) {
          console.error("Lỗi khi xóa giỏ hàng:", error);
          message.error("Lỗi khi xóa giỏ hàng, vui lòng thử lại!");
        }
      },
    });
  };
  return (
    <div>
      <main className="main">
        <div
          className="page-header text-center"
          style={{ backgroundImage: "url('assets/images/page-header-bg.jpg')" }}
        >
          <div className="container">
            <h1 className="page-title">Giỏ Hàng</h1>
          </div>
        </div>
        <div className="page-content">
          <div className="cart">
            <div className="container">
              <div className="row">
                <div className="col-lg-9">
                  {cartItems.length === 0 ? (
                    <p className="fs-4 text-center text-danger">
                      Giỏ hàng của bạn đang trống!
                    </p>
                  ) : (
                    <Table
                      columns={columns}
                      dataSource={cartItems}
                      rowKey={(record) =>
                        record.product_id + "-" + record.product_variant_id
                      }
                      pagination={false}
                    />
                  )}

                  <Button
                    type="primary"
                    danger
                    className="btn-clear-cart"
                    onClick={clearCart}
                    style={{ marginTop: "15px" }}
                  >
                    Xóa tất cả sản phẩm
                  </Button>
                </div>
                <aside className="col-lg-3">
                  <div className="summary summary-cart">
                    <h3 className="summary-title fs-4">Giỏ hàng của bạn</h3>
                    <table className="table table-summary">
                      <tbody>
                        <tr className="summary-subtotal fs-5">
                          <td>Tạm tính:</td>
                          <td>{formatCurrency(subtotal)}</td>
                        </tr>
                        <tr className="summary-total fs-5">
                          <td>Tổng tiền:</td>
                          <td>{formatCurrency(total)}</td>
                        </tr>
                      </tbody>
                    </table>
                    <Button
                      type="primary"
                      className="btn btn-outline-primary-2 btn-order btn-block fs-5"
                      onClick={handleCheckout}
                    >
                      Thanh Toán<i className="icon-long-arrow-right"></i>
                    </Button>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
