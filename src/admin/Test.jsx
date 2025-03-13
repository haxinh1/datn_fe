import React, { useEffect, useState } from "react";
import { Select, Spin } from "antd";
import "../css/add.css";
import "../css/list.css";

const { Option } = Select;

const fetchProvinces = async () => {
    const res = await fetch("https://provinces.open-api.vn/api/?depth=3");
    return res.json();
};

const Test = () => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);

    useEffect(() => {
        fetchProvinces().then((data) => {
        setProvinces(data);
        setLoading(false);
        });
    }, []);

    const handleProvinceChange = (value) => {
        const province = provinces.find((p) => p.code === value);
        setSelectedProvince(value);
        setDistricts(province ? province.districts : []);
        setWards([]);
        setSelectedDistrict(null);
        setSelectedWard(null);
    };

    const handleDistrictChange = (value) => {
        const district = districts.find((d) => d.code === value);
        setSelectedDistrict(value);
        setWards(district ? district.wards : []);
        setSelectedWard(null);
    };

    const handleWardChange = (value) => {
        setSelectedWard(value);
    };

    return (
        <div style={{ width: 300, margin: "20px auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            {loading ? (
                <Spin />
            ) : (
                <>
                    <Select
                        placeholder="Chọn tỉnh/thành phố"
                        onChange={handleProvinceChange}
                        value={selectedProvince}
                        style={{ width: "100%" }}
                    >
                        {provinces.map((province) => (
                        <Option key={province.code} value={province.code}>{province.name}</Option>
                        ))}
                    </Select>
                    
                    <Select
                        placeholder="Chọn quận/huyện"
                        onChange={handleDistrictChange}
                        value={selectedDistrict}
                        style={{ width: "100%" }}
                        disabled={!selectedProvince}
                    >
                        {districts.map((district) => (
                        <Option key={district.code} value={district.code}>{district.name}</Option>
                        ))}
                    </Select>
                    
                    <Select
                        placeholder="Chọn phường/xã"
                        onChange={handleWardChange}
                        value={selectedWard}
                        style={{ width: "100%" }}
                        disabled={!selectedDistrict}
                    >
                        {wards.map((ward) => (
                        <Option key={ward.code} value={ward.code}>{ward.name}</Option>
                        ))}
                    </Select>
                </>
            )}
        </div>
    );
};

export default Test;