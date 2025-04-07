import React, { useEffect, useState } from "react";
import formatVND from "../../../utils/formatPrice";
import { Link } from "react-router-dom";

const Product = (props) => {
  const [products, setProducts] = useState([]);
  const [currentImages, setCurrentImages] = useState({});
  const [selectedVariantData, setSelectedVariantData] = useState({});
  const { product } = props;

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

  // Tách số thành định dạng tiền tệ
  const formatPrice = (price) => {
    const formatter = new Intl.NumberFormat("de-DE", {
      style: "decimal",
      maximumFractionDigits: 0,
    });
    return formatter.format(price);
  };

  return (
    <>
      <div className="product product-2 text-center">
        <figure className="product-media">
          <span className="product-label label-sale">Sale</span>
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
            <span className="new-price">
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
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Product;
