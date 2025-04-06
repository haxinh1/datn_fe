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
  const [attributes, setAttributes] = useState([]);
  const colorMap = {
    đen: "#333333",
    trắng: "#ffffff",
    đỏ: "#ff0000",
    "xanh dương": "#3a588b",
    vàng: "#eab656",
  };

  const handleColorSelect = (colorId) => {
    setSelectedColor(colorId);
    setSelectedColorId(colorId);
    setSelectedSize(""); // reset size when color is changed
    setSelectedVariant(null); // reset variant
  };

  const handleSizeSelect = (sizeId) => {
    setSelectedSize(sizeId);
    setSelectedSizeId(sizeId);
    findVariant(selectedColor, sizeId); // update variant based on color and size
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
      // If product exists, update quantity
      existingAttributes[existingProductIndex].quantity +=
        newAttributes.quantity;
    } else {
      // If product doesn't exist, add to cart
      existingAttributes.push(newAttributes);
    }

    localStorage.setItem("cartAttributes", JSON.stringify(existingAttributes));

    const user = JSON.parse(localStorage.getItem("user"));
    const itemToAdd = {
      user_id: user?.id || null, // 0 nếu chưa đăng nhập
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
        // If user is logged in, send request to add item to cart in database
        await cartServices.addCartItem(product.id, itemToAdd);
      } else {
        // If user is not logged in, send request to store cart in session
        await cartServices.addCartItem(product.id, itemToAdd);
      }

      // Display success message
      message.success("Sản phẩm đã được thêm vào giỏ hàng!");
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      message.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.");
    }
  };

  const fetchProduct = async () => {
    const { data } = await productsServices.fetchProductById(id);
    setProduct(data);
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
                  <h1 className="product-title">
                    {product.name}
                    {product.is_active === 0 && (
                      <span
                        className="text-danger"
                        style={{ marginLeft: "10px" }}
                      >
                        (Sản phẩm đã ngừng kinh doanh)
                      </span>
                    )}
                  </h1>

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
                    {formatPrice(product.sell_price)} VNĐ
                  </div>

                  {selectedVariant ? (
                    <div className="details-filter-row details-row-size">
                      <label>Tồn kho:</label>
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
                          <option value="">Chọn size</option>
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
                    {stockAvailable ? (
                      <a
                        onClick={(e) => {
                          if (product.is_active === 0) {
                            e.preventDefault();
                            message.error(
                              "Sản phẩm này đã ngừng kinh doanh và không thể thêm vào giỏ hàng."
                            );
                          } else {
                            handleAddToCart();
                          }
                        }}
                        href="#"
                        className={`btn-product btn-cart ${
                          product.is_active === 0 ? "disabled" : ""
                        }`}
                      >
                        <span>Thêm vào giỏ hàng</span>
                      </a>
                    ) : (
                      <span className="btn-product btn-cart disabled text-muted">
                        Hết hàng
                      </span>
                    )}
                  </div>

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
