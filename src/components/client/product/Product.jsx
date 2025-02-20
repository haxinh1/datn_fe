import React from 'react'
import formatVND from '../../../utils/formatPrice';

const Product = (props) => {
    const { product } = props
    console.log(product.variants);

    return (
        <>
            <div className="product product-2 text-center">
                <figure className="product-media">
                    <span className="product-label label-sale">Sale</span>
                    <a href="product.html">
                        <img src={product.thumbnail} alt="Product image" className="product-image" />
                        {product.variants.length > 0 && <img src={product.variants[0].thumbnail} alt="Product image" className="product-image-hover" />}
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
                        <a href="#">{product.categories.name}</a>
                    </div>
                    <h3 className="product-title"><a href="product.html">{product.name}</a></h3>
                    <div className="product-price">


                        <span className="new-price">Now {product.sale_price ? formatVND(product.sale_price) : (product.variants.length > 0 ? formatVND(product.variants[0].sale_price) : "")} VND</span>
                        
                        <span className="old-price">Was {product.sell_price ? formatVND(product.sell_price) : (product.variants.length > 0 ? formatVND(product.variants[0].sell_price) : "")} VND</span>
                    </div>
                    
                    {product.variants.length > 0 && (
                        <div className="product-nav product-nav-thumbs">
                            { product.variants.length < 4 && product.variants.map((variant, index) => (
                                <a
                                    href="#"
                                    key={variant.id}
                                    className={variant.id === product.variants[0].id ? "active" : ""}
                                >
                                    <img src={variant.thumbnail} alt={`Variant ${index + 1}`} />
                                </a>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </>
    )
}

export default Product