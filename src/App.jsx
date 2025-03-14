import "./App.css";
import { Route, Routes } from "react-router-dom";
import List from "./admin/product/List";
import Edit from "./admin/product/Edit";
import Add from "./admin/product/Add";
import LayoutAdmin from "./layout/LayoutAdmin";
import Brand from "./admin/Brand";
import Test from "./admin/Test";
import ProductDetail from "./admin/product/DetailAd";
import Categories from "./admin/category/index";
import Import from "./admin/product/Import";
import Creat from "./admin/product/Creat";
import History from "./admin/product/History";
import Home from "./pages/Home";
import LayoutClient from "./layout/LayoutClient";
import ProductDetailClient from "./components/client/product/ProductDetailClient";
import LoginAd from "./admin/LoginAd";
import PrivateRoute from "./admin/PrivateRAd";
import Account from "./admin/Account";
import Signup from "./pages/Signup";

import Cart from "./pages/Cart";
import Thankyoupage from "./pages/Thankyou";
import Order from "./admin/Order";
import Checkout from "./pages/Checkout";
import Payments from "./pages/Payments";
import LoginCl from "./pages/LoginCl";
import ListProduct from "./pages/ListProduct";
import Inbox from "./admin/Inbox";
import Confirm from "./pages/Confirm";
import Coupon from "./admin/Coupon";
import Forget from "./pages/Forget";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LayoutClient />}>
          <Route index element={<Home />} />
          <Route path="product-detail/:id" element={<ProductDetailClient />} />
          <Route path="cart" element={<Cart />} />
          <Route path="signup" element={<Signup />} />
          <Route path="confirm" element={<Confirm />} />
          <Route path="forget" element={<Forget />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="payments" element={<Payments />} />
          <Route path="logincl" element={<LoginCl />} />
          <Route path="list-prcl" element={<ListProduct />} />
          <Route path="thanks" element={<Thankyoupage />} />
        </Route>
      </Routes>

      <Routes>
        <Route path="/loginad" index element={<LoginAd />} />

        {/* Các trang cần đăng nhập */}
        <Route element={<PrivateRoute />}>
          <Route path="/admin" element={<LayoutAdmin />}>
            <Route path="list-pr" element={<List />} />
            <Route path="detailad/:id" element={<ProductDetail />} />
            <Route path="add-pr" element={<Add />} />
            <Route path="edit-pr/:id" element={<Edit />} />
            <Route path="import" element={<Import />} />
            <Route path="creat" element={<Creat />} />
            <Route path="categories" element={<Categories />} />
            <Route path="history" element={<History />} />
            <Route path="brand" element={<Brand />} />
            <Route path="account" element={<Account />} />
            <Route path="test" element={<Test />} />
            <Route path="order" element={<Order />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="coupon" element={<Coupon />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
