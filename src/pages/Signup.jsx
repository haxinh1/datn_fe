import React, { useEffect, useState } from "react";
import { notification } from "antd";
import { AuthServices } from '../services/auth';
import '../assets/css/bootstrap.min.css';
import '../assets/css/plugins/owl-carousel/owl.carousel.css';
import '../assets/css/plugins/magnific-popup/magnific-popup.css';
import '../assets/css/plugins/jquery.countdown.css';
import '../assets/css/style.css';
import '../assets/css/skins/skin-demo-8.css';
import '../assets/css/demos/demo-8.css';
import { useMutation } from "@tanstack/react-query";

const Signup = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [fullName, setFullname] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    // Sử dụng useMutation để gọi API đăng ký
    const { mutate, data } = useMutation({
        mutationFn: async (userData) => {
            try {
                const response = await AuthServices.register(userData);
                return response; // Trả về response khi đăng ký thành công
            } catch (error) {
                // In ra lỗi chi tiết để kiểm tra
                console.error('Error during registration:', error);
                throw new Error(error.response?.data?.message || "Đã xảy ra lỗi khi đăng ký");
            }
        },
        onSuccess: (data) => {
            notification.success({
                message: "Đăng ký thành công!",
                description: "Chúc mừng bạn đã đăng ký thành công.",
            });
            // Redirect hoặc reset form nếu cần
            // Ví dụ: window.location.href = "/login";
        },
        onError: (error) => {
            notification.error({
                message: "Đăng ký thất bại",
                description: error.message,
            });
        },
    });   

    useEffect(() => {
        if (data) {
            setPhoneNumber("");
            setFullname("");
            setAddress("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setError("");
        }
    }, [data]);
    
    const handleRegister = (e) => {
        e.preventDefault();
    
        // Kiểm tra mật khẩu có khớp không
        if (password !== confirmPassword) {
            setError("Mật khẩu không khớp!");
            return;
        }
    
        // Làm sạch số điện thoại (nếu cần)
        const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');  // Loại bỏ ký tự không phải số
   
        // Kiểm tra trước khi gửi dữ liệu
        if (!cleanedPhoneNumber || !password || !confirmPassword) {
            setError("Vui lòng điền đầy đủ thông tin.");
            return;
        }

        console.log({
            phone_number: cleanedPhoneNumber,
            password: password,
            password_confirmation: confirmPassword,
            fullname: fullName,
            address: address,
            email: email
        });
   
        // Gửi yêu cầu đăng ký
        mutate({
            phone_number: cleanedPhoneNumber,
            password: password,
            password_confirmation: confirmPassword,
            fullname: fullName,
            address: address,
            email: email
        });
    };   

    return (
        <div className="login-page bg-image pt-8 pb-8 pt-md-12 pb-md-12 pt-lg-17 pb-lg-17">
            <div className="container">
                <div className="form-box">
                    <div className="form-tab">
                        <ul className="nav nav-pills nav-fill">
                            <li className="nav-item">
                                <a className="nav-link active">Đăng ký</a>
                            </li>
                        </ul>
                        <div className="tab-content">
                            <div className="tab-pane fade show active">
                                <form onSubmit={handleRegister}>
                                    <div className="form-group">
                                        <label>Họ và tên</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={fullName} 
                                            onChange={(e) => setFullname(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Địa chỉ</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={address} 
                                            onChange={(e) => setAddress(e.target.value)} 
                                            required 
                                        />
                                    </div>
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
                                        <label>Số điện thoại</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={phoneNumber} 
                                            onChange={(e) => setPhoneNumber(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Mật khẩu</label>
                                        <input 
                                            type="password" 
                                            className="form-control" 
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Xác nhận mật khẩu</label>
                                        <input 
                                            type="password" 
                                            className="form-control" 
                                            value={confirmPassword} 
                                            onChange={(e) => setConfirmPassword(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    {error && <p className="text-danger">{error}</p>}
                                    <div className="form-footer">
                                        <button type="submit" className="btn btn-outline-primary-2">
                                            <span>SIGN UP</span>
                                            <i className="icon-long-arrow-right"></i>
                                        </button>
                                    </div>
                                </form>
                                <div className="form-choice">
                                    <p className="text-center">or sign in with</p>
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <a href="#" className="btn btn-login btn-g">
                                                <i className="icon-google"></i>
                                                Login With Google
                                            </a>
                                        </div>
                                        <div className="col-sm-6">
                                            <a href="#" className="btn btn-login btn-f">
                                                <i className="icon-facebook-f"></i>
                                                Login With Facebook
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
