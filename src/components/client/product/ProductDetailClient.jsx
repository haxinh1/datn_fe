import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productsServices } from "../../../services/product";
import { Card, Col, message, Modal, Row, Typography } from "antd";
import { cartServices } from "./../../../services/cart";

import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Autoplay, Pagination, Navigation } from "swiper/modules";
import formatVND from './../../../utils/formatPrice';

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
  const [attributes, setAttributes] = useState([]);
  const [dataViewed, setDataViewed] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState(null);

  const colorMap = {
    đen: "#333333",
    trắng: "#ffffff",
    đỏ: "#ff0000",
    "xanh dương": "#3a588b",
    vàng: "#eab656",
  };

  const { minPrice, maxPrice } = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return { minPrice: null, maxPrice: null };
    }

    // Lấy danh sách giá từ sale_price nếu có, nếu không thì lấy sell_price
    const prices = product.variants.map((variant) =>
      variant.sale_price ? parseFloat(variant.sale_price) : parseFloat(variant.sell_price)
    );

    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [product]);



  const handleColorSelect = (colorId) => {
    setSelectedColor(colorId);
    setSelectedColorId(colorId); 
    setSelectedSize("");
    setSelectedVariant(null);
  };

  const handleSizeSelect = (sizeId) => {
    setSelectedSize(sizeId);
    setSelectedSizeId(sizeId);
    findVariant(selectedColor, sizeId);
  };


  const formatPrice = (price) => {
    const formatter = new Intl.NumberFormat("de-DE", {
      style: "decimal",
      maximumFractionDigits: 0,
    });
    return formatter.format(price);
  };

  const findVariant = (colorId, sizeId) => {
    const variant = product.variants.find((v) => {
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

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };
  const handleAddToCart = async () => {
    if (product.variants.length > 0 && !selectedVariant) {
      message.error("Vui lòng chọn biến thể trước khi thêm vào giỏ hàng.");
      return;
    }

    let existingAttributes =
      JSON.parse(localStorage.getItem("cartAttributes")) || [];

    const newAttributes = {
      product_id: product.id,
      product_variant_id: selectedVariant ? selectedVariant.id : null, // ✅ Lưu thêm ID biến thể
      attributes: [
        { attribute_id: 1, attribute_value_id: selectedColorId },
        { attribute_id: 2, attribute_value_id: selectedSizeId },
      ],
    };

    // Kiểm tra xem sản phẩm có cùng ID và cùng biến thể đã có trong giỏ hàng chưa
    const existingProductIndex = existingAttributes.findIndex(
      (item) =>
        item.product_id === product.id &&
        item.product_variant_id === newAttributes.product_variant_id
    );

    if (existingProductIndex !== -1) {
      // Nếu đã tồn tại cùng sản phẩm & biến thể, cập nhật thuộc tính
      existingAttributes[existingProductIndex].attributes =
        newAttributes.attributes;
    } else {
      // Nếu chưa có, thêm mới vào giỏ hàng
      existingAttributes.push(newAttributes);
    }

    localStorage.setItem("cartAttributes", JSON.stringify(existingAttributes));

    const user = JSON.parse(localStorage.getItem("user"));
    const sessionId = sessionStorage.getItem("session_id");

    const itemToAdd = {
      user_id: user?.id || null,
      session_id: user ? null : sessionId,
      product_id: product.id,
      product_variant_id: selectedVariant ? selectedVariant.id : null,
      quantity: quantity,
      price: selectedVariant ? selectedVariant.price : product.sell_price,
      attributes: newAttributes.attributes,
    };
    console.log(itemToAdd);

    try {
      const response = await cartServices.addCartItem(product.id, itemToAdd);
      if (response?.message?.includes("Sản phẩm đã thêm vào giỏ hàng")) {
        message.success("Sản phẩm đã được thêm vào giỏ hàng!");
      } else {
        message.error("Thêm vào giỏ hàng thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      message.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.");
    }
  };
  if (!product) return <p>Đang tải...</p>;

  const fetchProduct = async () => {
    const { data, dataViewed, recommended_products } = await productsServices.fetchProductById(id);


    setProduct(data);
    setDataViewed(dataViewed);
    setRecommendedProducts(recommended_products);
  };



  const { Title } = Typography;


  useEffect(() => {
    fetchProduct();
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
              <a href="#">Home</a>
            </li>
            <li className="breadcrumb-item">
              <a href="#">Products</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Extended Description
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
                  <figure className="product-main-image">
                    <img
                      width={574}
                      height={574}
                      id="product-zoom"
                      src={mainImage}
                      data-zoom-image={mainImage}
                      alt="product image"
                    />

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
                    className="product-image-gallery"
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
                            alt={`product side ${index + 1}`}
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
                    <a
                      className="ratings-text"
                      href="#product-review-link"
                      id="review-link"
                    >
                      ( 2 Reviews )
                    </a>
                  </div>

                  <div className="product-price">
                    {formatPrice(minPrice)} VNĐ ~ {formatPrice(maxPrice)} VNĐ
                  </div>

                  {selectedVariant ? (
                    <div className="details-filter-row details-row-size">
                      <label>Stock:</label>
                      <div className="product-nav product-nav-dots">
                        <div>
                          {selectedVariant
                            ? selectedVariant.stock
                            : product.stock}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="details-filter-row details-row-size">
                      <label>Stock:</label>

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
                            (attr) => attr.attribute_value.attribute_id === 1
                          )
                          .map((item) => {
                            const colorName = item.attribute_value.value;
                            const colorCode = colorMap[colorName];
                            return (
                              <a
                                key={item}
                                href="#"
                                style={{ background: colorCode }}
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
                          <option value="">Select a size</option>
                          {product.atribute_value_product
                            .filter(
                              (attr) => attr.attribute_value.attribute_id === 2
                            )
                            .map((item) => {
                              return (
                                <option
                                  key={item.attribute_value_id}
                                  value={item.attribute_value_id}
                                >
                                  {item.attribute_value.value}
                                </option>
                              );
                            })}
                        </select>
                      </div>

                      <a href="#" className="size-guide">
                        <i className="icon-th-list"></i>size guide
                      </a>
                    </div>
                  )}
                  <div className="details-filter-row details-row-size">
                    <label htmlFor="qty">Qty:</label>
                    <div className="product-details-quantity">
                      <input
                        type="number"
                        id="qty"
                        className="form-control"
                        value={quantity}
                        min="1"
                        max={selectedVariant?.stock ? selectedVariant?.stock : product.stock}
                        step="1"
                        required
                        onChange={handleQuantityChange}
                      />
                    </div>
                  </div>

                  <div className="product-details-action">
                    <a
                      onClick={handleAddToCart}
                      href="#"
                      className="btn-product btn-cart"
                    >
                      <span>add to cart</span>
                    </a>

                    <div className="details-action-wrapper">
                      <a
                        href="#"
                        className="btn-product btn-wishlist"
                        title="Wishlist"
                      >
                        <span>Add to Wishlist</span>
                      </a>
                      <a
                        href="#"
                        className="btn-product btn-compare"
                        title="Compare"
                      >
                        <span>Add to Compare</span>
                      </a>
                    </div>
                  </div>

                  <div className="product-details-footer">
                    <div className="product-cat">
                      <span>Category:</span>
                      {product.categories &&
                        product.categories.map((category) => (
                          <span key={category.id}>
                            <a href="#">{category.name}</a>
                          </span>
                        ))}
                    </div>

                    <div className="social-icons social-icons-sm">
                      <span className="social-label">Share:</span>
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

      <div className="product-details-tab product-details-extended">
        <div className="container">
          <ul className="nav nav-pills justify-content-center" role="tablist">
            <li className="nav-item">
              <a
                className="nav-link active"
                id="product-desc-link"
                data-toggle="tab"
                href="#product-desc-tab"
                role="tab"
                aria-controls="product-desc-tab"
                aria-selected="true"
              >
                Description
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="product-info-link"
                data-toggle="tab"
                href="#product-info-tab"
                role="tab"
                aria-controls="product-info-tab"
                aria-selected="false"
              >
                Additional information
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="product-shipping-link"
                data-toggle="tab"
                href="#product-shipping-tab"
                role="tab"
                aria-controls="product-shipping-tab"
                aria-selected="false"
              >
                Shipping & Returns
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="product-review-link"
                data-toggle="tab"
                href="#product-review-tab"
                role="tab"
                aria-controls="product-review-tab"
                aria-selected="false"
              >
                Reviews (2)
              </a>
            </li>
          </ul>
        </div>

        <div className="tab-content">
          <div
            className="tab-pane fade show active"
            id="product-desc-tab"
            role="tabpanel"
            aria-labelledby="product-desc-link"
          >
            <div className="product-desc-content">
              <div
                className="product-desc-row bg-image"
                style={{ backgroundImage: `url(${product.thumbnail})` }}
              >
                <div className="container">
                  <div className="row justify-content-end">
                    <div className="col-sm-6 col-lg-4">
                      <h2>Product Information</h2>
                      <ul>
                        <li>Faux suede fabric upper</li>
                        <li>Tie strap buckle detail</li>
                        <li>Block heel</li>
                        <li>Open toe</li>
                        <li>Heel Height: 7cm / 2.5 inches</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {recommendedProducts.length > 0 && (
          <div className="container" style={{ marginTop: "50px" }}>
            <Title level={2} className="text-center" style={{ textAlign: "center", marginBottom: "20px" }}>
              Top 2 Sản phẩm tương tự mua nhiều
            </Title>
            <Row gutter={[16, 16]} justify="center">
              {recommendedProducts.map((product) => (
                <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    cover={<img alt={product.name} src={product.thumbnail} />}
                  >
                    <Card.Meta title={product.name} description={product.sale_price ? formatPrice(product.sale_price) : formatPrice(product.sell_price) + " VND"} />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

        )}

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
              {dataViewed && dataViewed.map((product, index) => (
                <SwiperSlide key={index}>
                  <div className="product product-7" style={{ width: "300px" }}>
                    <figure className="product-media">
                      <span className="product-label label-new">New</span>
                      <a href="product.html">
                        <img style={{ width: "300px", height: "300px" }} src={product.thumbnail} alt="Product image" className="product-image" />
                      </a>

                      <div className="product-action-vertical">
                        <a href="#" className="btn-product-icon btn-wishlist btn-expandable"><span>add to wishlist</span></a>
                        <a href="popup/quickView.html" className="btn-product-icon btn-quickview" title="Quick view"><span>Quick view</span></a>
                        <a href="#" className="btn-product-icon btn-compare" title="Compare"><span>Compare</span></a>
                      </div>

                      <div className="product-action">
                        <a href="#" className="btn-product btn-cart"><span>add to cart</span></a>
                      </div>
                    </figure>

                    <div className="product-body">
                    
                      <h3 className="product-title"><a href="product.html">{product.name}</a></h3>
                      <div className="product-price">{product.sale_price > 0 ? formatVND(product.sale_price) : formatVND(product.sell_price)} VND</div>

                      <div className="ratings-container">
                        <div className="ratings">
                          <div className="ratings-val" style={{ width: "80%" }}></div>
                        </div>
                        <span className="ratings-text">( 2 Đánh giá )</span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

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
      </div>
    </>
  );
};

export default ProductDetailClient;
