import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useParams } from "react-router-dom";
import { productsServices } from "../../services/product";
import moment from "moment";
import "./detailad.css";
import { BrandsServices } from "../../services/brands";
import { useQuery } from "@tanstack/react-query";
import { Button, Modal } from "antd";
import { categoryServices } from "../../services/categories";

const ProductDetail = () => {
  const { id } = useParams(); // Lấy ID sản phẩm từ URL
  const [product, setProduct] = useState(null); // Dữ liệu chi tiết sản phẩm
  const [images, setImages] = useState([]); // Mảng ảnh sản phẩm
  const [currentImage, setCurrentImage] = useState(""); // Ảnh hiện tại
  const [loading, setLoading] = useState(true); // Trạng thái tải
  const [error, setError] = useState(null); // Trạng thái lỗi
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await productsServices.fetchProductById(id);
        console.log("Dữ liệu sản phẩm API trả về:", response);

        if (response?.data) {
          setProduct(response.data);
        }

        // Kiểm tra nếu có thumbnail và galleries
        if (response?.data?.thumbnail) {
          setCurrentImage(response.data.thumbnail); // Sử dụng thumbnail làm ảnh chính
        }

        // Nếu có galleries, lấy danh sách ảnh
        if (Array.isArray(response.data?.galleries)) {
          const galleryImages = response.data.galleries.map((img) => img.image);
          setImages([response.data.thumbnail, ...galleryImages]); // Đưa thumbnail vào đầu danh sách
        } else {
          setImages([response.data.thumbnail]); // Chỉ có thumbnail nếu không có galleries
        }
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        setError("Lỗi khi lấy dữ liệu sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]); // Re-run khi id thay đổi

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryServices.fetchCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục sản phẩm:", error);
      }
    };

    fetchCategories();
  }, []);
  // Fetch danh sách thương hiệu
  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await BrandsServices.fetchBrands();
      return response.data;
    },
  });

  // Hàm định dạng giá
  const formatPrice = (price) => {
    const formatter = new Intl.NumberFormat("de-DE", {
      style: "decimal",
      maximumFractionDigits: 0,
    });
    return formatter.format(price);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  if (loading) return <p>Đang tải thông tin sản phẩm...</p>;
  if (error) return <p>{error}</p>;

  return (
    product && (
      <div className="container mt-5">
        <h2 style={{ margin: "20px" }}>Chi tiết sản phẩm</h2>
        <div className="row">
          {/* Hình ảnh sản phẩm */}
          <div className="col-md-4">
            <div className="text-center">
              {/* Hiển thị ảnh thumbnail đầu tiên */}
              {currentImage ? (
                <img
                  src={currentImage}
                  alt="Ảnh sản phẩm chính"
                  className="img-fluid mb-2 main-image"
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    maxWidth: "100%",
                    maxHeight: "400px",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <p>Không có ảnh sản phẩm</p>
              )}

              {/* Danh sách ảnh nhỏ (galleries) */}
              <div className="d-flex justify-content-start mt-2">
                {images.length > 0 ? (
                  images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="img-thumbnail me-2"
                      style={{
                        width: "80px", // Giảm kích thước ảnh thumbnail
                        height: "80px",
                        cursor: "pointer",
                        border: currentImage === img ? "2px solid #007bff" : "",
                      }}
                      onClick={() => setCurrentImage(img)} // Cập nhật ảnh lớn khi click
                      onError={(e) =>
                        (e.target.src = "https://via.placeholder.com/100")
                      }
                    />
                  ))
                ) : (
                  <p>Không có ảnh sản phẩm.</p>
                )}
              </div>
            </div>
          </div>

          {/* Thông tin sản phẩm */}
          <div className="col-md-8">
            <table className="table table-striped">
              <tbody>
                <tr>
                  <th>Mã sản phẩm:</th>
                  <td>{product.code || "Không có mã"}</td>
                </tr>
                <tr>
                  <th>Tên sản phẩm:</th>
                  <td>{product.name || "Không có tên"}</td>
                </tr>
                <tr>
                  <th>Thương hiệu sản phẩm:</th>
                  <td>
                    {(() => {
                      if (!brands || !Array.isArray(brands))
                        return "Đang tải...";
                      const brand = brands.find(
                        (b) => b.id === product.brand_id
                      );
                      return brand ? brand.name : "Không xác định";
                    })()}
                  </td>
                </tr>
                <tr>
                  <th>Danh mục sản phẩm:</th>
                  <td>
                    {product.categories && Array.isArray(product.categories)
                      ? product.categories
                          .map((category) => category.name)
                          .join(", ")
                      : product.categories?.name || "Không có danh mục"}
                  </td>
                </tr>
                <tr>
                  <th>Lượt xem:</th>
                  <td>{product.views || 0} Views</td>
                </tr>
                <tr>
                  <th>Giá bán:</th>
                  <td>{formatPrice(product.sell_price || 0)} VNĐ</td>
                </tr>
                <tr>
                  <th>Giá bán khuyến mãi:</th>
                  <td>{formatPrice(product.sale_price || 0)}VNĐ</td>
                </tr>
                <tr>
                  <th>Thời gian tạo:</th>
                  <td>{moment(product.created_at).format("DD/MM/YYYY")}</td>
                </tr>
                <tr>
                  <th>Ngày mở khuyến mại :</th>
                  <td>
                    {moment(product.sale_price_start_at).format("DD/MM/YYYY")}
                  </td>
                </tr>
                <tr>
                  <th>Ngày đóng khuyến mại:</th>
                  <td>
                    {moment(product.sale_price_end_at).format("DD/MM/YYYY")}
                  </td>
                </tr>
                <tr>
                  <th>Slug:</th>
                  <td>{product.slug} </td>
                </tr>
                <tr>
                  <th>Link sản phẩm:</th>
                  <td>
                    {product.name_link ? (
                      <a
                        href={product.name_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {product.name_link}
                      </a>
                    ) : (
                      "Không có"
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Phần mô tả sản phẩm */}
            <div className="product-description mt-4">
              <h4>Mô tả sản phẩm</h4>
              {/* <p>{product.content || "Không có mô tả"}</p> */}
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam
                quos ad facere, illum exercitationem repellat esse excepturi
                consequatur rerum? Sapiente id illum voluptate excepturi
                architecto eius obcaecati odio nisi praesentium, explicabo iste
                sint illo delectus doloribus impedit iure ipsum maxime totam
                dolor fugit! Nisi voluptatibus, deleniti dignissimos natus
                nihil, quia repellendus dolores voluptates cupiditate non nobis
                corporis perspiciatis, quaerat cumque laborum ea fuga ipsa
                fugiat excepturi? Cumque similique aliquid consectetur,
                blanditiis aut voluptas quo, dolorum obcaecati quod sequi facere
                recusandae sunt, laudantium repellat sed non illum fugiat magni
                illo in sit explicabo totam? Delectus ab nobis cupiditate
                molestias consectetur. Fuga?
              </p>
            </div>
          </div>
        </div>

        {/* Các nút hành động */}
        <div className=" mt-3 d-flex justify-content-end gap-2 flex-wrap">
          <Link to={`/edit-pr/${id}`} className="btn">
            <button className="btn btn-success">Cập nhật</button>
          </Link>
          {/* <Link className="btn">
            <button className="btn btn-success">Lịch sử nhập hàng</button>
          </Link> */}
          <Link className="btn" onClick={showModal}>
            <button className="btn btn-success">Lịch sử nhập hàng</button>
          </Link>
          <Modal
            title="Modal Title"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <p>Không có gì </p>
          </Modal>
        </div>
      </div>
    )
  );
};

export default ProductDetail;
