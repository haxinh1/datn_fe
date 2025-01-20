import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from "react-router-dom";
import { productsServices } from "../../services/product";
import moment from "moment"; // Đảm bảo đã import đúng
import "./detailad.css";
import { BrandsServices } from "../../services/brands";
import { useQuery } from "@tanstack/react-query";

const ProductDetail = () => {
  const { id } = useParams(); // Lấy ID sản phẩm từ URL
  const [product, setProduct] = useState(null); // Dữ liệu chi tiết sản phẩm
  const [images, setImages] = useState([]); // Mảng ảnh sản phẩm
  const [currentImage, setCurrentImage] = useState(""); // Ảnh hiện tại
  const [loading, setLoading] = useState(true); // Trạng thái tải
  const [error, setError] = useState(null); // Trạng thái lỗi

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const data = await productsServices.fetchProductById(id);
        console.log("Dữ liệu sản phẩm:", data);
        setProduct(data.data);
        if (data?.images?.length > 0) {
          setImages(data.images);
          setCurrentImage(data.images[0]);
        }
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        setError("Lỗi khi lấy dữ liệu sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  // Fetch danh sách thương hiệu
  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await BrandsServices.fetchBrands();
      return response.data;
    }
  });

  // tách số 
  const formatPrice = (price) => {
    const formatter = new Intl.NumberFormat("de-DE", {
      style: "decimal",
      maximumFractionDigits: 0, // Không có số thập phân
    });
    return formatter.format(price);
  };

  if (loading) return <p>Đang tải thông tin sản phẩm...</p>;
  if (error) return <p>{error}</p>;

  return (
    product && (
      <div className="container mt-5">
        <h2 style={{ margin: "20px" }}>Thông tin chi tiết sản phẩm</h2>
        <div className="row">
          {/* Hình ảnh sản phẩm */}
          <div className="col-md-4">
            <div className="text-center">
              {product.thumbnail ? (
                <img
                  src={product.thumbnail}
                  alt="Thumbnail"
                  className="img-fluid mb-2"
                  style={{ border: "1px solid #ddd", borderRadius: "5px" }}
                />
              ) : (
                <p>Không có ảnh sản phẩm</p>
              )}
              <div className="d-flex justify-content-start mt-2">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="img-thumbnail me-2"
                    style={{
                      width: "70px",
                      height: "70px",
                      cursor: "pointer",
                      border:
                        currentImage === image.url ? "2px solid #007bff" : "",
                    }}
                    onClick={() => setCurrentImage(image.url)}
                  />
                ))}
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
                    if (!brands || !Array.isArray(brands)) return "Đang tải..."; // Kiểm tra nếu brands chưa sẵn sàng
                    const brand = brands.find((b) => b.id === product.brand_id); // Tìm thương hiệu theo id từ product.brand_id
                    return brand ? brand.name : "Không xác định"; // Hiển thị tên thương hiệu hoặc fallback
                  })()}
                  </td>
                </tr>
                <tr>
                  <th>Danh mục sản phẩm:</th>
                  <td>
                    {(product.category && product.category.name) ||
                      "Không có danh mục"}
                  </td>
                </tr>
                <tr>
                  <th>Lượt xem:</th>
                  <td>{product.views || 0} Views</td>
                </tr>
                <tr>
                  <th>Giá nhập:</th>
                  <td>{product.price || 0} VNĐ</td>
                </tr>
                <tr>
                  <th>Giá bán:</th>
                  <td>{formatPrice(product.sell_price || 0)} VNĐ</td>
                </tr>
                <tr>
                  <th>Giá bán khuyến mãi:</th>
                  <td>{product.sale_price || 0} VNĐ</td>
                </tr>
                <tr>
                  <th>Thời gian bắt đầu sale:</th>
                  <td>
                    {moment(product.sale_price_start_at).format(
                      "DD/MM/YYYY HH:mm:ss"
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Thời gian kết thúc sale:</th>
                  <td>
                    {moment(product.sale_price_end_at).format(
                      "DD/MM/YYYY HH:mm:ss"
                    )}
                  </td>
                </tr>

                <tr>
                  <th>Đường dẫn sản phẩm:</th>
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
                <tr>
                  <th>Mô tả:</th>
                  <td>{product.content || "Không có mô tả"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bảng biến thể sản phẩm */}
        <h2 className="mt-4">Bảng biến thể sản phẩm</h2>
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Size</th>
              <th>Màu</th>
              <th>Số lượng</th>
            </tr>
          </thead>
          <tbody>
            {product.variants && product.variants.length > 0 ? (
              product.variants.map((variant, index) => (
                <tr key={index}>
                  <td>{variant.size || "Không có"}</td>
                  <td>{variant.color || "Không có"}</td>
                  <td>{variant.quantity || 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  Không có biến thể
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Các nút hành động */}
        <div className="btn mt-3 d-flex justify-content-end gap-2 flex-wrap">
          <button className="btn btn-success">Cập nhật</button>
          <button className="btn btn-warning">Ngừng kinh doanh</button>
          <button className="btn btn-danger">Xóa</button>
        </div>
      </div>
    )
  );
};

export default ProductDetail;