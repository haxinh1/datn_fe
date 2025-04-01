import React, { useEffect, useState } from "react";
import { productsServices } from "../services/product";
import { Link } from "react-router-dom";
import { BrandsServices } from "../services/brands";
import { categoryServices } from "./../services/categories";
import { Pagination } from "antd"; // Import Pagination from antd
import bg from "../assets/images/backgrounds/bg-1.jpg";

const ListProduct = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [currentImages, setCurrentImages] = useState({});
  const [selectedVariantData, setSelectedVariantData] = useState({});
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [cart, setCart] = useState(
    JSON.parse(sessionStorage.getItem("session_cart")) || []
  );
  const [message, setMessage] = useState(""); // Thêm state message
  const [messageType, setMessageType] = useState(""); // success hoặc error
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [pageSize] = useState(9); // 9 sản phẩm mỗi trang

  useEffect(() => {
    const getProducts = async () => {
      const data = await productsServices.fetchProducts();

      // Lọc sản phẩm có is_active = 1
      const activeProducts = data.data.filter(
        (product) => product.is_active === 1
      );

      setProducts(activeProducts);
      setFilteredProducts(activeProducts); // Cập nhật filteredProducts luôn
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
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
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
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Tách số thành định dạng tiền tệ
  const formatPrice = (price) => {
    const formatter = new Intl.NumberFormat("de-DE", {
      style: "decimal",
      maximumFractionDigits: 0,
    });
    return formatter.format(price);
  };

  // Danh sách khoảng giá
  const priceRanges = [
    {
      id: "price-1",
      label: `Dưới ${formatPrice(200000)} VNĐ`,
      min: 0,
      max: 200000,
    },
    {
      id: "price-2",
      label: `${formatPrice(200000)} - ${formatPrice(300000)} VNĐ`,
      min: 200000,
      max: 300000,
    },
    {
      id: "price-3",
      label: `${formatPrice(300000)} - ${formatPrice(400000)} VNĐ`,
      min: 300000,
      max: 400000,
    },
    {
      id: "price-4",
      label: `${formatPrice(400000)} - ${formatPrice(500000)} VNĐ`,
      min: 400000,
      max: 500000,
    },
    {
      id: "price-5",
      label: `${formatPrice(500000)} - ${formatPrice(600000)} VNĐ`,
      min: 500000,
      max: 600000,
    },
    {
      id: "price-6",
      label: `${formatPrice(600000)} - ${formatPrice(700000)} VNĐ`,
      min: 600000,
      max: 700000,
    },
    {
      id: "price-7",
      label: `Trên ${formatPrice(700000)} VNĐ`,
      min: 700000,
      max: Infinity,
    },
  ];

  const handlePriceChange = (range) => {
    setSelectedPrices((prev) =>
      prev.some((r) => r.min === range.min && r.max === range.max)
        ? prev.filter((r) => r.min !== range.min || r.max !== range.max)
        : [...prev, range]
    );
  };

  const handleFilter = () => {
    const filtered = products.filter((product) => {
      const matchesBrand =
        selectedBrands.length === 0 ||
        selectedBrands.includes(product.brand_id);

      const matchesCategory =
        selectedCategories.length === 0 ||
        product.categories.some((cat) => selectedCategories.includes(cat.id));

      // Lấy giá hiển thị thực tế của sản phẩm
      const productPrice = getDisplayedPrice(product);

      const matchesPrice =
        selectedPrices.length === 0 ||
        selectedPrices.some(
          (range) => productPrice >= range.min && productPrice <= range.max
        );
      return matchesBrand && matchesCategory && matchesPrice;
    });

    setFilteredProducts(filtered);
  };

  const handleClear = () => {
    setFilteredProducts(products); // Hiển thị lại toàn bộ sản phẩm
    setSelectedBrands([]); // Bỏ chọn tất cả thương hiệu
    setSelectedCategories([]); // Bỏ chọn tất cả danh mục
    setSelectedPrices([]); // Bỏ chọn tất cả mức giá
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

  // Phân trang
  const indexOfLastProduct = currentPage * pageSize;
  const indexOfFirstProduct = indexOfLastProduct - pageSize;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-4 flex">
      <main className="main">
        <div className="text-center">
          <img src={bg} alt="" />
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
                    {currentProducts.map((product) => (
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
                              <Link
                                to={`/product-detail/${product.id}`}
                                className="btn-product btn-cart"
                              >
                                <span>Chi tiết sản phẩm</span>
                              </Link>
                            </div>
                          </figure>
                          <div className="product-body">
                            <span className="product-title">
                              <Link to={`/product-detail/${product.id}`}>
                                {product.name}
                              </Link>
                            </span>
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

                {/* Pagination mới */}
                <Pagination
                  current={currentPage}
                  total={filteredProducts.length}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  style={{ textAlign: "right", marginTop: "20px" }} // Cập nhật textAlign
                />
              </div>
              <aside className="col-lg-3 order-lg-first">
                <div className="sidebar sidebar-shop">
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
                        <span>Danh mục</span>
                      </a>
                    </h3>

                    <div className="show" id="widget-1">
                      <div className="widget-body">
                        <div className="filter-items">
                          {categories.length > 0 &&
                            categories.flatMap((category) =>
                              (category.children || [category]).map(
                                (subCategory) => (
                                  <div
                                    key={subCategory.id}
                                    className="filter-item"
                                  >
                                    <div className="custom-control custom-checkbox">
                                      <input
                                        className="custom-control-input"
                                        id={`cat-${subCategory.id}`}
                                        type="checkbox"
                                        onChange={() =>
                                          handleCategoryChange(subCategory.id)
                                        }
                                        checked={selectedCategories.includes(
                                          subCategory.id
                                        )}
                                      />
                                      <label
                                        className="custom-control-label"
                                        htmlFor={`cat-${subCategory.id}`}
                                      >
                                        {subCategory.name}
                                      </label>
                                    </div>
                                  </div>
                                )
                              )
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
                        <span>Thương hiệu</span>
                      </Link>
                    </h3>

                    <div className="" id="widget-4">
                      <div className="widget-body">
                        <div className="filter-items">
                          {brands.length > 0 &&
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
                                  <label
                                    className="custom-control-label"
                                    htmlFor={`brand-${brand.id}`}
                                  >
                                    {brand.name}
                                  </label>
                                </div>
                              </div>
                            ))}
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
                        <span>Kích cỡ</span>
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
                        <span>Màu sắc</span>
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
                        <span>Mức Giá</span>
                      </a>
                    </h3>

                    <div className=" show" id="widget-5">
                      <div className="widget-body">
                        <div className="filter-price">
                          <div className="filter-item">
                            {priceRanges.map((range, index) => (
                              <div
                                className="custom-control custom-checkbox"
                                key={index}
                              >
                                <input
                                  className="custom-control-input"
                                  type="checkbox"
                                  id={`price-${index}`}
                                  checked={selectedPrices.some(
                                    (r) =>
                                      r.min === range.min && r.max === range.max
                                  )}
                                  onChange={() => handlePriceChange(range)}
                                />
                                <label
                                  className="custom-control-label"
                                  htmlFor={`price-${index}`}
                                >
                                  {range.min === 0
                                    ? `Dưới ${formatPrice(range.max)} VNĐ`
                                    : range.max === Infinity
                                    ? `Trên ${formatPrice(range.min)} VNĐ`
                                    : `${formatPrice(
                                        range.min
                                      )} - ${formatPrice(range.max)} VNĐ`}
                                </label>
                              </div>
                            ))}
                          </div>
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
    </div>
  );
};

export default ListProduct;
