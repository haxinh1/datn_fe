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
  Table,
  Tag,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import "./add.css";

const Add = () => {
  const [attributes, setAttributes] = useState([]);
  const [forms, setForms] = useState([
    { id: Date.now(), name: "", values: [], inputValue: "" },
  ]);
  const [variants, setVariants] = useState([]);

  // Thêm giá trị thuộc tính
  const handleAddValue = (formId) => {
    const updatedForms = forms.map((form) => {
      if (
        form.id === formId &&
        form.inputValue &&
        !form.values.includes(form.inputValue)
      ) {
        return {
          ...form,
          values: [...form.values, form.inputValue],
          inputValue: "",
        };
      }
      return form;
    });
    setForms(updatedForms);
  };

  // Hàm xoá giá trị thuộc tính
  const handleRemoveValue = (formId, value) => {
    const updatedForms = forms.map((form) => {
      if (form.id === formId) {
        const updatedValues = form.values.filter((v) => v !== value);

        if (updatedValues.length === 0) {
          const updatedAttributes = attributes.filter(
            (attr) => attr.name !== form.name
          );
          setAttributes(updatedAttributes);
          generateVariants(updatedAttributes);
        }

        return { ...form, values: updatedValues };
      }
      return form;
    });

    setForms(updatedForms);

    const updatedVariants = variants.filter((variant) => {
      return !Object.values(variant).includes(value);
    });

    setVariants(updatedVariants);
  };

  // Hàm thêm thuộc tính
  const handleAddAttribute = (formId) => {
    const form = forms.find((f) => f.id === formId);
    if (form.name && form.values.length > 0) {
      const updatedAttributes = [
        ...attributes,
        { name: form.name, values: form.values },
      ];
      setAttributes(updatedAttributes);
      generateVariants(updatedAttributes);
      setForms([
        ...forms,
        { id: Date.now(), name: "", values: [], inputValue: "" },
      ]);
    }
  };

  // Hàm tạo biến thể
  const generateVariants = (attrs) => {
    const combinations = attrs.reduce(
      (acc, attr) => {
        const temp = [];
        acc.forEach((comb) => {
          attr.values.forEach((value) => {
            temp.push({ ...comb, [attr.name]: value });
          });
        });
        return temp;
      },
      [{}]
    );

    // Chỉ giữ lại trường "quantity"
    setVariants(
      combinations.map((item, index) => ({
        key: index,
        ...item,
        quantity: 0, // Chỉ thêm trường "quantity"
      }))
    );
  };

  // Hàm xóa biến thể
  const handleRemoveVariant = (variantKey) => {
    const updatedVariants = variants.filter(
      (variant) => variant.key !== variantKey
    );
    setVariants(updatedVariants);
  };

  const columns = [
    ...attributes.map((attr) => ({
      title: attr.name,
      dataIndex: attr.name,
      key: attr.name,
      align: "center",
    })),
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (_, record) => <InputNumber min={0} />,
      align: "center",
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveVariant(record.key)} // Gọi hàm xóa khi nhấn
        />
      ),
    },
  ];

  return (
    <div className="container">
      <h1 className="mb-5">Thêm sản phẩm mới</h1>

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

      <h2>Thuộc tính</h2>
      {forms.map((form) => (
        <div key={form.id} className="attribute">
          <div className="fill">
            <Input
              className="input-item"
              placeholder="Tên thuộc tính"
              value={form.name}
              onChange={(e) => {
                const updatedForms = forms.map((f) =>
                  f.id === form.id ? { ...f, name: e.target.value } : f
                );
                setForms(updatedForms);
              }}
            />
            <Input
              placeholder="Nhập giá trị"
              className="input-item"
              value={form.inputValue}
              onChange={(e) => {
                const updatedForms = forms.map((f) =>
                  f.id === form.id ? { ...f, inputValue: e.target.value } : f
                );
                setForms(updatedForms);
              }}
              onPressEnter={() => handleAddValue(form.id)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleAddValue(form.id)}
            >
              Thêm giá trị
            </Button>
          </div>
          <div className="tag-list">
            {form.values.map((value) => (
              <Tag
                key={value}
                closable
                onClose={() => handleRemoveValue(form.id, value)}
              >
                {value}
              </Tag>
            ))}
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAddAttribute(form.id)}
            className="btn-item"
          >
            Thêm thuộc tính
          </Button>
        </div>
      ))}

      <hr />

      <h2>Danh sách hàng hóa cùng loại</h2>
      <Table dataSource={variants} columns={columns} pagination={false} />

      <div className="add">
        <Button
          type="primary"
          size="large"
          htmlType="submit"
          className="btn-item"
        >
          Thêm sản phẩm
        </Button>
      </div>
    </div>
  );
};

export default Add;
