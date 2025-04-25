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
import headerBg from "../assets/images/page-header-bg.jpg";

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
          // Người dùng đã đăng nhập: Lấy dữ liệu giỏ hàng từ API
          const cartData = await cartServices.fetchCart();

          // Gọi thêm API để lấy chi tiết sản phẩm và biến thể
          const detailedCart = await Promise.all(
            cartData.map(async (item) => {
              const productDetails = await productsServices.fetchProductById(item.product_id);
              let variantDetails = null;

              if (item.product_variant_id) {
                variantDetails = productDetails.data.variants.find(
                  (v) => v.id === item.product_variant_id
                );
              }

              const price = variantDetails
                ? variantDetails.sale_price || variantDetails.sell_price
                : productDetails.data.sale_price || productDetails.data.sell_price;

              return {
                ...item,
                product: productDetails.data,
                product_variant: variantDetails,
                price,
              };
            })
          );

          setCartItems(detailedCart);
        } else {
          // Người dùng chưa đăng nhập: Lấy từ localStorage
          let localCartData = JSON.parse(localStorage.getItem("cart_items")) || [];

          const detailedCart = await Promise.all(
            localCartData.map(async (item) => {
              const productDetails = await productsServices.ProductById(
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
                : productDetails.data.sale_price || productDetails.data.sell_price;

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
      } finally {
        setLoading(false);
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
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user ? user.id : null;

    if (userId) {
      // Người dùng đã đăng nhập: Lấy từ product_variant
      if (product.product_variant && product.product_variant.attribute_value_product_variants) {
        return product.product_variant.attribute_value_product_variants
          .map((attr) => {
            const attribute = attributeValues.find(
              (av) => String(av.id) === String(attr.attribute_value_id)
            );
            return attribute ? attribute.value : "Không xác định";
          })
          .join(", ");
      }
      return "Không xác định";
    } else {
      // Người dùng chưa đăng nhập: Lấy từ cartAttributes
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
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const subtotal = cartItems.reduce((total, item) => {
    if (item.product.is_active === 0) {
      return total;
    }

    const price = item.product_variant
      ? item.product_variant.sale_price || item.product_variant.sell_price
      : item.price;

    return total + price * item.quantity;
  }, 0);

  const total = subtotal + shippingCost;

  const handleQuantityChange = async (index, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCartItems = [...cartItems];
    const item = updatedCartItems[index];

    const availableStock = item.product_variant
      ? item.product_variant.stock
      : item.product.stock;

    if (newQuantity > availableStock) {
      message.error(`Số lượng vượt quá tồn kho!`);
      return;
    }

    updatedCartItems[index].quantity = newQuantity;
    setCartItems(updatedCartItems);

    const productId = item.product_id;
    const variantId = item.product_variant_id || null;

    try {
      const user = localStorage.getItem("user");
      const parsedUser = user ? JSON.parse(user) : null;
      const userId = parsedUser ? parsedUser.id : null;

      if (userId) {
        await cartServices.updateCartItem(productId, newQuantity, variantId);
        message.success("Cập nhật số lượng thành công");
      } else {
        let localCart = JSON.parse(localStorage.getItem("cart_items")) || [];
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

      window.dispatchEvent(new Event("cart-updated"));
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
          const user = JSON.parse(localStorage.getItem("user"));
          const userId = user ? user.id : null;

          if (userId) {
            await cartServices.removeCartItem(productId, productVariantId);
          } else {
            let localCart =
              JSON.parse(localStorage.getItem("cart_items")) || [];
            localCart = localCart.filter(
              (item) =>
                item.product_id !== productId ||
                (productVariantId &&
                  item.product_variant_id !== productVariantId)
            );
            localStorage.setItem("cart_items", JSON.stringify(localCart));
          }

          setCartItems((prevItems) =>
            prevItems.filter((item) =>
              productVariantId
                ? item.product_variant_id !== productVariantId
                : item.product_id !== productId
            )
          );

          let cartAttributes =
            JSON.parse(localStorage.getItem("cartAttributes")) || [];
          cartAttributes = cartAttributes.filter(
            (attr) =>
              attr.product_id !== productId ||
              (productVariantId && attr.product_variant_id !== productVariantId)
          );
          localStorage.setItem(
            "cartAttributes",
            JSON.stringify(cartAttributes)
          );

          message.success("Sản phẩm đã được xóa thành công!");
          window.dispatchEvent(new Event("cart-updated"));
        } catch (error) {
          console.error("Lỗi khi xóa sản phẩm:", error);
          message.error("Lỗi khi xóa sản phẩm, vui lòng thử lại!");
        }
      },
    });
  };

  const handleCheckout = async () => {
    try {
      let updatedCartItems = [...cartItems];

      const productsInactive = updatedCartItems.filter(
        (item) => item.product.is_active === 0
      );

      if (productsInactive.length > 0) {
        updatedCartItems = updatedCartItems.filter(
          (item) => item.product.is_active !== 0
        );

        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user ? user.id : null;

        if (userId) {
          for (const product of productsInactive) {
            await cartServices.removeCartItem(
              product.product_id,
              product.product_variant_id
            );
          }
        } else {
          let localCart = JSON.parse(localStorage.getItem("cart_items")) || [];
          localCart = localCart.filter(
            (item) =>
              !productsInactive.some(
                (inactive) =>
                  inactive.product_id === item.product_id &&
                  inactive.product_variant_id === item.product_variant_id
              )
          );
          localStorage.setItem("cart_items", JSON.stringify(localCart));

          let cartAttributes =
            JSON.parse(localStorage.getItem("cartAttributes")) || [];
          cartAttributes = cartAttributes.filter(
            (attr) =>
              !productsInactive.some(
                (inactive) =>
                  inactive.product_id === attr.product_id &&
                  inactive.product_variant_id === attr.product_variant_id
              )
          );
          localStorage.setItem(
            "cartAttributes",
            JSON.stringify(cartAttributes)
          );
        }

        setCartItems(updatedCartItems);
        message.warning(
          `${productsInactive.length} sản phẩm ngừng bán đã bị xóa!`
        );

        window.dispatchEvent(new Event("cart-updated"));
      }

      if (updatedCartItems.length === 0) {
        message.warning("Giỏ hàng của bạn đang trống!");
        return;
      }

      navigate("/checkout");
    } catch (error) {
      console.error("Lỗi khi kiểm tra giỏ hàng:", error);
      message.error("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  const clearCart = async () => {
    Modal.confirm({
      title: "Xác nhận xóa giỏ hàng",
      content: "Bạn có chắc muốn xóa toàn bộ sản phẩm trong giỏ hàng?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          const userId = user ? user.id : null;

          if (userId) {
            await cartServices.clearCart();
          } else {
            localStorage.setItem("cart_items", JSON.stringify([]));
            localStorage.setItem("cartAttributes", JSON.stringify([]));
          }

          setCartItems([]);
          message.success("Xóa toàn bộ sản phẩm thành công");
          window.dispatchEvent(new Event("cart-updated"));
        } catch (error) {
          console.error("Lỗi khi xóa giỏ hàng:", error);
          message.error("Lỗi khi xóa giỏ hàng, vui lòng thử lại!");
        }
      },
    });
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "product",
      align: "center",
      render: (product, record) => {
        const isProductInactive = product.is_active === 0;

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: isProductInactive ? 0.5 : 1,
              position: "relative",
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
              {isProductInactive && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "0",
                    width: "100%",
                    textAlign: "center",
                    color: "red",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  Sản phẩm này ngừng bán
                </div>
              )}
            </div>
          </div>
        );
      },
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
          disabled={record.product.is_active === 0}
        />
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "total",
      align: "center",
      render: (_, record) => {
        if (record.product.is_active === 0) {
          return "Không tính";
        }
        return formatCurrency(record.price * record.quantity);
      },
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

  return (
    <div>
      <main className="main">
        <div
          className="page-header text-center"
          style={{ backgroundImage: `url(${headerBg})` }}
        >
          <div className="container">
            <h1 className="page-title">Giỏ Hàng</h1>
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
                <span>Giỏ Hàng</span>
              </li>
            </ol>
          </div>
        </nav>

        <div className="page-content">
          <div className="cart">
            <div className="container">
              <div className="row">
                <div className="col-lg-9">
                  {cartItems.length === 0 ? (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <span className="fs-4 text-center text-danger">
                        Giỏ hàng của bạn đang trống!
                      </span>
                    </div>
                  ) : (
                    <div className="">
                      <div className="btn-brand">
                        <Tooltip title="Xóa giỏ hàng">
                          <Button
                            danger
                            variant="outlined"
                            icon={<DeleteOutlined />}
                            onClick={clearCart}
                            style={{ marginTop: "15px" }}
                          />
                        </Tooltip>
                      </div>
                      <Table
                        columns={columns}
                        dataSource={cartItems}
                        rowKey={(record) =>
                          record.product_id + "-" + record.product_variant_id
                        }
                        pagination={false}
                      />
                    </div>
                  )}
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

                    <button
                      type="primary"
                      className="btn btn-outline-primary-2 btn-order btn-block fs-5"
                      onClick={handleCheckout}
                    >
                      Thanh Toán<i className="icon-long-arrow-right"></i>
                    </button>
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