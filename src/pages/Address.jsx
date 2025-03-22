import { CheckOutlined, EditOutlined, EnvironmentOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, notification, Radio, Select, Skeleton, Table, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthServices } from "../services/auth";
import { useMutation } from "@tanstack/react-query";

const Address = () => {
  const { id } = useParams();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalUpdate, setIsModalupdate] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await AuthServices.getAddressByIdUser(id);
        setAddresses(data);
      } catch (error) {
        console.error("Lỗi khi lấy địa chỉ:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [id]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then(res => res.json())
      .then(data => {
        setProvinces(data);
        setIsLoading(false);
      });
  }, []);

  const handleProvinceChange = (value) => {
    const province = provinces.find(p => p.code === Number(value));
    setDistricts(province ? province.districts : []);
    setWards([]);
    form.setFieldsValue({ district: null, ward: null });
  };

  const handleDistrictChange = (value) => {
    const district = districts.find(d => d.code === Number(value));
    setWards(district ? district.wards : []);
    form.setFieldsValue({ ward: null });
  };

  // thêm địa chỉ mới
  const { mutate } = useMutation({
    mutationFn: async (userData) => {
      const response = await AuthServices.addAddress(userData)
      return response;
    },
    onSuccess: (_, userData) => {
      notification.success({
        message: "Địa chỉ mới đã được thêm",
      });
      form.setFieldsValue();
      setIsModalVisible(false);
    },
    onError: (error) => {
      notification.error({
        message: "Thêm thất bại",
        description: error.message,
      });
    },
  });    

  const handleAdd = (values) => {    
    const formattedAddress = [
      values.ward ? wards.find(w => w.code === Number(values.ward))?.name : "",
      values.district ? districts.find(d => d.code === Number(values.district))?.name : "",
      values.province ? provinces.find(p => p.code === Number(values.province))?.name : "",
    ].filter(Boolean).join(", ");

    const userData = {
      address: formattedAddress,
      detail_address: values.detail_address,
      id_default: values.id_default,
    };

    console.log("Dữ liệu gửi đi:", userData);
    mutate(userData);
  };  

  const showModalUpdate = () => {
    setIsModalupdate(true);
  };

  const handleCancelUpdate = () => {
    setIsModalupdate(false);
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      align: "center",
    },
    {
      title: "Địa chỉ cụ thể",
      dataIndex: "detail_address",
      key: "detail_address",
      align: "center",
    },
    {
      title: "Địa chỉ mặc định",
      dataIndex: "id_default",
      key: "id_default",
      align: "center",
      render: (text) => text ? <CheckOutlined /> : null,
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div className="action-container">
          <Tooltip title="Cập nhật">
            <Button color="primary" variant="solid" icon={<EditOutlined />} onClick={() => showModalUpdate(record.id)}/>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="mb-5">
        <EnvironmentOutlined style={{ marginRight: "8px" }} />
        Địa chỉ của bạn
      </h1>

      <Button 
        color="primary" 
        variant="solid"
        icon={<PlusOutlined />} 
        onClick={showModal}
      >
        Thêm mới
      </Button>

      <Skeleton active loading={isLoading}>
        <Table
          columns={columns}
          dataSource={addresses}
          pagination={false}
        />
      </Skeleton>

      <Modal
        title="Thêm địa chỉ mới"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
        >
          <Form.Item 
            name="province" label="Tỉnh/Thành phố" 
            rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]}
          > 
            <Select onChange={handleProvinceChange} className="input-item" placeholder="Chọn tỉnh/thành phố">
              {provinces.map(p => <Select.Option key={p.code} value={p.code}>{p.name}</Select.Option>)}
            </Select>
          </Form.Item>

          <Form.Item  
            name="district" label="Quận/Huyện" 
            rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
          > 
            <Select onChange={handleDistrictChange} disabled={!districts.length} className="input-item" placeholder="Chọn quận/huyện">
              {districts.map(d => <Select.Option key={d.code} value={d.code}>{d.name}</Select.Option>)}
            </Select>
          </Form.Item>

          <Form.Item  
            name="ward" label="Phường/Xã" 
            rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
          > 
            <Select disabled={!wards.length} className="input-item" placeholder="Chọn phường/xã">
              {wards.map(w => <Select.Option key={w.code} value={w.code}>{w.name}</Select.Option>)}
            </Select>
          </Form.Item>

          <Form.Item 
            name="detail_address" label="Địa chỉ cụ thể" 
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ cụ thể" }]}
          > 
            <Input className="input-item" placeholder="Nhập địa chỉ cụ thể"/>
          </Form.Item>

          <Form.Item 
            name="id_default" label="Đặt làm địa chỉ mặc định" 
            rules={[{ required: true, message: "Vui lòng chọn địa chỉ mặc định" }]}
          >
            <Radio.Group>
              <Radio value={1}>Có</Radio>
              <Radio value={0}>Không</Radio>
            </Radio.Group>
          </Form.Item>

          <div className="add">
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Cập nhật địa chỉ"
        visible={isModalUpdate}
        onCancel={handleCancelUpdate}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item 
            name="province" label="Tỉnh/Thành phố" 
            rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]}
          > 
            <Select onChange={handleProvinceChange} className="input-item" placeholder="Chọn tỉnh/thành phố">
              {provinces.map(p => <Select.Option key={p.code} value={p.code}>{p.name}</Select.Option>)}
            </Select>
          </Form.Item>

          <Form.Item  
            name="district" label="Quận/Huyện" 
            rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
          > 
            <Select onChange={handleDistrictChange} disabled={!districts.length} className="input-item" placeholder="Chọn quận/huyện">
              {districts.map(d => <Select.Option key={d.code} value={d.code}>{d.name}</Select.Option>)}
            </Select>
          </Form.Item>

          <Form.Item  
            name="ward" label="Phường/Xã" 
            rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
          > 
            <Select disabled={!wards.length} className="input-item" placeholder="Chọn phường/xã">
              {wards.map(w => <Select.Option key={w.code} value={w.code}>{w.name}</Select.Option>)}
            </Select>
          </Form.Item>

          <Form.Item 
            name="detail_address" label="Địa chỉ cụ thể" 
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ cụ thể" }]}
          > 
            <Input className="input-item" placeholder="Nhập địa chỉ cụ thể"/>
          </Form.Item>

          <Form.Item 
            name="id_default" label="Đặt làm địa chỉ mặc định" 
            rules={[{ required: true, message: "Vui lòng chọn địa chỉ mặc định" }]}
          >
            <Radio.Group>
              <Radio value={1}>Có</Radio>
              <Radio value={0}>Không</Radio>
            </Radio.Group>
          </Form.Item>

          <div className="add">
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Address;
