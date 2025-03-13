import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartServices } from "./../services/cart";
import { message, Modal } from "antd";
import { ValuesServices } from "../services/attribute_value";

import { productsServices } from "./../services/product";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [attributeValues, setAttributeValues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getCart = async () => {
      let data = [];
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        // If user is logged in, fetch the cart from the server
        data = await cartServices.fetchCart();
        console.log("Giỏ hàng từ API:", data);
      } else {
        // If user is not logged in, get the cart from sessionStorage
        const sessionCart = JSON.parse(sessionStorage.getItem("cart") || "{}");
        console.log("Giỏ hàng từ sessionStorage:", sessionCart);

        // Convert the object to an array
        const cartItemsArray = Object.values(sessionCart);

        // Fetch product details for each cart item
        const updatedCartItems = await Promise.all(
          cartItemsArray.map(async (item) => {
            try {
              // Fetch product details by product_id
              const productDetails = await productsServices.fetchProductById(
                item.product_id
              );
              console.log("Product details fetched:", productDetails);
              let productVariant = null;

              // Nếu sản phẩm có biến thể, lấy thông tin biến thể từ API hoặc product data
              if (item.product_variant_id && productDetails.data.variants) {
                productVariant = productDetails.data.variants.find(
                  (variant) => variant.id === item.product_variant_id
                );
              }
              return {
                ...item,
                product: productDetails.data, // Add product details to cart item
                product_variant: productVariant || null, // Gán biến thể vào cart item
              };
            } catch (error) {
              console.error("Error fetching product:", error);
              return {
                ...item,
                product: null, // Fallback if product data fetch fails
              };
            }
          })
        );

        data = updatedCartItems;
      }

      // Update state with fetched cart items
      if (Array.isArray(data)) {
        setCartItems(data);
      } else {
        setCartItems([]); // Fallback to empty cart if data is not valid
      }
    };
    getCart();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const subtotal = Array.isArray(cartItems)
    ? cartItems.reduce((total, item) => {
        const price = item.product_variant
          ? item.product_variant.sale_price || item.product_variant.sell_price
          : item.price;
        return total + price * item.quantity;
      }, 0)
    : 0;

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
        // Cập nhật giỏ hàng trên server nếu người dùng đã đăng nhập
        await cartServices.updateCartItem(productId, newQuantity, variantId);
        message.success("Cập nhật số lượng thành công");
      } else {
        // Nếu người dùng chưa đăng nhập, cập nhật giỏ hàng trong session
        const sessionCart = JSON.parse(sessionStorage.getItem("cart") || "{}");
        const key = productId + "-" + (variantId || "default");

        if (!sessionCart[key]) {
          return message.error("Không tìm thấy sản phẩm trong giỏ hàng");
        }

        sessionCart[key].quantity = newQuantity;
        sessionStorage.setItem("cart", JSON.stringify(sessionCart));

        message.success("Cập nhật số lượng thành công (Session)");
      }
    } catch (error) {
      console.error(
        "❌ Lỗi khi cập nhật số lượng:",
        error.response?.data || error
      );
      message.error("Lỗi khi cập nhật số lượng, vui lòng thử lại!");
    }
  };

  const handleRemoveItem = async (productId, productVariantId) => {
    // Hiển thị modal xác nhận
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          // Kiểm tra xem có productVariantId không để xóa
          if (productVariantId) {
            // Xóa sản phẩm biến thể theo product_variant_id
            await cartServices.removeCartItem(productId, productVariantId);
          } else {
            // Xóa sản phẩm đơn theo product_id
            await cartServices.removeCartItem(productId);
          }

          // Cập nhật giỏ hàng sau khi xóa
          setCartItems((prevItems) =>
            prevItems.filter((item) =>
              productVariantId
                ? item.product_variant_id !== productVariantId
                : item.product_id !== productId
            )
          );

          // Cập nhật cartAttributes trong localStorage nếu xóa theo variant id
          if (productVariantId) {
            // Lấy cartAttributes từ localStorage
            const storedAttributes =
              JSON.parse(localStorage.getItem("cartAttributes")) || [];

            // Lọc ra các thuộc tính không liên quan đến productVariantId
            const updatedAttributes = storedAttributes.filter(
              (attribute) => attribute.product_variant_id !== productVariantId
            );

            // Lưu lại các thuộc tính đã cập nhật vào localStorage
            localStorage.setItem(
              "cartAttributes",
              JSON.stringify(updatedAttributes)
            );
          }

          message.success("Sản phẩm đã được xóa thành công!");
        } catch (error) {
          console.error(
            "❌ Lỗi khi xóa sản phẩm:",
            error.response?.data || error
          );
          message.error("Lỗi khi xóa sản phẩm, vui lòng thử lại!");
        }
      },
    });
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

    // Tìm đúng sản phẩm có cùng product_id và product_variant_id
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

  return (
    <div>
      <main className="main">
        <div className="page-header text-center">
          <div className="container">
            <h1 className="page-title fs-3">Giỏ hàng</h1>
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
                    <table className="table table-cart">
                      <thead>
                        <tr className="text-center align-middle">
                          <th className="fs-4" style={{ width: "10%" }}>
                            Hình ảnh
                          </th>
                          <th
                            className="fs-4 text-start"
                            style={{ width: "35%" }}
                          >
                            Sản phẩm
                          </th>
                          <th className="fs-4" style={{ width: "15%" }}>
                            Giá
                          </th>
                          <th className="fs-4" style={{ width: "10%" }}>
                            Số lượng
                          </th>
                          <th className="fs-4" style={{ width: "15%" }}>
                            Tổng
                          </th>
                          <th className="fs-4" style={{ width: "5%" }}>
                            Xóa
                          </th>{" "}
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item, index) => {
                          const isVariant = item.product_variant_id !== null;

                          // Get product image
                          const productImage =
                            item.product?.thumbnail ||
                            "/images/default-image.jpg";

                          // Get product price (sale_price or sell_price)
                          const productPrice = isVariant
                            ? item.product_variant?.sale_price ||
                              item.product_variant?.sell_price
                            : item.product?.sale_price ||
                              item.product?.sell_price;

                          // Get product name
                          const productName =
                            item.product?.name || "Sản phẩm không xác định";

                          return (
                            <tr
                              key={index}
                              className="text-center align-middle"
                            >
                              <td>
                                <img
                                  src={productImage}
                                  alt={productName}
                                  width="75"
                                  height="75"
                                  onError={(e) =>
                                    (e.target.src = "/images/default-image.jpg")
                                  }
                                  style={{
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                  }}
                                />
                              </td>
                              <td className="fs-4 text-start">
                                {productName}
                                {item.product_variant_id && (
                                  <span className="text-muted">
                                    ({getAttributeValue(item)})
                                  </span>
                                )}
                              </td>
                              <td className="fs-4">
                                {formatCurrency(productPrice)}
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={cartItems[index]?.quantity || 1}
                                  min="1"
                                  onChange={(e) => {
                                    const newQuantity =
                                      parseInt(e.target.value) || 1;
                                    handleQuantityChange(index, newQuantity);
                                  }}
                                  className="text-center fs-4"
                                  style={{
                                    width: "55px",
                                    height: "35px",
                                    fontSize: "16px",
                                    color: "black",
                                    borderRadius: "5px",
                                    borderColor: "black",
                                  }}
                                />
                              </td>
                              <td className="fs-4">
                                {formatCurrency(productPrice * item.quantity)}
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm p-0"
                                  onClick={() =>
                                    handleRemoveItem(
                                      item.product_id,
                                      item.product_variant_id
                                    )
                                  }
                                  title="Xóa sản phẩm"
                                  style={{
                                    width: "25px",
                                    height: "25px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "14px",
                                  }}
                                >
                                  <i className="fa-solid fa-xmark text-danger"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
                <aside className="col-lg-3">
                  <div className="summary summary-cart">
                    <h3 className="summary-title fs-4">Tổng giỏ hàng</h3>
                    <table className="table table-summary">
                      <tbody>
                        <tr className="summary-subtotal fs-5">
                          <td>Tạm tính:</td>
                          <td>{formatCurrency(subtotal)}</td>
                        </tr>
                        <tr className="summary-total fs-5">
                          <td>Tổng cộng:</td>
                          <td>{formatCurrency(total)}</td>
                        </tr>
                      </tbody>
                    </table>
                    {/* <button
                      className="btn btn-outline-primary-2 btn-order btn-block fs-5"
                      onClick={handlePayment}
                    >
                      Thanh toán
                    </button> */}
                    <Link
                      to="/checkout"
                      className="btn btn-outline-primary-2 btn-order btn-block fs-5"
                    >
                      Checkout<i className="icon-long-arrow-right"></i>
                    </Link>
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
