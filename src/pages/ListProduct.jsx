import React, { useEffect, useState } from "react";
import { productsServices } from "../services/product";
import { Link } from "react-router-dom";
import { BrandsServices } from "../services/brands";
import { categoryServices } from "./../services/categories";
import bg from "../assets/images/backgrounds/bg-1.jpg";
import { Pagination } from "antd";

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
  const [keyword, setKeyword] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9);

  useEffect(() => {
    const getProducts = async () => {
      const data = await productsServices.fetchProducts();

      // Lọc sản phẩm có is_active = 1
      const activeProducts = data.data.filter(
        (product) => product.is_active === 1
      );

      setProducts(activeProducts);
      setFilteredProducts(activeProducts.slice(0, pageSize)); // Cập nhật filteredProducts luôn
    };
    getProducts();
  }, [pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    setFilteredProducts(products.slice(startIndex, endIndex)); // Lấy các sản phẩm tương ứng với trang
  };

  const handleSearch = async (keyword) => {
    try {
      if (keyword.trim() === "") {
        setFilteredProducts(products); // Nếu từ khóa trống, hiển thị lại tất cả sản phẩm
      } else {
        const searchResults = await productsServices.searchProducts(keyword); // Gọi service tìm kiếm sản phẩm
        setFilteredProducts(searchResults); // Cập nhật lại danh sách sản phẩm
      }
      setIsFiltered(true);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      setFilteredProducts([]); // Nếu có lỗi, để mảng sản phẩm trống
    }
  };

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
    setIsFiltered(true); // Đánh dấu là đang lọc
  };

  const handleClear = () => {
    setFilteredProducts(products); // Hiển thị lại toàn bộ sản phẩm
    setSelectedBrands([]); // Bỏ chọn tất cả thương hiệu
    setSelectedCategories([]); // Bỏ chọn tất cả danh mục
    setSelectedPrices([]); // Bỏ chọn tất cả mức giá
    setIsFiltered(false); // Đánh dấu là không lọc nữa
    setKeyword("");
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

  const getVariantPriceRange = (product) => {
    const variantPrices =
      product.variants?.map((variant) =>
        variant.sale_price > 0 ? variant.sale_price : variant.sell_price
      ) || [];

    if (variantPrices.length === 0) {
      const price =
        product.sale_price > 0 ? product.sale_price : product.sell_price;
      return { minPrice: price, maxPrice: price };
    }

    const minPrice = Math.min(...variantPrices);
    const maxPrice = Math.max(...variantPrices);

    return { minPrice, maxPrice };
  };

  return (
    <div className="container mx-auto p-4 flex">
      <main className="main">

        <div
          className="page-header text-center"
          style={{ backgroundImage: `url(${bg})` }}
        >
          <div className="container">
            <h1 style={{ color: '#eea287' }}>MOLLA SHOP</h1>
          </div>
        </div>

        <nav aria-label="breadcrumb" className="breadcrumb-nav mb-2">
          <div className="container">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to='/'><span>Trang Chủ</span></Link>
              </li>
              <li className="breadcrumb-item">
                <span>Sản Phẩm</span>
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
                    <div className="group1">
                      <input
                        type="text"
                        class="form-control"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={keyword} // Lưu trữ từ khóa trong state keyword
                        onChange={(e) => setKeyword(e.target.value)} // Cập nhật giá trị khi người dùng nhập
                      />
                      <button
                        onClick={
                          isFiltered ? handleClear : () => handleSearch(keyword)
                        } // Gọi hàm tìm kiếm khi nhấn nút
                        className="btn btn-outline-primary-2"
                      >
                        {isFiltered ? "QUAY LẠI" : "TÌM KIẾM"}
                      </button>
                    </div>

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
                              <a className="btn-product">
                                <Link to={`/product-detail/${product.id}`}>
                                  <span>xem chi tiết</span>
                                </Link>
                              </a>
                            </div>
                          </figure>

                          <div className="product-body">
                            <span className="product-title">
                              <Link to={`/product-detail/${product.id}`}>
                                <span>{product.name}</span>
                              </Link>
                            </span>

                            <div className="product-price" style={{ marginTop: "20px" }}>
                              <strong>
                                {(() => {
                                  const { minPrice, maxPrice } =
                                    getVariantPriceRange(product);
                                  return minPrice === maxPrice
                                    ? `${formatPrice(minPrice)} VNĐ`
                                    : `${formatPrice(minPrice)} - ${formatPrice(
                                      maxPrice
                                    )} VNĐ`;
                                })()}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="avatar">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={products.length}
                    onChange={handlePageChange}
                  />
                </div>
              </div>

              <aside className="col-lg-3 order-lg-first">
                <div className="sidebar sidebar-shop">
                  {/* List danh mục */}
                  <div className="widget widget-collapsible">
                    <h3 className="widget-title">
                      <span>Danh mục</span>
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
                      <span>Thương hiệu</span>
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
                      <span>Kích cỡ</span>
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
                      <span>Màu sắc</span>
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
                      <span>Mức Giá</span>
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
                      onClick={isFiltered ? handleClear : handleFilter}
                    >
                      <span>{isFiltered ? "QUAY LẠI" : "TÌM KIẾM"}</span>
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
