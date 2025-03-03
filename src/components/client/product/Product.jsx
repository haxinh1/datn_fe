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
        </figure>

        <div className="product-body">
          <div className="product-cat">
            <a href="#">{product.categories.name}</a>
          </div>
          <h3 className="product-title">
            <a href="product.html">{product.name}</a>
          </h3>
          <div className="product-price">
            <span className="new-price">
              Now{" "}
              {product.sale_price
                ? formatVND(product.sale_price)
                : product.variants.length > 0
                ? formatVND(product.variants[0].sale_price)
                : ""}{" "}
              VND
            </span>

            <div className="product-nav product-nav-thumbs">
              {product.variants?.map((variant) => (
                <span key={variant.id}>
                  <img
                    alt={`Biến thể của ${product.name}`}
                    src={variant.thumbnail}
                    onClick={() => handleThumbnailClick(product.id, variant)}
                  />
                </span>
              ))}
            </div>
          </div>

          {product.variants.length > 0 && (
            <div className="product-nav product-nav-thumbs">
              {product.variants.length < 4 &&
                product.variants.map((variant, index) => (
                  <a
                    href="#"
                    key={variant.id}
                    className={
                      variant.id === product.variants[0].id ? "active" : ""
                    }
                  >
                    <img src={variant.thumbnail} alt={`Variant ${index + 1}`} />
                  </a>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Product;
