import React, { useEffect, useState } from 'react';
import "../assets/css/bootstrap.min.css";
import "../assets/css/plugins/owl-carousel/owl.carousel.css";
import "../assets/css/plugins/magnific-popup/magnific-popup.css";
import "../assets/css/plugins/jquery.countdown.css";
import "../assets/css/style.css";
import "../assets/css/skins/skin-demo-8.css";
import "../assets/css/demos/demo-8.css";
import bg from "../assets/images/backgrounds/bg-1.jpg";
import banner1 from "../assets/images/category/boxed/banner-1.jpg";
import banner2 from "../assets/images/category/boxed/banner-2.jpg";
import banner3 from "../assets/images/category/boxed/banner-3.jpg";
import banner4 from "../assets/images/category/boxed/banner-4.jpg";
import banner5 from "../assets/images/category/boxed/banner-5.jpg";
import banner6 from "../assets/images/category/boxed/banner-6.jpg";
import banner7 from "../assets/images/category/boxed/banner-7.jpg";
import banner8 from "../assets/images/category/boxed/banner-8.jpg";
import { Link } from 'react-router-dom';
import { categoryServices } from '../services/categories';

const Cate = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            const response = await categoryServices.fetchCategories();
            setCategories(response);
        };
        fetchCategories();
    }, []);

    const handleCategoryClick = (id) => {
        setSelectedCategory(id);
        // Có thể gọi thêm xử lý lọc sản phẩm tại đây
        console.log("Selected Category ID:", id);
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

                <nav aria-label="breadcrumb" className="breadcrumb-nav">
                    <div className="container">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <Link to='/'><span>Trang Chủ</span></Link>
                            </li>
                            <li className="breadcrumb-item">
                                <span>Danh Mục</span>
                            </li>
                        </ol>
                    </div>
                </nav>

                <div className="page-content">
                    <div className="categories-page">
                        <div className="container">
                            <div className="row">
                                {categories.flatMap((category) =>
                                    category.children
                                        .filter((child) => child.parent_id !== null)
                                        .map((child) => (
                                            <div key={child.id} className="col-sm-3 mb-4">
                                                <div
                                                    className="banner banner-cat banner-badge"
                                                    style={{
                                                        border: selectedCategory === child.id ? '2px solid #eea287' : '',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => handleCategoryClick(child.id)}
                                                >
                                                    <a>
                                                        <img
                                                            src={banner1}
                                                            alt={child.name}
                                                        />
                                                    </a>
                                                    <div className="banner-link">
                                                        <h3 className="banner-title">{child.name}</h3>
                                                        <h4 className="banner-subtitle">Sản phẩm</h4>
                                                        <span className="banner-link-text">Xem Ngay</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Cate;