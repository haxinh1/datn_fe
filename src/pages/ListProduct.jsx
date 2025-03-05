import React, { useEffect, useState } from "react";
import { productsServices } from "../services/product";
import { Link } from "react-router-dom";
import { BrandsServices } from "../services/brands";
import { categoryServices } from './../services/categories';

const ListProduct = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [currentImages, setCurrentImages] = useState({});
  const [selectedVariantData, setSelectedVariantData] = useState({});
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [cart, setCart] = useState(
    JSON.parse(sessionStorage.getItem("session_cart")) || []
  );
  const [message, setMessage] = useState(""); // Thêm state message
  const [messageType, setMessageType] = useState(""); // success hoặc error

  useEffect(() => {
    const getProducts = async () => {
      const data = await productsServices.fetchProducts();
      setProducts(data.data);
    };
    getProducts();
  }, []);

  useEffect(() => {
    setFilteredProducts(products); // Cập nhật khi products thay đổi
  }, [products]);

  useEffect(() => {
    const getBrands = async () => {
      const data = await BrandsServices.fetchBrands();
      setBrands(data.data);
    };
    getBrands();
  }, []);

  const handleBrandChange = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]
    );
  };

  useEffect(() => {
    const getCategories = async () => {
      const data = await categoryServices.fetchCategories();
      setCategories(data);
    };
    getCategories();
  }, []);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleFilter = () => {
    const filtered = products.filter((product) => {
      const matchesBrand =
        selectedBrands.length === 0 || selectedBrands.includes(product.brand_id);
  
      const matchesCategory =
        selectedCategories.length === 0 ||
        product.categories.some((cat) => selectedCategories.includes(cat.id));
  
      return matchesBrand && matchesCategory;
    });
  
    setFilteredProducts(filtered);
  };

  const handleClear = () => {
    setFilteredProducts(products); // Hiển thị lại toàn bộ sản phẩm
    setSelectedBrands([]); // Bỏ chọn tất cả thương hiệu
    setSelectedCategories([]); // Bỏ chọn tất cả danh mục
  };

  useEffect(() => {
    const defaultImages = {};
    products.forEach((product) => {
      defaultImages[product.id] = product.thumbnail;
    });
    setCurrentImages(defaultImages);
  }, [products]);

  const handleThumbnailClick = (productId, variant) => {
    setCurrentImages((prevImages) => ({
      ...prevImages,
      [productId]: variant.thumbnail,
    }));

    setSelectedVariantData((prevVariants) => ({
      ...prevVariants,
      [productId]: {
        ...variant,
        sale_price:
          variant.sale_price > 0 ? variant.sale_price : variant.sell_price,
      },
    }));
  };

  const handleAddToCart = async (product) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const rawToken = localStorage.getItem("client_token");
    const sessionId = sessionStorage.getItem("session_id");

    const itemToAdd = {
      user_id: user && user.id ? user.id : null,
      session_id: user && user.id ? null : sessionId,
      product_id: product.id,
      product_variant_id: selectedVariantData[product.id]?.id || null,
      quantity: 1,
    };

    console.log("Dữ liệu gửi lên server:", itemToAdd);

    try {
      const response = await cartServices.addCartItem(product.id, itemToAdd);
      console.log("Phản hồi từ server:", response);

      if (
        response &&
        response.message.includes("Sản phẩm đã thêm vào giỏ hàng")
      ) {
        setMessage("Sản phẩm đã được thêm vào giỏ hàng thành công!");
        setMessageType("success");
      } else {
        setMessage("Thêm vào giỏ hàng thất bại! Vui lòng thử lại.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      setMessage("Không thể thêm vào giỏ hàng. Vui lòng thử lại sau!");
      setMessageType("error");
    }

    // Tự động ẩn message sau 3 giây
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  const getDisplayedPrice = (product) => {
    const selectedVariant = selectedVariantData[product.id];

    // Nếu biến thể được chọn có sale_price hợp lệ, dùng sale_price
    if (selectedVariant?.sale_price > 0) return selectedVariant.sale_price;

    // Nếu biến thể được chọn có sell_price hợp lệ, dùng sell_price
    if (selectedVariant?.sell_price > 0) return selectedVariant.sell_price;

    // Nếu sản phẩm chính có sale_price hợp lệ, dùng sale_price
    if (product.sale_price > 0) return product.sale_price;

    // Nếu không có sale_price, dùng sell_price của sản phẩm chính
    return product.sell_price;
  };

  // Tách số thành định dạng tiền tệ
  const formatPrice = (price) => {
    const formatter = new Intl.NumberFormat("de-DE", {
      style: "decimal",
      maximumFractionDigits: 0,
    });
    return formatter.format(price);
  };

  return (
    <div className="container mx-auto p-4 flex">
      <main className="main">
        {message && (
          <div
            className={`message-box ${
              messageType === "success" ? "message-success" : "message-error"
            }`}
            style={{
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
              textAlign: "center",
              fontWeight: "bold",
              backgroundColor:
                messageType === "success" ? "#d4edda" : "#f8d7da",
              color: messageType === "success" ? "#155724" : "#721c24",
              border:
                messageType === "success"
                  ? "1px solid #c3e6cb"
                  : "1px solid #f5c6cb",
            }}
          >
            {message}
          </div>
        )}
        <div
          className="page-header text-center"
          style={{
            backgroundImage: "url('assets/images/page-header-bg.jpg')",
          }}
        >
          <div className="container">
            <h1 className="page-title">
              Grid 3 Columns
              <span>Shop</span>
            </h1>
          </div>
        </div>
        <nav aria-label="breadcrumb" className="breadcrumb-nav mb-2">
          <div className="container">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="index.html">Home</a>
              </li>
              <li className="breadcrumb-item">
                <a href="#">Shop</a>
              </li>
              <li aria-current="page" className="breadcrumb-item active">
                Grid 3 Columns
              </li>
            </ol>
          </div>
        </nav>
        <div className="page-content">
          <div className="container">
            <div className="row">
              <div className="col-lg-9">
                <div className="products mb-3">
                  <div className="row justify-content-center">
                    {filteredProducts.map((product) => (
                      <div className="col-6 col-md-4 col-lg-4" key={product.id}>
                        <div className="product product-7 text-center">
                          <figure className="product-media">
                            <Link to={`/product-detail/${product.id}`}>
                              <img
                                alt={product.name}
                                className="product-image"
                                src={
                                  currentImages[product.id] || product.thumbnail
                                }
                                style={{
                                  width: "300px",
                                  height: "380px",
                                  objectFit: "cover",
                                }}
                              />
                            </Link>
                            <div className="product-action">
                              <button
                                className="btn-product btn-cart"
                                onClick={() => handleAddToCart(product)}
                              >
                                <span>Thêm vào giỏ hàng</span>
                              </button>
                            </div>
                          </figure>
                          <div className="product-body">
                            <h3 className="product-title">
                              <Link to={`/product-detail/${product.id}`}>
                                {product.name}
                              </Link>
                            </h3>
                            <div className="product-price">
                              {formatPrice(getDisplayedPrice(product))} VNĐ
                            </div>
                            <div className="product-nav product-nav-thumbs">
                              {product.variants?.map((variant) => (
                                <span key={variant.id}>
                                  <img
                                    alt={`Biến thể của ${product.name}`}
                                    src={variant.thumbnail}
                                    onClick={() =>
                                      handleThumbnailClick(product.id, variant)
                                    }
                                  />
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center">
                    <li className="page-item disabled">
                      <a
                        aria-disabled="true"
                        aria-label="Previous"
                        className="page-link page-link-prev"
                        href="#"
                        tabIndex="-1"
                      >
                        <span aria-hidden="true">
                          <i className="icon-long-arrow-left" />
                        </span>
                        Prev
                      </a>
                    </li>
                    <li aria-current="page" className="page-item active">
                      <a className="page-link" href="#">
                        1
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        2
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        3
                      </a>
                    </li>
                    <li className="page-item-total">of 6</li>
                    <li className="page-item">
                      <a
                        aria-label="Next"
                        className="page-link page-link-next"
                        href="#"
                      >
                        Next{" "}
                        <span aria-hidden="true">
                          <i className="icon-long-arrow-right" />
                        </span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
              <aside className="col-lg-3 order-lg-first">
                <div className="sidebar sidebar-shop">
                  <div className="widget widget-clean">
                    <label>Filters:</label>
                    <a className="sidebar-filter-clear" href="#">
                      Clean All
                    </a>
                  </div>

                  {/* List danh mục */}
                  <div className="widget widget-collapsible">
                    <h3 className="widget-title">
                      <a
                        aria-controls="widget-1"
                        aria-expanded="true"
                        data-toggle="collapse"
                        href="#widget-1"
                        role="button"
                      >
                        Danh mục
                      </a>
                    </h3>

                    <div className="show" id="widget-1">
                      <div className="widget-body">
                        <div className="filter-items">
                          {categories.length > 0 ? (
                            categories.flatMap((category) =>
                              (category.children || [category]).map((subCategory) => (
                                <div key={subCategory.id} className="filter-item">
                                  <div className="custom-control custom-checkbox">
                                    <input
                                      className="custom-control-input"
                                      id={`cat-${subCategory.id}`}
                                      type="checkbox"
                                      onChange={() => handleCategoryChange(subCategory.id)}
                                      checked={selectedCategories.includes(subCategory.id)}
                                    />
                                    <label
                                      className="custom-control-label"
                                      htmlFor={`cat-${subCategory.id}`}
                                    >
                                      {subCategory.name}
                                    </label>
                                  </div>
                                </div>
                              ))
                            )
                          ) : (
                            <p>Không có danh mục</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* List thương hiệu */}
                  <div className="widget widget-collapsible">
                    <h3 className="widget-title">
                      <Link
                        aria-controls="widget-4"
                        aria-expanded="true"
                        data-toggle="collapse"
                        href="#widget-4"
                        role="button"
                      >
                        Thương hiệu
                      </Link>
                    </h3>

                    <div className="" id="widget-4">
                      <div className="widget-body">
                        <div className="filter-items">
                          {brands.length > 0 ? (
                            brands.map((brand) => (
                              <div key={brand.id} className="filter-item">
                                <div className="custom-control custom-checkbox">
                                  <input
                                    className="custom-control-input"
                                    id={`brand-${brand.id}`}
                                    type="checkbox"
                                    onChange={() => handleBrandChange(brand.id)}
                                    checked={selectedBrands.includes(brand.id)}
                                  />
                                  <label className="custom-control-label" htmlFor={`brand-${brand.id}`}>
                                    {brand.name}
                                  </label>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p>Không có thương hiệu</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* List size */}
                  <div className="widget widget-collapsible">
                    <h3 className="widget-title">
                      <a
                        aria-controls="widget-2"
                        aria-expanded="true"
                        data-toggle="collapse"
                        href="#widget-2"
                        role="button"
                      >
                        Kích cỡ
                      </a>
                    </h3>

                    <div className=" show" id="widget-2">
                      <div className="widget-body">
                        <div className="filter-items">
                          <div className="filter-item">
                            <div className="custom-control custom-checkbox">
                              <input
                                className="custom-control-input"
                                id="size-1"
                                type="checkbox"
                              />
                              <label
                                className="custom-control-label"
                                htmlFor="size-1"
                              >
                                XS
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* List màu */}
                  <div className="widget widget-collapsible">
                    <h3 className="widget-title">
                      <a
                        aria-controls="widget-3"
                        aria-expanded="true"
                        data-toggle="collapse"
                        href="#widget-3"
                        role="button"
                      >
                        Màu sắc
                      </a>
                    </h3>

                    <div className=" show" id="widget-3">
                      <div className="widget-body">
                        <div className="filter-colors">
                          <a
                            href="#"
                            style={{
                              background: "#b87145",
                            }}
                          >
                            <span className="sr-only">Color Name</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="widget widget-collapsible">
                    <h3 className="widget-title">
                      <a
                        aria-controls="widget-5"
                        aria-expanded="true"
                        data-toggle="collapse"
                        href="#widget-5"
                        role="button"
                      >
                        Giá
                      </a>
                    </h3>

                    <div className=" show" id="widget-5">
                      <div className="widget-body">
                        <div className="filter-price">
                          <div className="filter-price-text">
                            Price Range:
                            <span id="filter-price-range" />
                          </div>
                          <div id="price-slider" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="attribute">
                    <button 
                      type="submit" 
                      className="btn btn-outline-primary-2"
                      onClick={handleFilter}
                    >
                      <span>TÌM KIẾM</span>
                    </button>

                    <button 
                      onClick={handleClear} 
                      className="btn btn-outline-primary-2"
                    >
                      <span>QUAY LẠI</span>
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
      ;
    </div>
  );
};

export default ListProduct;
