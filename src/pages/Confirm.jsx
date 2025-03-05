import React, { useEffect, useState } from "react";
import '../assets/css/bootstrap.min.css';
import '../assets/css/plugins/owl-carousel/owl.carousel.css';
import '../assets/css/plugins/magnific-popup/magnific-popup.css';
import '../assets/css/plugins/jquery.countdown.css';
import '../assets/css/style.css';
import '../assets/css/skins/skin-demo-8.css';
import '../assets/css/demos/demo-8.css';

const Confirm = () => {

    return (
        <div className="login-page bg-image pt-8 pb-8 pt-md-12 pb-md-12 pt-lg-17 pb-lg-17">
            <div className="container">
                <div className="form-box">
                    <div className="form-tab">
                        <ul className="nav nav-pills nav-fill">
                            <li className="nav-item">
                                <a className="nav-link active">Xác nhận đăng ký</a>
                            </li>
                        </ul>
                        <div className="tab-content">
                            <div className="tab-pane fade show active">
                                <form>
                                    <div className="product-content">
                                        <p>Hãy kiển tra Email và nhập mã xác nhận để kích hoạt tài khoản.{" "}</p>
                                    </div>
                                    <div className="form-group">
                                        <label>Mã xác nhận</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            
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
