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
import ProductReview from "./pages/ProductReview";
import Comment from "./admin/comment";
import Review from "./pages/Review";
import Detail from "./pages/Detail";
import User from "./admin/User";
import Staff from "./admin/Staff";
import Return from "./pages/Return";
import Back from "./admin/Back";
import BackCl from "./pages/BackCl";
import DashboardAd from "./admin/DashboardAd";
import GoogleCallbackHandler from "./pages/GoogleCallbackHandler";
import OrderStaff from "./admin/OrderStaff";
import Cate from "./pages/Cate";
import DetailCate from "./pages/DetailCate";
import RoleRouter from "./admin/RoleRouter";

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
          <Route path="logincl" element={<LoginCl />} />
          <Route path="cate" element={<Cate />} />
          <Route path="detailcate/:id" element={<DetailCate />} />
          <Route path="list-prcl" element={<ListProduct />} />
          <Route path="thanks" element={<Thankyoupage />} />
          <Route path="product-review" element={<ProductReview />} />
          <Route path="product-review/:id" element={<ProductReview />} />
          <Route path="review/:id" element={<Review />} />
          <Route path="detail/:id" element={<Detail />} />
          <Route path="google-callback" element={<GoogleCallbackHandler />} />
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
            <Route path="return/:id" element={<Return />} />
            <Route path="backcl/:id" element={<BackCl />} />
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
          
            <Route element={<RoleRouter allowedRoles={["admin"]} />}>
              <Route path="dashboardad" element={<DashboardAd />} />
              <Route path="account" element={<Account />} />
              <Route path="order" element={<Order />} />
              <Route path="staff/:id" element={<Staff />} />
            </Route>

            {/* Các route không phân quyền hoặc phân quyền khác */}
            <Route path="list-pr" element={<List />} />
            <Route path="detailad/:id" element={<ProductDetail />} />
            <Route path="add-pr" element={<Add />} />
            <Route path="edit-pr/:id" element={<Edit />} />
            <Route path="import" element={<Import />} />
            <Route path="creat" element={<Creat />} />
            <Route path="categories" element={<Categories />} />
            <Route path="history" element={<History />} />
            <Route path="brand" element={<Brand />} />
            <Route path="customer" element={<Customer />} />
            <Route path="user/:id" element={<User />} />
            <Route path="test" element={<Test />} />
            <Route path="orderstaff" element={<OrderStaff />} />
            <Route path="back" element={<Back />} />
            <Route path="bill" element={<Bill />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="coupon" element={<Coupon />} />
            <Route path="update/:id" element={<Update />} />
            <Route path="change/:id" element={<Change />} />
            <Route path="comment" element={<Comment />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
