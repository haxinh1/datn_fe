import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartServices } from "./../services/cart";
import { message, Modal } from "antd";
import { ValuesServices } from "../services/attribute_value";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [attributeValues, setAttributeValues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getCart = async () => {
      const data = await cartServices.fetchCart();
      setCartItems(data);
    };
    getCart();
  }, []);

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

    try {
      // Lấy variantId từ updatedCartItems nếu có
      const variantId = updatedCartItems[index].product_variant_id || null;

      await cartServices.updateCartItem(
        updatedCartItems[index].product_id,
        newQuantity,
        variantId // truyền variantId vào
      );

      message.success("Cập nhật số lượng thành công");
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật số lượng:",
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
                      <span>Giỏ hàng của bạn đang trống!</span>
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
                          {/* ✅ Cột xóa nhỏ */}
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item, index) => {
                          const isVariant = item.product_variant_id !== null;

                          // ✅ Lấy hình ảnh từ biến thể hoặc sản phẩm đơn
                          const productImage = isVariant
                            ? item.product_variant?.thumbnail ||
                              item.product?.thumbnail
                            : item.product?.thumbnail ||
                              "/images/default-image.jpg";

                          // ✅ Lấy giá sản phẩm (ưu tiên giá sale nếu có)
                          const productPrice = isVariant
                            ? item.product_variant?.sale_price ||
                              item.product_variant?.sell_price
                            : item.price;

                          // ✅ Lấy tên sản phẩm, tránh lỗi `undefined`
                          const productName = isVariant
                            ? `${item.product?.name} ${
                                item.product_variant?.name
                                  ? "- " + item.product_variant?.name
                                  : ""
                              }`
                            : item.product?.name || "Sản phẩm không xác định";

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
                                  value={cartItems[index]?.quantity || 1} // Đảm bảo lấy đúng số lượng
                                  min="1"
                                  onChange={(e) => {
                                    const newQuantity =
                                      parseInt(e.target.value) || 1;
                                    handleQuantityChange(index, newQuantity);
                                  }}
                                  className=" text-center fs-4"
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
