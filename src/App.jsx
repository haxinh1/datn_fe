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
// import LayoutClient from "./layout/LayoutClient";

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<LayoutAdmin />}>
          <Route path="/list-pr" element={<List />} />
          <Route path="/add-pr" element={<Add />} />
          <Route path="/edit-pr" element={<Edit />} />
        </Route>
      </Routes>

      <Routes>
        <Route path="/" element={<LayoutAdmin />}>
          <Route path="/home" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/pay" element={<Pay />} />
          <Route path="/detail-pr" element={<Detail />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;