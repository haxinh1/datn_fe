import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import bg from "../assets/images/backgrounds/bg-1.jpg";
import { productsServices } from '../services/product';
import { Pagination } from 'antd';

const DetailCate = () => {
    const { id } = useParams();
    const [products, setProducts] = useState([]);
    const [currentImages, setCurrentImages] = useState({});
    const [keyword, setKeyword] = useState("");
    const [isFiltered, setIsFiltered] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState(products);
    const [category, setCategory] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(12);

    useEffect(() => {
        const getProducts = async () => {
            const data = await productsServices.productByCategory(id);
            setCategory(data.category);

            // Lọc sản phẩm có is_active = 1
            const activeProducts = data.data.filter(
                (product) => product.is_active === 1
            );

            setProducts(activeProducts);
            setFilteredProducts(activeProducts.slice(0, pageSize));
        };
        getProducts();
    }, [id]);

    useEffect(() => {
        const defaultImages = {};
        products.forEach((product) => {
            defaultImages[product.id] = product.thumbnail;
        });
        setCurrentImages(defaultImages);
    }, [products]);

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

    const handleClear = () => {
        setFilteredProducts(products); // Hiển thị lại toàn bộ sản phẩm
        setIsFiltered(false); // Đánh dấu là không lọc nữa
        setKeyword("");
    };

    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat("de-DE", {
            style: "decimal",
            maximumFractionDigits: 0,
        });
        return formatter.format(price);
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

    const handlePageChange = (page) => {
        setCurrentPage(page);
        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;
        setFilteredProducts(products.slice(startIndex, endIndex)); // Lấy các sản phẩm tương ứng với trang
    };

    return (
        <div className="container mx-auto p-4 flex">
            <main className="main">
                <div
                    className="page-header text-center"
                    style={{ backgroundImage: `url(${bg})` }}
                >
                    <div className="container">
                        <h1 style={{ color: "#eea287" }}>{category?.name}</h1>
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
                                <Link to="/cate">
                                    <span>Danh Mục</span>
                                </Link>
                            </li>
                            <li className="breadcrumb-item">
                                <span>{category?.name}</span>
                            </li>
                        </ol>
                    </div>
                </nav>

                <div className="page-content">
                    <div className="container">
                        <div className="row">
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

                                    {(isFiltered ? filteredProducts : products).map((product) => (
                                        <div className="col-6 col-md-4 col-lg-3" key={product.id}>
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
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DetailCate;
