import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuthServices } from '../services/auth';

const Address = () => {
    const { id } = useParams();
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchAddresses = async () => {
            const data = await AuthServices.getAddressByIdUser(id);
            setAddresses(data);
        };
        
        fetchAddresses();
    }, [id]);

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
            render: (text) => (text ? "Có" : "Không"),
        },
        {
            title: "Thao tác",
            key: "action",
            align: "center",
            render: (_, record) => (
                <div className="action-container">
                    <Tooltip title="Thêm mới">
                        <Button 
                            color="purple" 
                            variant="solid" 
                            icon={<PlusOutlined />} 
                        />
                    </Tooltip>
                    <Tooltip title="Cập nhật">
                        <Button
                            color="primary"
                            variant="solid"
                            icon={<EditOutlined />}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div>
            <Table 
                columns={columns}
                dataSource={addresses}
                pagination={false}
                bordered
            />
        </div>
    );
}

export default Address;
