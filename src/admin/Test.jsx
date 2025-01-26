import React from 'react';
import { Select } from 'antd';
import { useQuery } from '@tanstack/react-query';
import "../admin/product/add.css";
import { ValuesServices } from '../services/attribute_value';
import { BrandsServices } from '../services/brands';

const { Option } = Select;

const Test = () => {
    const { data: attributeValue } = useQuery({
        queryKey: ["attributeValue"],
        queryFn: async () => {
            const response = await ValuesServices.fetchValues()
            return response.data;
        }
    });

    return (
        <div>
            <Select
                className="input-attribute"
                placeholder="Chọn giá trị thuộc tính"
                allowClear
                notFoundContent="Không có dữ liệu"
            >
                {attributeValue && attributeValue.map((val) => (
                    <Option key={val.id} value={val.value}>
                        {val.value}
                    </Option>
                ))}
            </Select>
        </div>
    );
};

export default Test;
