import "./App.css";
import { Route, Routes } from "react-router-dom";

import LayoutAdmin from "./layout/LayoutAdmin";
import ProductDetail from "./admin/product/DetailAd";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LayoutAdmin />}>
          <Route path="/detailad" element={<ProductDetail />} />
          {/* <Route path="/list-pr" element={<List />} />
          <Route path="/add-pr" element={<Add />} />
          <Route path="/edit-pr" element={<Edit />} />
          <Route path="/brand" element={<Brand />} /> */}
        </Route>
      </Routes>

      {/* <Routes>
        <Route path="/" element={<LayoutAdmin />}>
          <Route path="/home" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/pay" element={<Pay />} />
          <Route path="/detail-pr" element={<Detail />} />
        </Route>
      </Routes> */}
    </>
  );
}

export default App;
