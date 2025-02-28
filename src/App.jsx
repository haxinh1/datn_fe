import "./App.css";
import { Route, Routes } from "react-router-dom";
import List from "./admin/product/List";
import Edit from "./admin/product/Edit";
import Add from "./admin/product/Add";
import LayoutAdmin from "./layout/LayoutAdmin";
import Brand from "./admin/Brand";
import Test from './admin/Test';
import ProductDetail from './admin/product/DetailAd';
import Categories from './admin/category/index';
import Import from "./admin/product/Import";
import Creat from "./admin/product/Creat";
import History from "./admin/product/History";
import Home from './pages/Home';
import LayoutClient from "./layout/LayoutClient";
import ProductDetailClient from "./components/client/product/ProductDetailClient";
import Cart from './components/client/cart';

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
        </Route>
      </Routes>
      

      <Routes>
        <Route path="/" element={<LayoutClient />}>
          <Route index element={<Home />} />
          <Route path="product-detail/:id" element={<ProductDetailClient />} />
          <Route path="cart" element={<Cart />} />
        </Route>
      </Routes>




    </>
  );
}

export default App;