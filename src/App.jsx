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
import Dashboard from "./pages/Dashboard";
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
import Reset from "./pages/Reset";
import Update from "./admin/Update";
import Change from "./admin/Change";
import ForgetAd from "./admin/ForgetAd";
import ResetAd from "./admin/ResetAd";
import PrivateClient from "./pages/PrivateClient";
import ChangePass from "./pages/ChangePass";
import Info from "./pages/Info";
import Orders from "./pages/Orders";
import Address from "./pages/Address";
import Bill from "./admin/Bill";
import Customer from "./admin/Customer";

function App() {
  return (
    <>
      {/*router cho khách hàng */}
      <Routes>
        <Route path="/" element={<LayoutClient />}>
          <Route index element={<Home />} />
          <Route path="product-detail/:id" element={<ProductDetailClient />} />
          <Route path="cart" element={<Cart />} />
          <Route path="signup" element={<Signup />} />
          <Route path="confirm" element={<Confirm />} />
          <Route path="forget" element={<Forget />} />
          <Route path="reset/:token" element={<Reset />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="payments" element={<Payments />} />
          <Route path="logincl" element={<LoginCl />} />
          <Route path="list-prcl" element={<ListProduct />} />
          <Route path="thanks" element={<Thankyoupage />} />

          <Route
            path="dashboard"
            element={
              <PrivateClient>
                <Dashboard />
              </PrivateClient>
            }
          >
            <Route path="changepass/:id" element={<ChangePass />} />
            <Route path="info/:id" element={<Info />} />
            <Route path="orders/:id" element={<Orders />} />
            <Route path="address/:id" element={<Address />} />
          </Route>
        </Route>
      </Routes>

      <Routes>
        <Route path="/loginad" index element={<LoginAd />} />
        <Route path="/forgetad" element={<ForgetAd />} />
        <Route path="/resetad/:token" element={<ResetAd />} />

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
            <Route path="customer" element={<Customer />} />
            <Route path="test" element={<Test />} />
            <Route path="order" element={<Order />} />
            <Route path="bill" element={<Bill />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="coupon" element={<Coupon />} />
            <Route path="update/:id" element={<Update />} />
            <Route path="change/:id" element={<Change />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
