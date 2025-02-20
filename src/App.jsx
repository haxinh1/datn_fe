import "./App.css";
import { Route, Routes } from "react-router-dom";
import List from "./admin/product/List";
import Edit from "./admin/product/Edit";
import Add from "./admin/product/Add";
import Home from './pages/Home';
import Cart from './pages/Cart';
import Pay from './pages/Pay';
import Detail from './pages/Detail';
import LayoutAdmin from "./layout/LayoutAdmin";
import Brand from "./admin/Brand";
import Test from './admin/Test';
import ProductDetail from './admin/product/DetailAd';
import Categories from './admin/category/index';
import Import from "./admin/product/Import";
import Creat from "./admin/product/Creat";
import History from "./admin/product/History";
import HomePage from './pages/HomePage';
import LayoutClient from "./layout/LayoutClient";

function App() {

  return (
    <>
      <Routes>
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
          <Route path="test" element={<Test />} />
          <Route path="home" element={<Home />} />
          <Route path="cart" element={<Cart />} />
          <Route path="pay" element={<Pay />} />
          <Route path="detail-pr" element={<Detail />} />
        </Route>
      </Routes>

      <Routes>
        <Route path="/" element={<LayoutClient />}>
          <Route index element={<HomePage />} />

        </Route>
      </Routes>




    </>
  );
}

export default App;