import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useParams } from "react-router-dom";
import { productsServices } from "../../services/product";
import moment from "moment";
import "./detailad.css";
import { BrandsServices } from "../../services/brands";
import { useQuery } from "@tanstack/react-query";
import { Button, Modal, Table, DatePicker, ConfigProvider, Form } from "antd";
import { categoryServices } from "../../services/categories";
import { EyeOutlined } from "@ant-design/icons";
import viVN from "antd/lib/locale/vi_VN"; // Import locale tiếng Việt
import "moment/locale/vi"; // Chuyển moment sang tiếng Việt

const ProductDetail = () => {
  const { id } = useParams(); // Lấy ID sản phẩm từ URL
  const [product, setProduct] = useState(null); // Dữ liệu chi tiết sản phẩm
  const [images, setImages] = useState([]); // Mảng ảnh sản phẩm
  const [currentImage, setCurrentImage] = useState(""); // Ảnh hiện tại
  const [loading, setLoading] = useState(true); // Trạng thái tải
  const [error, setError] = useState(null); // Trạng thái lỗi
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stocks, setStocks] = useState([]); // Lưu stocks riêng biệt
  const [filterDates, setFilterDates] = useState([null, null]); // State lưu khoảng ngày bắt đầu và kết thúc

  const { RangePicker } = DatePicker; // Sử dụng RangePicker để chọn khoảng ngày

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await productsServices.fetchProductById(id);
        console.log("Dữ liệu sản phẩm API trả về:", response);

        if (response?.data) {
          setProduct(response.data);
        }

        if (response?.stocks) {
          setStocks(response.stocks); // Lưu stocks riêng
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

  // Lấy dữ liệu từ `stocks` để hiển thị trong modal
  const getStockData = () => {
    if (!stocks || !Array.isArray(stocks) || !product?.variants) return [];

    console.log("Dữ liệu stocks trước khi lọc:", stocks);

    return stocks
      .filter((stock) => {
        if (!filterDates[0] || !filterDates[1]) return true; // Nếu chưa chọn khoảng ngày, hiển thị tất cả
        const stockDate = moment(stock.created_at).format("YYYY-MM-DD");
        return stockDate >= filterDates[0] && stockDate <= filterDates[1];
      })
      .map((stock, index) => {
        // Tìm biến thể tương ứng với product_variant_id
        const variant = product.variants.find(
          (variant) => variant.id === stock.product_variant_id
        );

        // Tạo tên biến thể từ thuộc tính
        const variantName = variant
          ? `${product.name} - ${variant.attribute_value_product_variants
              .map((attr) => attr.attribute_value.value)
              .join(" - ")}`
          : product.name;

        return {
          key: stock.id,
          stt: index + 1,
          variant_name: variantName,
          quantity: stock.quantity,
          price: parseFloat(stock.price),
          created_at: stock.created_at
            ? moment(stock.created_at).add(7, "hour").format("DD/MM/YYYY")
            : "N/A",
          total: parseFloat(stock.price) * stock.quantity, // Tính tổng tiền nhập
        };
      });
  };

  if (loading) return <p>Đang tải thông tin sản phẩm...</p>;
  if (error) return <p>{error}</p>;

  // Cấu hình cột cho bảng trong modal
  const stockColumns = [
    {
      title: "STT",
      dataIndex: "stt",
      align: "center",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "variant_name",
      align: "center",
    },
    {
      title: "Ngày nhập hàng",
      dataIndex: "created_at",
      align: "center",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      align: "center",
    },
    {
      title: "Giá nhập (VNĐ)",
      dataIndex: "price",
      align: "center",
      render: (price) => formatPrice(price),
    },
    {
      title: "Tổng tiền (VNĐ)",
      dataIndex: "total",
      align: "center",
      render: (total) => formatPrice(total),
    },
  ];
  return (
    product && (
      <div className="container mt-5">
        <h1 className="mb-5">
          <EyeOutlined style={{ marginRight: "8px" }} />
          Chi tiết sản phẩm
        </h1>

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
                    width: "400px", // Đặt chiều rộng cố định
                    height: "400px", // Đặt chiều cao cố định
                    objectFit: "cover", // Ảnh sẽ luôn lấp đầy khung mà không bị méo
                  }}
                />
              ) : (
                <p>Không có ảnh sản phẩm</p>
              )}

              {/* Danh sách ảnh nhỏ (galleries) */}
              <div
                className="d-flex overflow-auto"
                style={{
                  whiteSpace: "nowrap",
                  paddingBottom: "10px",

                  msOverflowStyle: "none", // Ẩn thanh cuộn trên IE/Edge
                }}
              >
                <style>
                  {`.d-flex.overflow-auto::-webkit-scrollbar {display: none; /* Ẩn thanh cuộn trên Chrome, Safari */}`}
                </style>
                {images.length > 0 ? (
                  images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="img-thumbnail me-2"
                      style={{
                        maxWidth: "80px",
                        maxHeight: "80px",
                        borderRadius: "10px",
                        border: currentImage === img ? "2px solid #007bff" : "",
                      }}
                      onClick={() => setCurrentImage(img)}
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
                  <td>{product.sku || "Không có mã"}</td>
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
                  <td>{product.views || 0}</td>
                </tr>
                <tr>
                  <th>Giá bán (VNĐ):</th>
                  <td>
                    {product.sell_price > 0 && formatPrice(product.sell_price)}
                  </td>
                </tr>
                <tr>
                  <th>Giá khuyến mại (VNĐ):</th>
                  <td>{formatPrice(product.sale_price)} </td>
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
              <div
                dangerouslySetInnerHTML={{
                  __html: product.content || "Không có mô tả",
                }}
              />
            </div>
          </div>
        </div>

        {/* Các nút hành động */}
        <div className="mt-2 d-flex justify-content-end flex-wrap gap-2">
          <Link to={`/admin/edit-pr/${id}`}>
            <button className="btn btn-success same-size-btn">Cập nhật</button>
          </Link>
          <Button
            className="btn btn-success same-size-btn"
            onClick={() => setIsModalOpen(true)}
          >
            Lịch sử nhập hàng
          </Button>
        </div>

        {/* Modal hiển thị lịch sử nhập hàng */}
        <Modal
          title="Lịch sử nhập hàng"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={800}
        >
          <Form.Item label="Ngày nhập hàng">
            <ConfigProvider locale={viVN}>
              <RangePicker
                format="DD/MM/YYYY"
                onChange={(dates, dateStrings) => {
                  if (dates) {
                    setFilterDates([
                      moment(dateStrings[0], "DD/MM/YYYY").format("YYYY-MM-DD"),
                      moment(dateStrings[1], "DD/MM/YYYY").format("YYYY-MM-DD"),
                    ]);
                  } else {
                    setFilterDates([null, null]); // Nếu người dùng xóa bộ lọc, hiển thị toàn bộ dữ liệu
                  }
                }}
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </ConfigProvider>
          </Form.Item>

          <Table
            columns={stockColumns}
            dataSource={getStockData()}
            pagination={{ pageSize: 8 }}
            bordered
            summary={(pageData) => {
              const totalAmount = pageData.reduce(
                (sum, item) => sum + item.total,
                0
              );
              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={5} align="right">
                    <strong>Tổng giá trị (VNĐ):</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="center">
                    <strong>{formatPrice(totalAmount)}</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
        </Modal>
      </div>
    )
  );
};

export default ProductDetail;
