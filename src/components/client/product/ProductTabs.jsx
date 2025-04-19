import React, { useState, useEffect } from 'react';
import { Tabs, Rate, Avatar, Divider, Image, Spin, Form, Button, Input } from 'antd';
import { CommentServices } from '../../../services/comment';
import { CommentOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { TextArea } = Input;

const ProductTabs = ({ productId, product }) => {
  const [form] = Form.useForm();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false); // Add replyLoading state
  const [user, setUser] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await CommentServices.fetchCommentByProductId(productId);
      // Initialize showReplyForm for each review
      setReviews(data.map((review) => ({ ...review, showReplyForm: false })));
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

  const handleReplySubmit = async (values, parentId, resetForm) => {

    setReplyLoading(true);
    try {
      const payload = {
        comments: values.comment,
        products_id: productId,
        parent_id: parentId,
        status: 1,
      };
      await CommentServices.createComment(payload);
      fetchReviews();
      resetForm();
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setReplyLoading(false);
    }
  };

  if (!product) {
    return <h1>Loading...</h1>;
  }

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user')));
  }, []);

  return (
    <div className="product-tabs">
      <Tabs centered defaultActiveKey="1" onChange={handleTabChange}>
        <TabPane tab="Mô tả" key="1">
          <div className="tab-content">
            <div
              className="tab-pane fade show active"
              id="product-desc-tab"
              role="tabpanel"
              aria-labelledby="product-desc-link"
            >
              <div className="product-desc-content">
                <div style={{ width: '100%', height: 'auto' }}>
                  <div className="container">
                    <div className="">
                      <div className="col-sm-6 col-lg-4">
                        <h1 className="mb-5" style={{ color: "#eea287" }}>
                          <InfoCircleOutlined style={{ marginRight: "8px" }} />
                          Thông tin sản phẩm
                        </h1>

                        <div
                          dangerouslySetInnerHTML={{
                            __html: product.content || "Không có mô tả",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPane>

        <TabPane tab="Đánh giá" key="4">
          <div className="container">
            <h1 className="mb-5" style={{ color: "#eea287" }}>
              <CommentOutlined style={{ marginRight: "8px" }} />
              Đánh giá sản phẩm
            </h1>

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
                        <div className='group1'>
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
                    <span style={{ margin: '10px 0', fontSize: '16px' }}>{review.comments}</span>
                    {review.images && review.images.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <Image.PreviewGroup>
                          {review.images.map((image, index) => (
                            <Image
                              key={index}
                              src={image.image}
                              alt={`Review image ${index + 1}`}
                              width={100}
                              height={100}
                              style={{ marginRight: '10px', objectFit: 'cover' }}
                            />
                          ))}
                        </Image.PreviewGroup>
                      </div>
                    )}

                    {user?.role === 'admin' && (
                      <div style={{ marginTop: '10px', paddingLeft: '20px' }}>
                        {review.showReplyForm ? (
                          <Form
                            form={form}
                            onFinish={(values) =>
                              handleReplySubmit(values, review.id, () => form.resetFields())
                            }
                          >
                            <Form.Item
                              name="comment"
                              rules={[{ required: true, message: 'Vui lòng nhập nội dung trả lời!' }]}
                            >
                              <TextArea rows={3} placeholder="Nhập nội dung trả lời..." />
                            </Form.Item>
                            <Form.Item>
                              <Button type="primary" htmlType="submit" loading={replyLoading}>
                                Gửi trả lời
                              </Button>
                              <Button
                                style={{ marginLeft: '10px' }}
                                onClick={() =>
                                  setReviews(
                                    reviews.map((r) =>
                                      r.id === review.id ? { ...r, showReplyForm: false } : r
                                    )
                                  )
                                }
                              >
                                Hủy
                              </Button>
                            </Form.Item>
                          </Form>
                        ) : (
                          <Button
                            type="primary" htmlType="submit"
                            onClick={(event) => {
                              event.preventDefault();
                              setReviews(
                                reviews.map((r) =>
                                  r.id === review.id ? { ...r, showReplyForm: true } : r
                                )
                              )
                            }
                            }
                          >
                            Phản Hồi
                          </Button>
                        )}
                      </div>
                    )}
                    {review.replies && review.replies.length > 0 && (
                      <div style={{ marginTop: '15px', paddingLeft: '20px', borderLeft: '2px solid #f0f0f0' }}>
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
                                <div className='group1'>
                                  <span style={{ fontWeight: 'bold' }}>
                                    {reply.user?.fullname || 'Anonymous'}
                                  </span>
                                  <span style={{ color: '#888' }}>
                                    {new Date(reply.comment_date).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span style={{ margin: '10px 0', fontSize: '16px' }}>{reply.comments}</span>
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
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProductTabs;