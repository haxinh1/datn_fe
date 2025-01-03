import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Row,
  Col,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { PlusOutlined } from "@ant-design/icons";
import "./add.css";

const Edit = () => {
  const [variants, setVariants] = useState([{ id: 1 }]);
  const addVariant = () => {
    setVariants([...variants, { id: variants.length + 1 }]);
  };

  return (
    <div className="container">
      <h1 className="mb-5">Cập nhật sản phẩm</h1>

      <Form
        name="basic"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        labelAlign="top"
      >
        <Row gutter={24}>
          <Col span={8} className="col-item">
            <Form.Item
              label="Tên sản phẩm"
              rules={[
                { required: true, message: "Vui lòng nhập tên sản phẩm" },
              ]}
            >
              <Input className="input-item" />
            </Form.Item>

            <Form.Item
              label="Giá nhập"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập giá nhập của sản phẩm",
                },
                { type: "number", min: 0, message: "Không được để số âm" },
              ]}
            >
              <InputNumber className="input-item" />
            </Form.Item>

            <Form.Item
              label="Giá bán"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập giá bán của sản phẩm",
                },
                { type: "number", min: 0, message: "Không được để số âm" },
              ]}
            >
              <InputNumber className="input-item" />
            </Form.Item>

            <Form.Item label="Danh mục" name="category">
              <Select className="input-item">
                <Select.Option>Điện thoại</Select.Option>
                <Select.Option>Máy tính</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={16} className="col-item">
            <Form.Item
              label="Ảnh sản phẩm"
              valuePropName="fileList"
              rules={[
                {
                  required: true,
                  message: "Vui lòng tải lên ít nhất một ảnh sản phẩm",
                },
              ]}
            >
              <Upload listType="picture-card" multiple>
                <button className="upload-button" type="button">
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                </button>
              </Upload>
            </Form.Item>

            <Form.Item label="Mô tả sản phẩm" name="description">
              <TextArea rows={8} className="input-item" />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <hr />

      <h2>Các biến thể</h2>
      {variants.map((variant, index) => (
        <Form
          key={variant.id} // Mỗi biến thể có key duy nhất
          name={`variant_${variant.id}`}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          labelAlign="top"
        >
          <Row gutter={24} align="middle">
            <Col span={6} className="col-item">
              <Form.Item label="Size" name={`size_${variant.id}`}>
                <Select className="input-item">
                  <Select.Option>XS</Select.Option>
                  <Select.Option>S</Select.Option>
                  <Select.Option>M</Select.Option>
                  <Select.Option>L</Select.Option>
                  <Select.Option>XL</Select.Option>
                  <Select.Option>XXL</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={6} className="col-item">
              <Form.Item
                label="Màu"
                rules={[{ required: true, message: "Vui lòng nhập màu sắc" }]}
              >
                <Input className="input-item" />
              </Form.Item>
            </Col>

            <Col span={6} className="col-item">
              <Form.Item
                label="Số lượng"
                rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
              >
                <InputNumber className="input-item" min={1} />
              </Form.Item>
            </Col>

            {index === variants.length - 1 && (
              <Col span={6} className="col-item">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={addVariant}
                  className="btn-item"
                >
                  Thêm biến thể
                </Button>
              </Col>
            )}
          </Row>
        </Form>
      ))}

      <div className="add">
        <Button
          type="primary"
          size="large"
          htmlType="submit"
          className="btn-item"
        >
          Cập nhật
        </Button>
      </div>
    </div>
  );
};

export default Edit;
