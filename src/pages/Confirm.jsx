import React, { useState } from "react";
import '../assets/css/bootstrap.min.css';
import '../assets/css/plugins/owl-carousel/owl.carousel.css';
import '../assets/css/plugins/magnific-popup/magnific-popup.css';
import '../assets/css/plugins/jquery.countdown.css';
import '../assets/css/style.css';
import '../assets/css/skins/skin-demo-8.css';
import '../assets/css/demos/demo-8.css';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthServices } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";

const Confirm = () => {
    const queryClient = useQueryClient(); 
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const navigate = useNavigate()

    // Gửi mã xác nhận
    const { mutate } = useMutation({
        mutationFn: async (user) => {
            try {
                const response = await AuthServices.verify(user);
                return response
            } catch (error) {
                throw new Error(error.response?.data?.message || "Đã xảy ra lỗi");
            }
        },
        onSuccess: () => {
            notification.success({
                message: "Tài khoản của bạn đã được kích hoạt",
                description: "Hãy đăng nhập và sử dụng dịch vụ."
            });
            queryClient.invalidateQueries({ queryKey: ["verify-email"] });
            navigate("/logincl");
        },
        onError: (error) => {
            notification.error({
                message: "xác nhận thất bại",
                description: error.message,
            });
        },
    });

    const handleConfirm = (e) => {
        e.preventDefault();

        console.log({
            email: email,
            verification_code: code
        })
        mutate({
            email: email,
            verification_code: code
        });
    };  

    return (
        <div className="login-page bg-image pt-8 pb-8 pt-md-12 pb-md-12 pt-lg-17 pb-lg-17">
            <div className="container">
                <div className="form-box">
                    <div className="form-tab">
                        <ul className="nav nav-pills nav-fill">
                            <li className="nav-item">
                                <a className="nav-link active"><span>Xác Nhận Đăng Ký</span></a>
                            </li>
                        </ul>
                        <div className="tab-content">
                            <div className="tab-pane fade show active">
                                <div className="product-content">
                                    <span>Hãy kiểm tra Email và nhập mã xác nhận để kích hoạt tài khoản.{" "}</span>
                                </div>
                                <form onSubmit={handleConfirm}>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input 
                                            type="email" 
                                            className="form-control" 
                                            value={email} 
                                            onChange={(e) => setEmail(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Mã xác nhận</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={code} 
                                            onChange={(e) => setCode(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    {/* {error && <p className="text-danger">{error}</p>} */}
                                    <div className="form-footer">
                                        <button type="submit" className="btn btn-outline-primary-2">
                                            <span>Xác nhận</span>
                                            <i className="icon-long-arrow-right"></i>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Confirm;
