import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartServices } from "./../services/cart";
import { message, Modal } from "antd";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);
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
      ? item.product_variant.sale_price || item.product_variant.price
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
      await cartServices.updateCartItem(
        updatedCartItems[index].product_id,
        newQuantity
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

  const handleRemoveItem = async (productId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa sản phẩm này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await cartServices.removeCartItem(productId);
          setCartItems(
            cartItems.filter((item) => item.product_id !== productId)
          );
          message.success("Xóa sản phẩm thành công!");
        } catch (error) {
          console.error("Lỗi khi xóa sản phẩm:", error.response?.data || error);
          message.error("Lỗi khi xóa sản phẩm, vui lòng thử lại!");
        }
      },
    });
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
                              item.product_variant?.price
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
                              <td className="fs-4 text-start">{productName}</td>
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
                                  className="btn  btn-sm p-0"
                                  onClick={() =>
                                    handleRemoveItem(item.product_id)
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
