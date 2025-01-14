import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./detailAd.css";

const ProductDetail = () => {
  const [currentImage, setCurrentImage] = useState(
    "https://i.pinimg.com/736x/18/2d/88/182d8850ca2f6b1822ae82dd00ae08cd.jpg" // Ảnh sản phẩm mặc định
  );

  const images = [
    "https://i.pinimg.com/736x/18/2d/88/182d8850ca2f6b1822ae82dd00ae08cd.jpg",
    "https://i.pinimg.com/736x/87/8a/86/878a86c075f68a8c32286d6733a45a35.jpg",
    "https://i.pinimg.com/736x/11/02/61/110261491fca31809ae379c5e92ec8a9.jpg", // Ảnh chính
  ];

  return (
    <div className="container mt-5">
      <h2 style={{ margin: "20px" }}>Thông tin chi tiết sản phẩm</h2>
      <div className="row">
        {/* Cột hình ảnh */}
        <div className="col-md-4">
          <div className="text-center">
            <img
              src={currentImage}
              alt="Product"
              className="img-fluid mb-2"
              style={{ border: "1px solid #ddd", borderRadius: "5px" }}
            />
            <div className="d-flex justify-content-start mt-2">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="img-thumbnail me-2"
                  style={{
                    width: "70px",
                    height: "70px",
                    cursor: "pointer",
                    border: currentImage === image ? "2px solid #007bff" : "",
                  }}
                  onClick={() => setCurrentImage(image)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Cột thông tin sản phẩm */}
        <div className="col-md-8">
          <table className="table table-striped" style={{ textAlign: "left" }}>
            <tbody>
              <tr className="tr">
                <th>Mã sản phẩm:</th>
                <td>HA01</td>
                {/* <th>Mã hàng:</th>
                <td>NU011</td> */}
              </tr>

              <tr>
                <th>Tên sản phẩm:</th>
                <td>Áo phông nam</td>
              </tr>
              <tr>
                <th>Danh mục sản phẩm:</th>
                <td>Áo</td>
              </tr>
              <tr>
                <th>Lượt xem:</th>
                <td>350000 {"Views"}</td>
              </tr>
              <tr>
                <th>Giá nhập</th>
                <td>200000 {"VNĐ"}</td>
              </tr>
              <tr>
                <th>Giá bán</th>
                <td>250000 {"VNĐ"}</td>
              </tr>
              <tr>
                <th>Giá bán khuyến mãi</th>
                <td> {"VNĐ"}</td>
              </tr>
              <tr>
                <th>Link sản phẩm</th>
                <td></td>
              </tr>
              <tr>
                <th>Đường dẫn</th>
                <td></td>
              </tr>
              <tr>
                <th>Mô tả</th>
                <td>
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                  Magni, doloremque eum perferendis deleniti hic veritatis
                  mollitia neque repudiandae dolore explicabo?
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <br />
      <h2>Bảng biến thể sản phẩm</h2>
      <br />
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Size</th>
            <th>Màu</th>
            <th>Số lượng</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>S</td>
            <td>Đỏ</td>
            <td>10</td>
          </tr>
        </tbody>
      </table>
      <div className="btn mt-3 d-flex justify-content-end gap-2 flex-wrap">
        <button className="btn btn-success">Cập nhật</button>
        <button className="btn btn-warning">Ngừng kinh doanh</button>
        <button className="btn btn-danger">Xóa</button>
      </div>
    </div>
  );
};

export default ProductDetail;
