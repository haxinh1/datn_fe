import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartServices } from "./../services/cart";
import {
  message,
  Modal,
  Table,
  InputNumber,
  Button,
  Image,
  Checkbox,
  Tooltip,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { productsServices } from "./../services/product";
import { ValuesServices } from "../services/attribute_value";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [attributeValues, setAttributeValues] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubtotal, setSelectedSubtotal] = useState(0);
  const [selectedTotal, setSelectedTotal] = useState(0);

  useEffect(() => {
    const getCart = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user ? user.id : null;

        if (userId) {
          // Lấy giỏ hàng từ database khi đã đăng nhập
          const cartData = await cartServices.fetchCart();
          setCartItems(cartData);
        } else {
          // Lấy giỏ hàng từ localStorage khi chưa đăng nhập
          let localCartData =
            JSON.parse(localStorage.getItem("cart_items")) || [];

          // Lấy thông tin chi tiết sản phẩm/biến thể
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

              // Giá ưu tiên variant, nếu không thì lấy giá của sản phẩm gốc
              const price = variantDetails
                ? variantDetails.sale_price || variantDetails.sell_price
                : productDetails.data.sale_price ||
                  productDetails.data.sell_price;

              return {
                ...item,
                product: productDetails.data,
                product_variant: variantDetails,
                price, // ✅ Đảm bảo luôn có giá
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

  // Log the cartItems to verify the data after setting
  useEffect(() => {
    console.log("Giỏ hàng sau khi setCartItems:", cartItems);
  }, [cartItems]);

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

  useEffect(() => {
    const selectedItems = cartItems.filter((_, index) =>
      selectedRowKeys.includes(index)
    );
    const newSelectedSubtotal = selectedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    setSelectedSubtotal(newSelectedSubtotal);
    setSelectedTotal(newSelectedSubtotal + shippingCost);
  }, [cartItems, selectedRowKeys, shippingCost]);

  const getAttributeValue = (product) => {
    const attributes = JSON.parse(localStorage.getItem("cartAttributes")) || [];

    // Kiểm tra nếu sản phẩm có biến thể (variant)
    if (product.product_variant_id) {
      const productAttributes = attributes.find(
        (attr) =>
          attr.product_id === product.product_id &&
          attr.product_variant_id === product.product_variant_id
      );

      if (productAttributes && productAttributes.attributes) {
        return productAttributes.attributes
          .map((attr) => {
            const attribute = attributeValues.find(
              (av) => String(av.id) === String(attr.attribute_value_id)
            );
            return attribute ? attribute.value : "Không xác định";
          })
          .join(", ");
      }
    }

    // Nếu sản phẩm là đơn giản (không có biến thể), không hiển thị thuộc tính
    return ""; // Trả về chuỗi rỗng nếu không có biến thể
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleSelectChange = (selectedKeys) => {
    setSelectedRowKeys(selectedKeys);
  };

  // Cập nhật subtotal và total khi chọn sản phẩm
  const selectedItems = cartItems.filter((item) =>
    selectedRowKeys.includes(item.key)
  );

  // Cấu hình rowSelection cho bảng
  const rowSelection = {
    selectedRowKeys,
    onChange: handleSelectChange,
  };

  // Xóa nhiều sản phẩm đã chọn
  const handleRemoveSelectedItems = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn sản phẩm cần xóa.");
      return;
    }

    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa các sản phẩm đã chọn khỏi giỏ hàng?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          // Xóa sản phẩm khỏi giỏ hàng (localStorage hoặc server)
          setCartItems((prevItems) =>
            prevItems.filter((item, index) => !selectedRowKeys.includes(index))
          );

          setSelectedRowKeys([]);

          message.success("Sản phẩm đã được xóa thành công!");
        } catch (error) {
          console.error("Lỗi khi xóa sản phẩm:", error);
          message.error("Lỗi khi xóa sản phẩm, vui lòng thử lại!");
        }
      },
    });
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
        // Nếu người dùng đã đăng nhập, cập nhật giỏ hàng trên server
        await cartServices.updateCartItem(productId, newQuantity, variantId);
        message.success("Cập nhật số lượng thành công");
      } else {
        // Nếu người dùng chưa đăng nhập, cập nhật giỏ hàng trong localStorage
        let localCart = JSON.parse(localStorage.getItem("cart_items")) || [];

        // Tìm và cập nhật sản phẩm trong localStorage
        const key = productId + "-" + (variantId ?? "default");
        const existingItemIndex = localCart.findIndex(
          (item) =>
            item.product_id === productId &&
            (item.product_variant_id === variantId || !variantId)
        );

        if (existingItemIndex !== -1) {
          localCart[existingItemIndex].quantity = newQuantity;
        }

        // Lưu lại giỏ hàng vào localStorage
        localStorage.setItem("cart_items", JSON.stringify(localCart));

        message.success("Cập nhật số lượng thành công ");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
      message.error("Lỗi khi cập nhật số lượng, vui lòng thử lại!");
    }
  };

  const handleRemoveItem = async (productId, productVariantId) => {
    // Show confirmation modal
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          // Remove the product from the cart on the backend
          await cartServices.removeCartItem(productId, productVariantId);
          // Update the cart after removing the product
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

  const handleCheckoutClick = (e) => {
    // If no items are selected, show an error and prevent navigation
    if (selectedRowKeys.length === 0) {
      e.preventDefault(); // Prevent navigation
      message.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
      return;
    }

    // Gather selected items with necessary information for checkout
    const selectedItemsForCheckout = selectedRowKeys.map((key) => {
      const selectedItem = cartItems[key];
      const attributes =
        JSON.parse(localStorage.getItem("cartAttributes")) || [];
      let variantAttributes = [];

      if (selectedItem.product_variant_id) {
        // Get variant attributes if product has a variant
        const productAttributes = attributes.find(
          (attr) =>
            attr.product_id === selectedItem.product_id &&
            attr.product_variant_id === selectedItem.product_variant_id
        );

        if (productAttributes && productAttributes.attributes) {
          variantAttributes = productAttributes.attributes.map((attr) => {
            const attribute = attributeValues.find(
              (av) => String(av.id) === String(attr.attribute_value_id)
            );
            return attribute ? attribute.value : "Không xác định";
          });
        }
      }

      // Return the item with necessary fields for checkout
      return {
        product_id: selectedItem.product_id,
        name: selectedItem.product.name,
        quantity: selectedItem.quantity,
        price: selectedItem.price,
        product_variant_id: selectedItem.product_variant_id || null,
        variant_attributes: variantAttributes,
      };
    });

    // Proceed to checkout page with selected items and their details
    // Pass the selected items to the checkout page via state
    navigate("/checkout", {
      state: {
        selectedItems: selectedItemsForCheckout,
        // Send selected items with necessary info
      },
    });
    console.log("selectedItems trong Cart:", selectedItemsForCheckout);
  };

  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      align: "center",
      render: (text) => (
        <Image
          src={text}
          alt="Sản phẩm"
          width={45}
          fallback="/images/default-image.jpg"
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (text, record) => (
        <>
          {text}
          {record.variant && (
            <span className="text-muted" style={{ fontSize: "14px" }}>
              ({record.variant})
            </span>
          )}
        </>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      align: "center",
      render: (price) => formatCurrency(price),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      render: (quantity, record, index) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => handleQuantityChange(index, value)}
        />
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      align: "center",
      render: (total) => formatCurrency(total),
    },
    {
      title: "",
      key: "delete",
      align: "center",
      render: (_, record) => (
        <Tooltip title="Xóa sản phẩm">
          <Button
            type="text"
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

  const dataSource = cartItems.map((item, index) => ({
    key: index,
    image:
      item.product_variant?.thumbnail ||
      item.product?.thumbnail ||
      "/images/default-image.jpg",
    name:
      item.product?.name +
      (item.product_variant?.name ? ` - ${item.product_variant.name}` : ""),
    variant: getAttributeValue(item),
    price: item.price,
    quantity: item.quantity,
    total: item.price * item.quantity,
    product_id: item.product_id,
    product_variant_id: item.product_variant_id,
  }));

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
                  <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={dataSource}
                    pagination={false}
                  />

                  <div className="group1">
                    <Button
                      color="danger"
                      variant="solid"
                      onClick={handleRemoveSelectedItems}
                      icon={<DeleteOutlined />}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>

                <aside className="col-lg-3">
                  <div className="summary summary-cart">
                    <h3 className="summary-title fs-4">Giỏ hàng đã chọn</h3>
                    <table className="table table-summary">
                      <tbody>
                        <tr className="summary-subtotal fs-5">
                          <td>Tạm tính:</td>
                          <td>{formatCurrency(selectedSubtotal)}</td>
                        </tr>
                        <tr className="summary-total fs-5">
                          <td>Tổng tiền:</td>
                          <td>{formatCurrency(selectedTotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                    <Link
                      to="/checkout"
                      className="btn btn-outline-primary-2 btn-order btn-block fs-5"
                      onClick={handleCheckoutClick} // Trigger the error message check and proceed to checkout
                    >
                      Thanh toán<i className="icon-long-arrow-right"></i>
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
