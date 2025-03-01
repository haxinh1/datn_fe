import React, { useEffect, useState } from 'react'
import Product from './Product'
import { productsServices } from '../../../services/product'




const ProductList = () => {
    const [products, setProducts] = useState([])

    const fetchProducts = async () => {

        const fetchProductResponse = await productsServices.fetchProducts();
        if (!fetchProductResponse.success) {
            return;
        }
        setProducts(fetchProductResponse.data);
    }

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


                    {/* <div className="col-6 col-md-4 col-lg-3">
                        <div className="product product-2 text-center">
                            <figure className="product-media">
                                <a href="product.html">
                                    <img src={product61} alt="Product image" className="product-image" />
                                    <img src={product62} alt="Product image" className="product-image-hover" />
                                </a>

                                <div className="product-action-vertical">
                                    <a href="#" className="btn-product-icon btn-wishlist btn-expandable"><span>add to wishlist</span></a>
                                </div>

                                <div className="product-action">
                                    <a href="#" className="btn-product btn-cart"><span>add to cart</span></a>
                                </div>
                            </figure>

                            <div className="product-body">
                                <div className="product-cat">
                                    <a href="#">Shoes</a>
                                </div>
                                <h3 className="product-title"><a href="product.html">Sandals</a></h3>
                                <div className="product-price">
                                    $12.99
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-md-4 col-lg-3">
                        <div className="product product-2 text-center">
                            <figure className="product-media">
                                <a href="product.html">
                                    <img src={product71} alt="Product image" className="product-image" />
                                    <img src={product72} alt="Product image" className="product-image-hover" />
                                </a>

                                <div className="product-action-vertical">
                                    <a href="#" className="btn-product-icon btn-wishlist btn-expandable"><span>add to wishlist</span></a>
                                </div>

                                <div className="product-action">
                                    <a href="#" className="btn-product btn-cart"><span>add to cart</span></a>
                                </div>
                            </figure>

                            <div className="product-body">
                                <div className="product-cat">
                                    <a href="#">Bags</a>
                                </div>
                                <h3 className="product-title"><a href="product.html">Small bucket bag</a></h3>
                                <div className="product-price">
                                    $14.99
                                </div>

                                <div className="product-nav product-nav-thumbs">
                                    <a href="#" className="active">
                                        <img src={productThumb7} alt="product desc" />
                                    </a>
                                    <a href="#">
                                        <img src={productThumb72} alt="product desc" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-md-4 col-lg-3">
                        <div className="product product-2 text-center">
                            <figure className="product-media">
                                <a href="product.html">
                                    <img src={product81} alt="Product image" className="product-image" />
                                    <img src={product82} alt="Product image" className="product-image-hover" />
                                </a>

                                <div className="product-action-vertical">
                                    <a href="#" className="btn-product-icon btn-wishlist btn-expandable"><span>add to wishlist</span></a>
                                </div>

                                <div className="product-action">
                                    <a href="#" className="btn-product btn-cart"><span>add to cart</span></a>
                                </div>
                            </figure>

                            <div className="product-body">
                                <div className="product-cat">
                                    <a href="#">Clothing</a>
                                </div>
                                <h3 className="product-title"><a href="product.html">Denim jacket</a></h3>
                                <div className="product-price">
                                    $34.99
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-md-4 col-lg-3">
                        <div className="product product-2 text-center">
                            <figure className="product-media">
                                <a href="product.html">
                                    <img src={product91} alt="Product image" className="product-image" />
                                    <img src={product92} alt="Product image" className="product-image-hover" />
                                </a>

                                <div className="product-action-vertical">
                                    <a href="#" className="btn-product-icon btn-wishlist btn-expandable"><span>add to wishlist</span></a>
                                </div>

                                <div className="product-action">
                                    <a href="#" className="btn-product btn-cart"><span>add to cart</span></a>
                                </div>
                            </figure>

                            <div className="product-body">
                                <div className="product-cat">
                                    <a href="#">Clothing</a>
                                </div>
                                <h3 className="product-title"><a href="product.html">BShort wrap dress</a></h3>
                                <div className="product-price">
                                    $17.99
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-md-4 col-lg-3">
                        <div className="product product-2 text-center">
                            <figure className="product-media">
                                <a href="product.html">
                                    <img src={product101} alt="Product image" className="product-image" />
                                    <img src={product102} alt="Product image" className="product-image-hover" />
                                </a>

                                <div className="product-action-vertical">
                                    <a href="#" className="btn-product-icon btn-wishlist btn-expandable"><span>add to wishlist</span></a>
                                </div>

                                <div className="product-action">
                                    <a href="#" className="btn-product btn-cart"><span>add to cart</span></a>
                                </div>
                            </figure>

                            <div className="product-body">
                                <div className="product-cat">
                                    <a href="#">Clothing</a>
                                </div>
                                <h3 className="product-title"><a href="product.html">Biker jacket</a></h3>
                                <div className="product-price">
                                    $34.99
                                </div>

                                <div className="product-nav product-nav-thumbs">
                                    <a href="#" className="active">
                                        <img src={productThumb10} alt="product desc" />
                                    </a>
                                    <a href="#">
                                        <img src={product102} alt="product desc" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-md-4 col-lg-3">
                        <div className="product product-2 text-center">
                            <figure className="product-media">
                                <a href="product.html">
                                    <img src={product111} alt="Product image" className="product-image" />
                                    <img src={product112} alt="Product image" className="product-image-hover" />
                                </a>

                                <div className="product-action-vertical">
                                    <a href="#" className="btn-product-icon btn-wishlist btn-expandable"><span>add to wishlist</span></a>
                                </div>

                                <div className="product-action">
                                    <a href="#" className="btn-product btn-cart"><span>add to cart</span></a>
                                </div>
                            </figure>

                            <div className="product-body">
                                <div className="product-cat">
                                    <a href="#">Shoes</a>
                                </div>
                                <h3 className="product-title"><a href="product.html">Loafers</a></h3>
                                <div className="product-price">
                                    $9.99
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-md-4 col-lg-3">
                        <div className="product product-2 text-center">
                            <figure className="product-media">
                                <span className="product-label label-sale">sale</span>
                                <a href="product.html">
                                    <img src={product121} alt="Product image" className="product-image" />
                                    <img src={product122} alt="Product image" className="product-image-hover" />
                                </a>

                                <div className="product-action-vertical">
                                    <a href="#" className="btn-product-icon btn-wishlist btn-expandable"><span>add to wishlist</span></a>
                                </div>

                                <div className="product-action">
                                    <a href="#" className="btn-product btn-cart"><span>add to cart</span></a>
                                </div>
                            </figure>

                            <div className="product-body">
                                <div className="product-cat">
                                    <a href="#">Clothing</a>
                                </div>
                                <h3 className="product-title"><a href="product.html">Super Skinny High Jeggings</a></h3>
                                <div className="product-price">
                                    <span className="new-price">Now $12.99</span>
                                    <span className="old-price">Was $17.99</span>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>

        </div>
    )
}

export default ProductList
