import React, { useState, useEffect } from 'react';
import { Tabs, Rate, Avatar, Divider, Image, Spin } from 'antd';
import axios from 'axios';
import { CommentServices } from '../../../services/comment';

const { TabPane } = Tabs;

const ProductTabs = ({ productId, product }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await CommentServices.fetchCommentByProductId(productId);
      setReviews(data);

    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key) => {
    if (key === '4') { 
      fetchReviews();
    }
  };
  if (!product) {
    return (
      <h1> Loading...</h1>
    )
  }
  return (
    <div className="product-tabs">
      <Tabs centered defaultActiveKey="1" onChange={handleTabChange}>
        <TabPane tab="Description" key="1">
          <div className="tab-content">
            <div
              className="tab-pane fade show active"
              id="product-desc-tab"
              role="tabpanel"
              aria-labelledby="product-desc-link"
            >
              <div className="product-desc-content">
                <div
                  className="product-desc-row bg-image"
                  style={{ backgroundImage: `url(${product.thumbnail})` }}
                >
                  <div className="container">
                    <div className="row justify-content-end">
                      <div className="col-sm-6 col-lg-4">
                        <h2>Product Information</h2>
                        <ul>
                          <li>Faux suede fabric upper</li>
                          <li>Tie strap buckle detail</li>
                          <li>Block heel</li>
                          <li>Open toe</li>
                          <li>Heel Height: 7cm / 2.5 inches</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPane>
        <TabPane tab="Additional Information" key="2">
          <h2>Additional Information</h2>
          <p>Additional information goes here...</p>
        </TabPane>
        <TabPane tab="Shipping & Returns" key="3">
          <h2>Shipping & Returns</h2>
          <p>Shipping and returns information goes here...</p>
        </TabPane>
        <TabPane tab={`Reviews (${reviews.length})`} key="4">
          <h2>Reviews</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin tip="Loading reviews..." />
            </div>
          ) : reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <Avatar
                      style={{ backgroundColor: '#f56a00', marginRight: '10px' }}
                      size="large"
                      src={review.user?.avatar || undefined}
                    >
                      {!review.user?.avatar && (review.user?.fullname?.charAt(0) || 'A')}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold' }}>
                          {review.user?.fullname || 'Anonymous'}
                        </span>
                        <span style={{ color: '#888' }}>
                          {new Date(review.comment_date).toLocaleDateString()}
                        </span>
                      </div>
                      <Rate disabled value={review.rating} style={{ fontSize: '16px' }} />
                    </div>
                  </div>
                  <p style={{ margin: '10px 0' }}>{review.comments}</p>

                  {review.replies && review.replies.length > 0 && (
                    <div style={{ marginTop: '15px', paddingLeft: '20px', borderLeft: '2px solid #f0f0f0' }}>
                      <h4>Replies:</h4>
                      {review.replies.map((reply) => (
                        <div key={reply.id} style={{ marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                            <Avatar
                              style={{ backgroundColor: '#1890ff', marginRight: '10px' }}
                              size="small"
                              src={reply.user?.avatar || undefined}
                            >
                              {!reply.user?.avatar && (reply.user?.fullname?.charAt(0) || 'A')}
                            </Avatar>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 'bold' }}>
                                  {reply.user?.fullname || 'Anonymous'}
                                </span>
                                <span style={{ color: '#888' }}>
                                  {new Date(reply.comment_date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p>{reply.comments}</p>
                          {reply.images && reply.images.length > 0 && (
                            <div style={{ margin: '10px 0' }}>
                              <Image.PreviewGroup>
                                {reply.images.map((image, index) => (
                                  <Image
                                    key={index}
                                    src={image.image}
                                    alt={`Reply image ${index + 1}`}
                                    width={100}
                                    height={100}
                                    style={{ marginRight: '10px', objectFit: 'cover' }}
                                  />
                                ))}
                              </Image.PreviewGroup>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <Divider />
                </div>
              ))}
            </div>
          ) : (
            <p>No reviews yet.</p>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProductTabs;