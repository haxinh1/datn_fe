import React, { useState } from 'react';
import { Select, Form, DatePicker, Input } from 'antd';
import { useQuery } from '@tanstack/react-query';
import "../admin/product/add.css";
import { ValuesServices } from '../services/attribute_value';
import { BrandsServices } from '../services/brands';
import dayjs from 'dayjs';

const { Option } = Select;

const Test = () => {
    const [selectedDate, setSelectedDate] = useState(null);

    const handleDateChange = (date, dateString) => {
        setSelectedDate(dateString);
    };

    return (
        <Form layout="vertical">
            <Form.Item
                label="Chọn ngày"
                name="selected_date"
                rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
            >
                <DatePicker 
                    value={selectedDate ? dayjs(selectedDate) : null} 
                    onChange={handleDateChange} 
                    className="input-item" 
                    format="DD-MM-YY"
                />
            </Form.Item>
        </Form>
    );
};

export default Test;
