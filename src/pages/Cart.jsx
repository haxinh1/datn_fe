import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartServices } from "./../services/cart";
import { message, Modal, Button, Table, InputNumber } from "antd";
import { productsServices } from "./../services/product";
import { ValuesServices } from "../services/attribute_value";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [attributeValues, setAttributeValues] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "product",
      render: (product) => (
        <img
          src={product.thumbnail || "/images/default-image.jpg"}
          alt={product.name}
          width={75}
          height={75}
          style={{
            objectFit: "cover",
            borderRadius: "8px",
          }}
        />
      ),
      width: "20%", // Thêm độ rộng cho cột Hình ảnh nếu cần
    },
    {
      title: "Sản phẩm",
      dataIndex: "product",
      render: (product, record) => (
        <>
          {product.name}
          {record.product_variant_id && (
            <span className="text-muted" style={{ fontSize: "14px" }}>
              ({getAttributeValue(record)})
            </span>
          )}
        </>
      ),
      width: "35%", // Tăng độ rộng cho cột Sản phẩm
    },
    {
      title: "Giá",
      dataIndex: "price",
      render: (price) => formatCurrency(price),
      width: "15%", // Điều chỉnh độ rộng nếu cần
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      render: (quantity, record, index) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(newQuantity) => handleQuantityChange(index, newQuantity)}
          style={{ width: "60%" }} // Thu nhỏ cột Số lượng
        />
      ),
      width: "17%", // Giảm độ rộng cho cột Số lượng
    },
    {
      title: "Tổng",
      dataIndex: "total",
      render: (_, record) => formatCurrency(record.price * record.quantity),
      width: "15%", // Điều chỉnh độ rộng nếu cần
    },
    {
      title: "Xóa",
      render: (_, record) => (
        <Button
          type="link"
          icon={<i className="fa-solid fa-xmark text-danger"></i>}
          onClick={() =>
            handleRemoveItem(record.product_id, record.product_variant_id)
          }
        />
      ),
      width: "5%", // Độ rộng cột Xóa
    },
  ];

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
