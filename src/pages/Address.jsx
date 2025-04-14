import {
  CheckOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  notification,
  Radio,
  Row,
  Select,
  Skeleton,
  Switch,
  Table,
  Tooltip,
} from "antd";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthServices } from "../services/auth";
import { useMutation } from "@tanstack/react-query";

const Address = () => {
  const { id } = useParams();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
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

  useEffect(() => {
    const token = "bc7b2c04-055c-11f0-b2ef-7aa43f19aaea";
    fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token: token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          setProvinces(data.data);
        }
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu tỉnh thành phố:", error);
      });
  }, []);

  const handleProvinceChange = (value) => {
    setDistricts([]);
    setWards([]);
    setSelectedProvince(value);
    setSelectedDistrict(null);
    setSelectedWard(null);

    if (!value) {
      console.error("Invalid province ID:", value);
      return;
    }

    const selectedProvince = provinces.find((p) => p.ProvinceID === value);
    if (!selectedProvince) {
      console.error("Province not found for value:", value);
      return;
    }

    const provinceId = selectedProvince.ProvinceID;
    const token = "bc7b2c04-055c-11f0-b2ef-7aa43f19aaea";
    fetch(
      `https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${provinceId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 400) {
          console.error("Error fetching districts:", data.message);
        } else if (Array.isArray(data.data)) {
          setDistricts(data.data);
        } else {
          console.error("Unexpected response format:", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching districts:", error);
      });
  };

  const handleDistrictChange = (value) => {
    setWards([]);
    setSelectedDistrict(value);
    setSelectedWard(null);

    if (!value) {
      console.error("Invalid district ID:", value);
      return;
    }

    const selectedDistrictData = districts.find((d) => d.DistrictID === value);
    if (!selectedDistrictData) {
      console.error("District not found for value:", value);
      return;
    }

    const districtId = selectedDistrictData.DistrictID;
    const token = "bc7b2c04-055c-11f0-b2ef-7aa43f19aaea";
    fetch(
      `https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${districtId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          setWards(data.data);
        } else {
          console.error("Error fetching wards:", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching wards:", error);
      });
  };

  const handleWardChange = (value) => {
    setSelectedWard(value);
    if (!value) {
      console.error("Invalid ward code:", value);
      return;
    }
    console.log("WardCode:", value);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
  };

  const formatAddress = (province, district, ward) => {
    const formattedAddress = [
      ward ? wards.find((w) => w.WardCode === String(ward))?.WardName : "",
      district
        ? districts.find((d) => d.DistrictID === Number(district))?.DistrictName
        : "",
      province
        ? provinces.find((p) => p.ProvinceID === Number(province))?.ProvinceName
        : "",
    ]
      .filter(Boolean)
      .join(", ");

    return formattedAddress;
  };

  const { mutate } = useMutation({
    mutationFn: async (userData) => {
      const response = await AuthServices.addAddress(userData);
      return response;
    },
    onSuccess: (response, userData) => {
      notification.success({
        message: "Địa chỉ mới đã được thêm",
      });
      // Cập nhật danh sách địa chỉ với dữ liệu mới
      setAddresses((prevAddresses) => [
        ...prevAddresses,
        {
          id: response.id, // Giả sử API trả về id của địa chỉ mới
          address: userData.address,
          detail_address: userData.detail_address,
          id_default: userData.id_default,
          ProvinceID: userData.ProvinceID,
          DistrictID: userData.DistrictID,
          WardCode: userData.WardCode,
        },
      ]);
      form.resetFields();
      setIsModalVisible(false);
      setSelectedProvince(null);
      setSelectedDistrict(null);
      setSelectedWard(null);
      setDistricts([]);
      setWards([]);
    },
    onError: (error) => {
      notification.error({
        message: "Thêm thất bại",
        description: error.message || "Có lỗi xảy ra khi thêm địa chỉ",
      });
    },
  });

  const handleAdd = (values) => {
    const formattedAddress = formatAddress(
      values.province,
      values.district,
      values.ward
    );

    const userData = {
      address: formattedAddress,
      detail_address: values.detail_address,
      id_default: values.id_default,
      ProvinceID: values.province,
      DistrictID: values.district,
      WardCode: values.ward,
      user_id: id, // Thêm user_id để gửi lên API
    };

    console.log("Dữ liệu gửi đi:", userData);
    mutate(userData);
  };

  const handleDelete = (addressId) => {
    Modal.confirm({
      title: "Xác nhận xóa địa chỉ",
      content: "Bạn có chắc chắn muốn xóa địa chỉ này?",
      okText: "Xóa",
      cancelText: "Không",
      onOk: async () => {
        try {
          await AuthServices.deleteAddress(addressId);
          setAddresses((prevAddresses) =>
            prevAddresses.filter((address) => address.id !== addressId)
          );
          notification.success({
            message: "Xóa địa chỉ thành công",
          });
        } catch (error) {
          notification.error({
            message: "Xóa thất bại",
            description: error.message || "Có lỗi xảy ra khi xóa địa chỉ",
          });
        }
      },
    });
  };

  const handleDefaultSwitchChange = async (addressIdToUpdate) => {
    const updatedAddresses = addresses.map((address) => ({
      ...address,
      id_default: address.id === addressIdToUpdate,
    }));
    setAddresses(updatedAddresses);

    try {
      await Promise.all(
        updatedAddresses.map((address) =>
          AuthServices.updateAddress(address.id, {
            id_default: address.id_default,
          })
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật địa chỉ mặc định:", error);
      setAddresses(addresses); // Khôi phục nếu API thất bại
      notification.error({
        message: "Cập nhật thất bại",
        description: error.message || "Có lỗi xảy ra khi cập nhật địa chỉ",
      });
    }
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
      render: (_, record) => (
        <Switch
          checked={Boolean(record.id_default)}
          onChange={() => handleDefaultSwitchChange(record.id)}
          style={{
            backgroundColor: record.id_default ? "#eea287" : "",
          }}
        />
      ),
    },
    {
      title: "",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div className="action-container">
          <Tooltip title="Xóa địa chỉ">
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="mb-5" style={{ color: "#eea287" }}>
        <EnvironmentOutlined style={{ marginRight: "8px" }} />
        Địa chỉ của bạn
      </h1>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={showModal}
        style={{ backgroundColor: "#eea287", color: "white" }}
      >
        Thêm mới
      </Button>

      <Skeleton active loading={isLoading}>
        <Table
          columns={columns}
          dataSource={addresses}
          rowKey="id"
          pagination={false}
        />
      </Skeleton>

      <Modal
        title="Thêm địa chỉ mới"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="province"
                label="Tỉnh/Thành phố"
                rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]}
              >
                <Select
                  onChange={handleProvinceChange}
                  placeholder="Chọn tỉnh/thành phố"
                  className="input-item"
                >
                  {provinces.map((province) => (
                    <Select.Option
                      key={province.ProvinceID}
                      value={province.ProvinceID}
                    >
                      {province.ProvinceName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="ward"
                label="Phường/Xã"
                rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
              >
                <Select
                  placeholder="Chọn Phường/Xã"
                  className="input-item"
                  disabled={!selectedDistrict}
                  onChange={handleWardChange}
                >
                  {wards.map((ward) => (
                    <Select.Option key={ward.WardCode} value={ward.WardCode}>
                      {ward.WardName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="district"
                label="Quận/Huyện"
                rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
              >
                <Select
                  placeholder="Chọn Quận/Huyện"
                  className="input-item"
                  onChange={handleDistrictChange}
                  disabled={!selectedProvince}
                >
                  {districts.map((district) => (
                    <Select.Option
                      key={district.DistrictID}
                      value={district.DistrictID}
                    >
                      {district.DistrictName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="detail_address"
                label="Địa chỉ cụ thể"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ cụ thể" }]}
              >
                <Input className="input-item" placeholder="Nhập địa chỉ cụ thể" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="id_default"
            label="Đặt làm địa chỉ mặc định"
            rules={[{ required: true, message: "Vui lòng chọn địa chỉ mặc định" }]}
          >
            <Radio.Group>
              <Radio value={1}>Có</Radio>
              <Radio value={0}>Không</Radio>
            </Radio.Group>
          </Form.Item>

          <div className="add">
            <Button
              style={{ backgroundColor: "#eea287", color: "white" }}
              type="primary"
              htmlType="submit"
            >
              Lưu
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Address;