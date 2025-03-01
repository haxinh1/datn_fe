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
import LoginAd from "./admin/LoginAd";
import PrivateRoute from "./admin/PrivateRAd";

function App() {
  return (
    <>
      <Routes>
        <Route path="/loginad" index element={<LoginAd />} />

        {/* Các trang cần đăng nhập */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<LayoutAdmin />}>
            <Route path="/list-pr" element={<List />} />
            <Route path="/detailad/:id" element={<ProductDetail />} />
            <Route path="/add-pr" element={<Add />} />
            <Route path="/edit-pr/:id" element={<Edit />} />
            <Route path="/import" element={<Import />} />
            <Route path="/creat" element={<Creat />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/history" element={<History />} />
            <Route path="/brand" element={<Brand />} />
            <Route path="/test" element={<Test />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
