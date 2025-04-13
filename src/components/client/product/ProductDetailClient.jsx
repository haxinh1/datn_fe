import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { productsServices } from "../../../services/product";
import { message, Modal } from "antd";
import { cartServices } from "../../../services/cart";

const ProductDetailClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(product.thumbnail || "");
  const [modal2Open, setModal2Open] = useState(false);
  const [selectedColorId, setSelectedColorId] = useState(null);
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const colorMap = {
    đen: "#333333",
    trắng: "#ffffff",
    đỏ: "#ff0000",
    "xanh dương": "#3a588b",
    vàng: "#eab656",
  };

  // Chọn màu sắc
  const handleColorSelect = (colorId) => {
    setSelectedColor(colorId);
    setSelectedColorId(colorId);
    setSelectedSize("");
    setSelectedVariant(null);
  };

  // Chọn kích thước
  const handleSizeSelect = (sizeId) => {
    setSelectedSize(sizeId);
    setSelectedSizeId(sizeId);
    findVariant(selectedColor, sizeId);
  };

  // Định dạng giá tiền
  const formatPrice = (price) => {
    const formatter = new Intl.NumberFormat("de-DE", {
      style: "decimal",
      maximumFractionDigits: 0,
    });
    return formatter.format(price);
  };

  // Tìm biến thể dựa trên màu và kích thước
  const findVariant = (colorId, sizeId) => {
    const variant = product.variants?.find((v) => {
      const variantAttributes = v.attribute_value_product_variants.map(
        (attr) => attr.attribute_value_id
      );
      return (
        variantAttributes.includes(colorId) &&
        variantAttributes.includes(Number(sizeId))
      );
    });
    setQuantity(1);
    setSelectedVariant(variant || null);
  };

  // Thay đổi số lượng
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const handleAddToCart = async () => {
    if (product.variants?.length > 0 && !selectedVariant) {
      message.error("Vui lòng chọn biến thể trước khi thêm vào giỏ hàng.");
      return;
    }
    let existingAttributes =
      JSON.parse(localStorage.getItem("cartAttributes")) || [];

    const newAttributes = {
      product_id: product.id,
      product_variant_id: selectedVariant ? selectedVariant.id : null,
      quantity: quantity,
      price: selectedVariant
        ? selectedVariant.price
        : product.sale_price || product.sell_price,
      attributes: [
        { attribute_id: 1, attribute_value_id: selectedColorId },
        { attribute_id: 2, attribute_value_id: selectedSizeId },
      ],
    };

    const existingProductIndex = existingAttributes.findIndex(
      (item) =>
        item.product_id === product.id &&
        item.product_variant_id === newAttributes.product_variant_id
    );

    if (existingProductIndex !== -1) {
      existingAttributes[existingProductIndex].quantity +=
        newAttributes.quantity;
    } else {
      existingAttributes.push(newAttributes);
    }

    localStorage.setItem("cartAttributes", JSON.stringify(existingAttributes));

    const user = JSON.parse(localStorage.getItem("user"));
    const itemToAdd = {
      user_id: user?.id || null,
      product_id: product.id,
      product_variant_id: selectedVariant ? selectedVariant.id : null,
      quantity: quantity,
      price: selectedVariant
        ? selectedVariant.price
        : product.sale_price || product.sell_price,
      attributes: newAttributes.attributes,
    };

    try {
      if (user?.id) {
        await cartServices.addCartItem(product.id, itemToAdd);
      } else {
        let cartItems = JSON.parse(localStorage.getItem("cart_items")) || [];
        const existingCartItemIndex = cartItems.findIndex(
          (item) =>
            item.product_id === product.id &&
            item.product_variant_id === itemToAdd.product_variant_id
        );

        if (existingCartItemIndex !== -1) {
          cartItems[existingCartItemIndex].quantity += quantity;
        } else {
          cartItems.push({
            product_id: product.id,
            product_variant_id: selectedVariant ? selectedVariant.id : null,
            quantity: quantity,
          });
        }
        localStorage.setItem("cart_items", JSON.stringify(cartItems));
      }

      message.success("Sản phẩm đã được thêm vào giỏ hàng!");
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      message.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.");
    }
  };

  // Lấy thông tin sản phẩm
  const fetchProduct = async () => {
    try {
      const { data } = await productsServices.fetchProductById(id);
      setProduct(data);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin sản phẩm:", error);
      message.error("Không thể tải sản phẩm. Vui lòng thử lại!");
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product.thumbnail) {
      setMainImage(product.thumbnail);
    }
  }, [product.thumbnail]);

  const stockAvailable =
    (selectedVariant ? selectedVariant.stock : product.stock) > 0;

  // Xử lý sự kiện bắt đầu kéo
  const handleDragStart = (e) => {
    if (!stockAvailable || (product.variants?.length > 0 && !selectedVariant)) {
      e.preventDefault();
      message.error(
        product.variants?.length > 0 && !selectedVariant
          ? "Vui lòng chọn biến thể trước khi kéo."
          : "Sản phẩm hết hàng."
      );
      return;
    }

    const dragData = {
      product_id: product.id,
      product_variant_id: selectedVariant ? selectedVariant.id : null,
      quantity: quantity,
      price: selectedVariant
        ? selectedVariant.price
        : product.sale_price || product.sell_price,
      attributes: [
        { attribute_id: 1, attribute_value_id: selectedColorId },
        { attribute_id: 2, attribute_value_id: selectedSizeId },
      ],
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "move";

    // Create a smaller drag image
    const dragImage = new Image();
    dragImage.src = mainImage;

    // Use a canvas to scale down the image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set the desired scale (40% of original size for ~60% reduction)
    const scale = 0.4;

    // Wait for the image to load before drawing
    dragImage.onload = () => {
      // Set canvas size to scaled dimensions
      canvas.width = dragImage.width * scale;
      canvas.height = dragImage.height * scale;

      // Draw scaled image on canvas
      ctx.drawImage(dragImage, 0, 0, canvas.width, canvas.height);

      // Set the canvas as the drag image
      e.dataTransfer.setDragImage(canvas, canvas.width / 2, canvas.height / 2);
    };
  };

  return (
    <>
      <nav aria-label="breadcrumb" className="breadcrumb-nav border-0 mb-0">
        <div className="container d-flex align-items-center">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">
                <span>Trang Chủ</span>
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/list-prcl">
                <span>Sản Phẩm</span>
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              <span>Chi Tiết</span>
            </li>
          </ol>
        </div>
      </nav>
      <div className="page-content">
        <div className="container">
          <div className="product-details-top mb-2">
            <div className="row">
              <div className="col-md-6">
                <div className="product-gallery">
                  <figure
                    className="product-main-image"
                    style={{ position: "relative" }}
                    draggable={stockAvailable}
                    onDragStart={handleDragStart}
                  >
                    <img
                      width={574}
                      height={574}
                      id="product-zoom"
                      src={mainImage}
                      data-zoom-image={mainImage}
                      alt="hình ảnh sản phẩm"
                    />
                    {product.is_active === 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          background: "rgba(176, 176, 176, 0.85)",
                          color: "#fff",
                          padding: "10px 24px",
                          fontWeight: "bold",
                          fontSize: "16px",
                          borderRadius: "8px",
                          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                          zIndex: 5,
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        🚫 Sản phẩm đã ngừng kinh doanh
                      </div>
                    )}
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        setModal2Open(true);
                      }}
                      href="#"
                      id="btn-product-gallery"
                      className="btn-product-gallery"
                    >
                      <i className="icon-arrows"></i>
                    </a>
                  </figure>
                  <div
                    id="product-zoom-gallery"
                    style={{
                      display: "flex",
                      overflowX: "auto",
                      gap: "5px",
                    }}
                  >
                    {product.galleries &&
                      product.galleries.slice(0, 4).map((item, index) => (
                        <a
                          key={index}
                          className="product-gallery-item"
                          href="#"
                          data-image={item.image}
                          data-zoom-image={item.image}
                          onClick={(e) => {
                            e.preventDefault();
                            setMainImage(item.image);
                          }}
                        >
                          <img
                            src={item.image}
                            alt={`hình ảnh sản phẩm ${index + 1}`}
                          />
                        </a>
                      ))}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="product-details">
                  <h1 className="product-title">{product.name}</h1>

                  <div className="ratings-container">
                    <div className="ratings">
                      <div
                        className="ratings-val"
                        style={{ width: "80%" }}
                      ></div>
                    </div>
                    <a>
                      <span className="text-confirm">
                        ({product.views} lượt xem)
                      </span>
                    </a>
                  </div>

                  <div className="product-price">
                    {formatPrice(product.sell_price)} VNĐ
                  </div>

                  {product.is_active === 1 && (
                    <>
                      {selectedVariant ? (
                        <div className="details-filter-row details-row-size">
                          <label>Tồn kho:</label>
                          <div className="product-nav product-nav-dots">
                            <div>{selectedVariant.stock}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="details-filter-row details-row-size">
                          <label>Tồn kho:</label>
                          <div className="product-nav product-nav-dots">
                            <div>{product.stock}</div>
                          </div>
                        </div>
                      )}

                      {product.atribute_value_product?.length > 0 && (
                        <div className="details-filter-row details-row-size">
                          <label htmlFor="Color">Màu:</label>
                          <div className="product-nav product-nav-dots">
                            {product.atribute_value_product
                              .filter(
                                (attr) =>
                                  attr.attribute_value.attribute_id === 1
                              )
                              .map((item) => {
                                const colorName = item.attribute_value.value;
                                const colorCode = colorMap[colorName];
                                return (
                                  <a
                                    key={item.attribute_value_id}
                                    href="#"
                                    style={{ background: colorCode }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleColorSelect(
                                        item.attribute_value_id
                                      );
                                    }}
                                  >
                                    <span className="sr-only">{colorName}</span>
                                  </a>
                                );
                              })}
                          </div>
                        </div>
                      )}

                      {product.atribute_value_product?.length > 0 && (
                        <div className="details-filter-row details-row-size">
                          <label htmlFor="size">Size: </label>
                          <div className="select-custom">
                            <select
                              name="size"
                              id="size"
                              className="form-control"
                              value={selectedSize}
                              onChange={(e) => handleSizeSelect(e.target.value)}
                            >
                              <option value="">Chọn size</option>
                              {product.atribute_value_product
                                .filter(
                                  (attr) =>
                                    attr.attribute_value.attribute_id === 2
                                )
                                .map((item) => (
                                  <option
                                    key={item.attribute_value_id}
                                    value={item.attribute_value_id}
                                  >
                                    {item.attribute_value.value}
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* <a href="#" className="size-guide">
                            <i className="icon-th-list"></i>Hướng dẫn kích thước
                          </a> */}
                        </div>
                      )}

                      <div className="details-filter-row details-row-size">
                        <label htmlFor="qty">Số lượng:</label>
                        <div className="product-details-quantity">
                          <input
                            type="number"
                            id="qty"
                            className="form-control"
                            value={quantity}
                            min="1"
                            max={
                              selectedVariant?.stock
                                ? selectedVariant?.stock
                                : product.stock
                            }
                            step="1"
                            required
                            onChange={handleQuantityChange}
                          />
                        </div>
                      </div>

                      <div className="product-details-action">
                        <a
                          onClick={(e) => {
                            if (!stockAvailable) {
                              e.preventDefault();
                              return;
                            }
                            handleAddToCart();
                          }}
                          href="#"
                          className={`btn-product btn-cart ${
                            !stockAvailable ? "disabled text-muted" : ""
                          }`}
                          style={{
                            pointerEvents: !stockAvailable ? "none" : "auto",
                            fontFamily: "'Roboto', 'Arial', sans-serif",
                          }}
                        >
                          Giỏ hàng
                        </a>
                      </div>
                    </>
                  )}

                  <div className="product-details-footer">
                    <div className="product-cat">
                      <span>Danh Mục:</span>
                      {product.categories &&
                        product.categories.map((category) => (
                          <span key={category.id}>
                            <a href="#">{category.name}</a>
                          </span>
                        ))}
                    </div>

                    <div className="social-icons social-icons-sm">
                      <span className="social-label">Chia sẻ:</span>
                      <a
                        href="#"
                        className="social-icon"
                        title="Facebook"
                        target="_blank"
                      >
                        <i className="icon-facebook-f"></i>
                      </a>
                      <a
                        href="#"
                        className="social-icon"
                        title="Twitter"
                        target="_blank"
                      >
                        <i className="icon-twitter"></i>
                      </a>
                      <a
                        href="#"
                        className="social-icon"
                        title="Instagram"
                        target="_blank"
                      >
                        <i className="icon-instagram"></i>
                      </a>
                      <a
                        href="#"
                        className="social-icon"
                        title="Pinterest"
                        target="_blank"
                      >
                        <i className="icon-pinterest"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        centered
        open={modal2Open}
        onOk={() => setModal2Open(false)}
        onCancel={() => setModal2Open(false)}
        maskClosable={true}
        footer={null}
      >
        <img src={mainImage} alt="" style={{ padding: "20px" }} />
      </Modal>
    </>
  );
};

export default ProductDetailClient;
