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
import Home from './pages/Home';
import LayoutClient from "./layout/LayoutClient";
import ProductDetailClient from "./components/client/product/ProductDetailClient";
import Cart from './components/client/cart';
import LoginAd from "./admin/LoginAd";
import PrivateRoute from "./admin/PrivateRAd";
import Account from "./admin/Account";
import Signup from "./pages/Signup";
import Order from './admin/Order';
import Edit_order from './admin/Edit_order';

function App() {
  return (
    <>

      <Routes>
        <Route path="/" element={<LayoutClient />}>
          <Route index element={<Home />} />
          <Route path="product-detail/:id" element={<ProductDetailClient />} />
          <Route path="cart" element={<Cart />} />
          <Route path="signup" element={<Signup />} />
        </Route>
      </Routes>

      <Routes>
        <Route path="/loginad" element={<LoginAd />} />

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
            <Route path="edit_order/:id" element={<Edit_order />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
