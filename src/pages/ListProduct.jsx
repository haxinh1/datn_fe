import React, { useEffect, useRef, useState } from "react";
import { productsServices } from "../services/product";
import { Link } from "react-router-dom";
import { BrandsServices } from "../services/brands";
import { categoryServices } from "./../services/categories";
import bg from "../assets/images/backgrounds/bg-1.jpg";
import { Pagination } from "antd";
import { AttributesServices } from "../services/attributes";
import axios from "axios"; // Thêm import axios để gọi API trực tiếp

const ListProduct = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [attribute, setAttribute] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentImages, setCurrentImages] = useState({});
  const [selectedVariantData, setSelectedVariantData] = useState({});
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9);
  const [selectedAttributeValues, setSelectedAttributeValues] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null); // Thêm trạng thái để lưu hình ảnh tạm thời

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await productsServices.fetchProducts();
        const activeProducts = data.data.filter((product) => product.is_active === 1);
        setProducts(activeProducts);
        setFilteredProducts(activeProducts.slice(0, pageSize));
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      }
    };
    getProducts();
  }, [pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    setFilteredProducts(products.slice(startIndex, endIndex));
  };

  const handleSearch = async (keyword) => {
    try {
      if (keyword.trim() === "") {
        setFilteredProducts(products);
      } else {
        const searchResults = await productsServices.searchProducts(keyword);
        setFilteredProducts(searchResults.data || []); // Đảm bảo lấy data từ response
      }
      setIsFiltered(true);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      setFilteredProducts([]);
    }
  };

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  useEffect(() => {
    const getBrands = async () => {
      try {
        const data = await BrandsServices.fetchBrands();
        setBrands(data.data);
      } catch (error) {
        console.error("Lỗi khi lấy thương hiệu:", error);
      }
    };
    getBrands();
  }, []);

  useEffect(() => {
    const getAttribute = async () => {
      try {
        const data = await AttributesServices.fetchAttributes();
        setAttribute(data.data);
      } catch (error) {
        console.error("Lỗi khi lấy thuộc tính:", error);
      }
    };
    getAttribute();
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
      try {
        const data = await categoryServices.fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
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

  const formatPrice = (price) => {
    const formatter = new Intl.NumberFormat("de-DE", {
      style: "decimal",
      maximumFractionDigits: 0,
    });
    return formatter.format(price);
  };

  const priceRanges = [
    { id: "price-1", label: `Dưới ${formatPrice(200000)} VNĐ`, min: 0, max: 200000 },
    { id: "price-2", label: `${formatPrice(200000)} - ${formatPrice(300000)} VNĐ`, min: 200000, max: 300000 },
    { id: "price-3", label: `${formatPrice(300000)} - ${formatPrice(400000)} VNĐ`, min: 300000, max: 400000 },
    { id: "price-4", label: `${formatPrice(400000)} - ${formatPrice(500000)} VNĐ`, min: 400000, max: 500000 },
    { id: "price-5", label: `${formatPrice(500000)} - ${formatPrice(600000)} VNĐ`, min: 500000, max: 600000 },
    { id: "price-6", label: `${formatPrice(600000)} - ${formatPrice(700000)} VNĐ`, min: 600000, max: 700000 },
    { id: "price-7", label: `Trên ${formatPrice(700000)} VNĐ`, min: 700000, max: Infinity },
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

      const { minPrice, maxPrice } = getVariantPriceRange(product);

      const matchesPrice =
        selectedPrices.length === 0 ||
        selectedPrices.some(
          (range) =>
            (minPrice >= range.min && minPrice <= range.max) ||
            (maxPrice >= range.min && maxPrice <= range.max)
        );

      const matchesAttributeValues =
        selectedAttributeValues.length === 0 ||
        product.atribute_value_product?.some((attr) =>
          selectedAttributeValues.includes(attr.attribute_value.id)
        );

      return matchesBrand && matchesCategory && matchesPrice && matchesAttributeValues;
    });

    setFilteredProducts(filtered);
    setIsFiltered(true);
  };

  const handleClear = () => {
    setFilteredProducts(products);
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedPrices([]);
    setSelectedAttributeValues([]);
    setIsFiltered(false);
    setKeyword("");
    setSelectedImage(null); // Xóa ảnh khi nhấn "QUAY LẠI"
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

    const currentDate = new Date();
    const effectivePrice =
      variant.sale_price > 0 &&
        variant.sale_price_end_at &&
        new Date(variant.sale_price_end_at) >= currentDate
        ? variant.sale_price
        : variant.sell_price;

    setSelectedVariantData((prevVariants) => ({
      ...prevVariants,
      [productId]: {
        ...variant,
        sale_price: effectivePrice,
      },
    }));
  };

  const getVariantPriceRange = (product) => {
    const currentDate = new Date();

    const getEffectivePrice = (item) => {
      if (
        item.sale_price > 0 &&
        item.sale_price_end_at &&
        new Date(item.sale_price_end_at) >= currentDate
      ) {
        return item.sale_price;
      }
      return item.sell_price;
    };

    const variantPrices =
      product.variants?.map((variant) => getEffectivePrice(variant)) || [];

    if (variantPrices.length === 0) {
      const price = getEffectivePrice(product);
      return { minPrice: price, maxPrice: price };
    }

    const minPrice = Math.min(...variantPrices);
    const maxPrice = Math.max(...variantPrices);

    return { minPrice, maxPrice };
  };

  const triggerImageUpload = () => {
    fileInputRef.current.click();
  };

  const handleRemoveImage = () => {
    setSelectedImage(null); // Xóa ảnh khi nhấp vào nút "x"
  };

  const handleImageSearch = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("Vui lòng chọn một hình ảnh!");
      return;
    }

    // Hiển thị hình ảnh tạm thời
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("image", file);

      // Gọi trực tiếp API thay vì dùng productsServices
      const response = await axios.post(
        "http://127.0.0.1:8000/api/search-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const result = response.data;
      console.log("Kết quả từ API:", result);

      // Sửa từ result.data thành result.datas để khớp với cấu trúc dữ liệu trả về
      if (result.datas && result.datas.length > 0) {
        const productsData = Array.isArray(result.datas)
          ? result.datas.map((item) => ({
            id: item.product_id || item.id,
            name: item.product_name || item.name,
            thumbnail: item.product_thumbnail || item.thumbnail,
            sell_price: item.product_sell_price || item.sell_price,
            sale_price: item.product_sale_price || item.sale_price,
            variants: item.variants || [],
          }))
          : [
            {
              id: result.datas.product_id || result.datas.id,
              name: result.datas.product_name || result.datas.name,
              thumbnail: result.datas.product_thumbnail || result.datas.thumbnail,
              sell_price: result.datas.product_sell_price || result.datas.sell_price,
              sale_price: result.datas.product_sale_price || result.datas.sale_price,
              variants: result.datas.variants || [],
            },
          ];
        setFilteredProducts(productsData);
        setIsFiltered(true);
      } else {
        alert(result.error || "Không tìm thấy sản phẩm phù hợp với hình ảnh."); // Chỉ thông báo lỗi
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sản phẩm bằng hình ảnh:", error);
      alert(`Đã có lỗi xảy ra: ${error.message || "Lỗi không xác định"}`); // Chỉ thông báo lỗi
    } finally {
      event.target.value = null;
    }
  };

  return (
    <div className="container mx-auto p-4 flex">
      <main className="main">
        <div
          className="page-header text-center"
          style={{ backgroundImage: `url(${bg})` }}
        >
          <div className="container">
            <h1 style={{ color: "#eea287" }}>SẢN PHẨM</h1>
          </div>
        </div>

        <nav aria-label="breadcrumb" className="breadcrumb-nav mb-2">
          <div className="container">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/">
                  <span>Trang Chủ</span>
                </Link>
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
                    <div
                      className="group1"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        height: "40px",
                        marginBottom: "20px",
                      }}
                    >
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{
                          flex: 1,
                          height: "40px",
                          padding: "0 10px",
                          margin: "0",
                          lineHeight: "normal",
                          boxSizing: "border-box",
                          fontSize: "14px",
                          borderRadius: "4px",
                        }}
                      />
                      <div style={{ position: "relative" }}>
                        <button
                          onClick={triggerImageUpload}
                          className="btn btn-outline-primary-2"
                          title="Tìm kiếm bằng hình ảnh hoặc thay đổi ảnh"
                          style={{
                            width: "40px",
                            height: "40px",
                            minWidth: "40px",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0",
                            margin: "0",
                            borderRadius: "4px",
                            lineHeight: "1",
                            boxSizing: "border-box",
                            border: "1px solid #d4d4d4",
                          }}
                        >
                          {selectedImage && (
                            <img
                              src={selectedImage}
                              alt="Selected"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                          )}
                          {!selectedImage && (
                            <i className="fa-solid fa-expand" style={{ lineHeight: "1", fontSize: "16px" }}></i>
                          )}
                        </button>
                        {selectedImage && (
                          <button
                            onClick={handleRemoveImage}
                            style={{
                              position: "absolute",
                              top: "-5px",
                              right: "-5px",
                              width: "16px",
                              height: "16px",
                              background: "#808080", // Nền xám
                              color: "#fff",
                              border: "none",
                              borderRadius: "50%",
                              fontSize: "10px",
                              lineHeight: "16px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            x
                          </button>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSearch}
                        accept="image/*"
                        style={{ display: "none" }}
                      />
                      <button
                        onClick={isFiltered ? handleClear : () => handleSearch(keyword)}
                        className="btn btn-outline-primary-2"
                        style={{
                          height: "40px",
                          padding: "0 20px",
                          margin: "0",
                          lineHeight: "40px",
                          boxSizing: "border-box",
                          fontSize: "14px",
                          borderRadius: "4px",
                          border: "1px solid #d4d4d4",
                        }}
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
                                src={currentImages[product.id] || product.thumbnail}
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
                                  const { minPrice, maxPrice } = getVariantPriceRange(product);
                                  return minPrice === maxPrice
                                    ? `${formatPrice(minPrice)} VNĐ`
                                    : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)} VNĐ`;
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
                  <div className="widget widget-collapsible">
                    <h3 className="widget-title">
                      <span>Danh mục</span>
                    </h3>

                    <div className="show" id="widget-1">
                      <div className="widget-body">
                        <div className="filter-items">
                          {categories.length > 0 &&
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
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

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

                  {attribute.map((attribute) => (
                    <div className="widget widget-collapsible" key={attribute.id}>
                      <h3 className="widget-title">
                        <span>{attribute.name}</span>
                      </h3>
                      <div className="show" id={`widget-${attribute.id}`}>
                        <div className="widget-body">
                          <div className="filter-items">
                            {attribute.id === 1 ? (
                              <div style={{ display: "flex", flexWrap: "wrap" }}>
                                {attribute.attribute_values.map((value) => (
                                  <div
                                    key={value.id}
                                    className={`color-circle ${value.value.toLowerCase()} ${selectedAttributeValues.includes(value.id) ? "selected" : ""}`}
                                    onClick={() => {
                                      setSelectedAttributeValues((prev) =>
                                        prev.includes(value.id)
                                          ? prev.filter((id) => id !== value.id)
                                          : [...prev, value.id]
                                      );
                                    }}
                                    title={value.value}
                                  />
                                ))}
                              </div>
                            ) : (
                              attribute.attribute_values.map((value) => (
                                <div className="filter-item" key={value.id}>
                                  <div className="custom-control custom-checkbox">
                                    <input
                                      className="custom-control-input"
                                      id={`attr-${attribute.id}-val-${value.id}`}
                                      type="checkbox"
                                      value={value.id}
                                      onChange={(e) => {
                                        const valueId = parseInt(e.target.value);
                                        setSelectedAttributeValues((prev) =>
                                          e.target.checked
                                            ? [...prev, valueId]
                                            : prev.filter((id) => id !== valueId)
                                        );
                                      }}
                                      checked={selectedAttributeValues.includes(value.id)}
                                    />
                                    <label
                                      className="custom-control-label"
                                      htmlFor={`attr-${attribute.id}-val-${value.id}`}
                                    >
                                      {value.value}
                                    </label>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="widget widget-collapsible">
                    <h3 className="widget-title">
                      <span>Mức Giá</span>
                    </h3>

                    <div className="show" id="widget-5">
                      <div className="widget-body">
                        <div className="filter-price">
                          <div className="filter-item">
                            {priceRanges.map((range, index) => (
                              <div className="custom-control custom-checkbox" key={index}>
                                <input
                                  className="custom-control-input"
                                  type="checkbox"
                                  id={`price-${index}`}
                                  checked={selectedPrices.some((r) => r.min === range.min && r.max === range.max)}
                                  onChange={() => handlePriceChange(range)}
                                />
                                <label className="custom-control-label" htmlFor={`price-${index}`}>
                                  {range.min === 0
                                    ? `Dưới ${formatPrice(range.max)} VNĐ`
                                    : range.max === Infinity
                                      ? `Trên ${formatPrice(range.min)} VNĐ`
                                      : `${formatPrice(range.min)} - ${formatPrice(range.max)} VNĐ`}
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