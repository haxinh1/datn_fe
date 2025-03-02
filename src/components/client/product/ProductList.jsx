import React, { useEffect, useState } from "react";
import Product from "./Product";
import { productsServices } from "../../../services/product";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const fetchProductResponse = await productsServices.fetchProducts();
    if (!fetchProductResponse.success) {
      return;
    }
    setProducts(fetchProductResponse.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  return (
    <div>
      <div className="products">
        <div className="row justify-content-center">
          {products.map((product) => (
            <div key={product.id} className="col-6 col-md-4 col-lg-3">
              <Product status="sale" product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
