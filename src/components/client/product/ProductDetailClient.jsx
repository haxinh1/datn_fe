import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { productsServices } from "../../../services/product";
import { Card, Col, message, Modal, Row, Typography } from "antd";
import { cartServices } from "../../../services/cart";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import formatVND from "../../../utils/formatPrice";
import ProductTabs from "./ProductTabs";

const ProductDetailClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [modal2Open, setModal2Open] = useState(false);
  const [selectedColorId, setSelectedColorId] = useState(null);
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const [avgRate, setAvgRate] = useState(null);
  const [dataViewed, setDataViewed] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const colorMap = {
    đen: "#333333",
    trắng: "#ffffff",
    đỏ: "#ff0000",
    "xanh dương": "#3a588b",
    vàng: "#eab656",
  };

  const { Title } = Typography;

  // Tính giá min và max khi có biến thể
  const { minPrice, maxPrice } = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return { minPrice: null, maxPrice: null };
    }
    const prices = product.variants.map((variant) =>
      variant.sale_price ? parseFloat(variant.sale_price) : parseFloat(variant.sell_price)
    );
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [product]);

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

  // Tìm biến thể
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
    if (variant && variant.is_active === 0) {
      message.warning("Biến thể này đã ngừng kinh doanh. Vui lòng chọn biến thể khác.");
    }
  };

  // Thay đổi số lượng
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  // Thêm vào giỏ hàng
  const handleAddToCart = async () => {
    // Kiểm tra nếu sản phẩm đã ngừng kinh doanh
    if (product.is_active === 0) {
      message.error("Sản phẩm này đã ngừng kinh doanh.");
      return;
    }

    // Kiểm tra nếu có biến thể nhưng chưa chọn
    if (product.variants?.length > 0 && !selectedVariant) {
      message.error("Vui lòng chọn biến thể trước khi thêm vào giỏ hàng.");
      return;
    }

    // Kiểm tra nếu biến thể đã chọn có is_active = 0
    if (selectedVariant && selectedVariant.is_active === 0) {
      message.error("Biến thể này đã ngừng kinh doanh. Vui lòng chọn biến thể khác.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const itemToAdd = {
      user_id: user?.id || null,
      product_id: product.id,
      product_variant_id: selectedVariant ? selectedVariant.id : null,
      quantity: quantity,
      price: selectedVariant
        ? selectedVariant.sale_price || selectedVariant.sell_price
        : product.sale_price || product.sell_price,
      attributes: [
        { attribute_id: 1, attribute_value_id: selectedColorId },
        { attribute_id: 2, attribute_value_id: selectedSizeId },
      ],
    };

    try {
      if (user?.id) {
        // Người dùng đã đăng nhập
        await cartServices.addCartItem(product.id, itemToAdd);
        message.success("Sản phẩm đã được thêm vào giỏ hàng!");
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        // Người dùng chưa đăng nhập
        let existingAttributes = JSON.parse(localStorage.getItem("cartAttributes")) || [];
        let cartItems = JSON.parse(localStorage.getItem("cart_items")) || [];

        const newAttributes = {
          product_id: product.id,
          product_variant_id: selectedVariant ? selectedVariant.id : null,
          quantity: quantity,
          price: itemToAdd.price,
          attributes: itemToAdd.attributes,
        };

        const existingProductIndex = existingAttributes.findIndex(
          (item) =>
            item.product_id === product.id &&
            item.product_variant_id === newAttributes.product_variant_id
        );

        if (existingProductIndex !== -1) {
          existingAttributes[existingProductIndex].quantity += newAttributes.quantity;
        } else {
          existingAttributes.push(newAttributes);
        }

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

        localStorage.setItem("cartAttributes", JSON.stringify(existingAttributes));
        localStorage.setItem("cart_items", JSON.stringify(cartItems));
        message.success("Sản phẩm đã được thêm vào giỏ hàng!");
        window.dispatchEvent(new Event("cart-updated"));
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      message.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.");
    }
  };

  // Xử lý kéo thả
  const stockAvailable =
    (selectedVariant ? selectedVariant.stock : product.stock) > 0 &&
    product.is_active === 1 &&
    (!selectedVariant || selectedVariant.is_active === 1);

  const handleDragStart = (e) => {
    if (
      !stockAvailable ||
      product.is_active === 0 ||
      (selectedVariant && selectedVariant.is_active === 0) ||
      (product.variants?.length > 0 && !selectedVariant)
    ) {
      e.preventDefault();
      message.error(
        product.is_active === 0
          ? "Sản phẩm này đã ngừng kinh doanh."
          : product.variants?.length > 0 && !selectedVariant
            ? "Vui lòng chọn biến thể trước khi kéo."
            : selectedVariant && selectedVariant.is_active === 0
              ? "Biến thể này đã ngừng kinh doanh. Vui lòng chọn biến thể khác."
              : "Sản phẩm hết hàng."
      );
      return;
    }

    const dragData = {
      product_id: product.id,
      product_variant_id: selectedVariant ? selectedVariant.id : null,
      quantity: quantity,
      price: selectedVariant
        ? selectedVariant.sale_price || selectedVariant.sell_price
        : product.sale_price || product.sell_price,
      attributes: [
        { attribute_id: 1, attribute_value_id: selectedColorId },
        { attribute_id: 2, attribute_value_id: selectedSizeId },
      ],
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "move";

    const dragImage = new Image();
    dragImage.src = mainImage;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const scale = 0.4;

    dragImage.onload = () => {
      canvas.width = dragImage.width * scale;
      canvas.height = dragImage.height * scale;
      ctx.drawImage(dragImage, 0, 0, canvas.width, canvas.height);
      e.dataTransfer.setDragImage(canvas, canvas.width / 2, canvas.height / 2);
    };
  };

  // Lấy dữ liệu sản phẩm
  const fetchProduct = async () => {
    try {
      const { data, dataViewed, avgRate } = await productsServices.fetchProductById(id);
      setProduct(data);
      setDataViewed(dataViewed || []);
      setAvgRate(avgRate);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin sản phẩm:", error);
      message.error("Không thể tải sản phẩm. Vui lòng thử lại!");
    }
  };

  // Lấy sản phẩm đề xuất
  const fetchProductRecommend = async () => {
    try {
      const response = await productsServices.fetchProductRecommendById(id);
      setRecommendedProducts(response.recommended_products || []);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm đề xuất:", error);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchProductRecommend();
  }, [id]);

  useEffect(() => {
    if (product.thumbnail) {
      setMainImage(product.thumbnail);
    }
  }, [product.thumbnail]);

  return (
    <>
      <nav aria-label="breadcrumb" className="breadcrumb-nav border-0 mb-0">
        <div className="container d-flex align-items-center">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Trang Chủ</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/list-prcl">Sản Phẩm</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Chi Tiết
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
                      style={{ border: "1px solid #ddd", borderRadius: "10px" }}
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
                    style={{ display: "flex", overflowX: "auto", gap: "5px" }}
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
                  <h1 className="product-title">
                    {product.name}
                    {product.is_active === 0 && (
                      <span className="text-danger" style={{ marginLeft: "10px" }}>
                        (Sản phẩm đã ngừng kinh doanh)
                      </span>
                    )}
                  </h1>

                  {avgRate && (
                    <div className="ratings-container">
                      <div className="ratings">
                        <div
                          className="ratings-val"
                          style={{ width: `${avgRate.avg * 20}%` }}
                        ></div>
                      </div>
                      <a href="#product-review-link" id="review-link">
                        ({avgRate.total} Đánh giá)
                      </a>
                    </div>
                  )}

                  <div className="details-filter-row details-row-size">
                    <label>Lượt bán:</label>
                    <div className="product-nav product-nav-dots">
                      <div>{product.total_sales}</div>
                    </div>
                  </div>

                  {selectedVariant ? (
                    <div className="product-price">
                      {formatPrice(selectedVariant.sale_price || selectedVariant.sell_price)} VNĐ
                    </div>
                  ) : product.variants && product.variants.length === 0 ? (
                    <div className="product-price">
                      {formatPrice(product.sale_price || product.sell_price)} VNĐ
                    </div>
                  ) : (
                    <div className="product-price">
                      {minPrice === maxPrice
                        ? `${formatPrice(minPrice)} VNĐ`
                        : `${formatPrice(minPrice)} ~ ${formatPrice(maxPrice)} VNĐ`}
                    </div>
                  )}

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
                              .filter((attr) => attr.attribute_value.attribute_id === 1)
                              .map((item) => {
                                const colorName = item.attribute_value.value;
                                const colorCode = colorMap[colorName] || "#000";
                                return (
                                  <a
                                    key={item.attribute_value_id}
                                    href="#"
                                    style={{
                                      background: colorCode,
                                      border: "1px solid #ddd",
                                      borderRadius: "10px",
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleColorSelect(item.attribute_value_id);
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
                          <label htmlFor="size">Size:</label>
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
                            max={selectedVariant?.stock || product.stock}
                            step="1"
                            required
                            onChange={handleQuantityChange}
                          />
                        </div>
                      </div>

                      <div className="product-details-action">
                        <a
                          onClick={(e) => {
                            e.preventDefault();
                            if (
                              !stockAvailable ||
                              product.is_active === 0 ||
                              (selectedVariant && selectedVariant.is_active === 0)
                            ) {
                              message.error(
                                product.is_active === 0
                                  ? "Sản phẩm này đã ngừng kinh doanh."
                                  : !stockAvailable
                                    ? "Sản phẩm hết hàng."
                                    : "Biến thể này đã ngừng kinh doanh. Vui lòng chọn biến thể khác."
                              );
                              return;
                            }
                            handleAddToCart();
                          }}
                          href="#"
                          className={`btn-product btn-cart ${!stockAvailable ||
                            product.is_active === 0 ||
                            (selectedVariant && selectedVariant.is_active === 0)
                            ? "disabled text-muted"
                            : ""
                            }`}
                          style={{
                            pointerEvents:
                              !stockAvailable ||
                                product.is_active === 0 ||
                                (selectedVariant && selectedVariant.is_active === 0)
                                ? "none"
                                : "auto",
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
                            <Link to={`/detailcate/${category.id}`}>{category.name}</Link>
                          </span>
                        ))}
                    </div>

                    <div className="social-icons social-icons-sm">
                      <span className="social-label">Chia sẻ:</span>
                      <a href="#" className="social-icon" title="Facebook" target="_blank">
                        <i className="icon-facebook-f"></i>
                      </a>
                      <a href="#" className="social-icon" title="Twitter" target="_blank">
                        <i className="icon-twitter"></i>
                      </a>
                      <a href="#" className="social-icon" title="Instagram" target="_blank">
                        <i className="icon-instagram"></i>
                      </a>
                      <a href="#" className="social-icon" title="Pinterest" target="_blank">
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

      <div className="product-details-tab product-details-extended">
        <ProductTabs productId={product.id} product={product} />

        {recommendedProducts.length > 0 && (
          <div className="container" style={{ marginTop: "50px" }}>
            <Title level={2} className="text-center" style={{ marginBottom: "20px" }}>
              Sản Phẩm Hay Được Mua Cùng
            </Title>
            <Row gutter={[16, 16]} justify="center">
              {recommendedProducts.map((product) => (
                <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    onClick={() => navigate(`/product-detail/${product.id}`)}
                    hoverable
                    cover={<img alt={product.name} src={product.thumbnail} />}
                  >
                    <Card.Meta
                      title={product.name}
                      description={`${formatPrice(product.sale_price || product.sell_price)} VNĐ`}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {dataViewed.length > 0 && (
          <div className="container" style={{ marginTop: "50px" }}>
            <h2 className="title text-center mb-4">Top 8 Sản phẩm đã xem gần đây</h2>
            <div >
              <Swiper
                spaceBetween={30}
                slidesPerView={3}
                slidesPerGroup={1}
                autoplay={{
                  delay: 2500,
                  disableOnInteraction: false,
                }}
                pagination={{ clickable: true }}
                navigation={true}
                modules={[Autoplay, Pagination, Navigation]}
                className="mySwiper"
              >
                {dataViewed.map((product, index) => (
                  <SwiperSlide key={index}>
                    <div className="product product-7" style={{ width: "300px" }}>
                      <Card
                        onClick={() => navigate(`/product-detail/${product.id}`)}

                        hoverable
                        cover={<img alt={product.name} src={product.thumbnail} />}
                      >
                        <Card.Meta title={product.name} description={product.sale_price ? formatPrice(product.sale_price) : formatPrice(product.sell_price) + " VND"} />
                      </Card>
                      {/* <figure className="product-media">
                        <a href="product.html">
                          <img style={{ width: "300px", height: "300px" }} src={product.thumbnail} alt="Product image" className="product-image" />
                        </a>
                      </figure>

                      <div className="product-body">
                        <h3 className="product-title"><a href="product.html">{product.name}</a></h3>
                        <div className="product-price">{product.sale_price > 0 ? formatVND(product.sale_price) : formatVND(product.sell_price)} VND</div>

                      </div> */}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        )}

        <Modal
          centered
          open={modal2Open}
          onOk={() => setModal2Open(false)}
          onCancel={() => setModal2Open(false)}
          maskClosable={true}
          footer={null}
        >
          <img src={mainImage} alt="hình ảnh sản phẩm" style={{ padding: "20px" }} />
        </Modal>
      </div>
    </>
  );
};

export default ProductDetailClient;