import "./App.css";
import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./axios";
import LayoutAdmin from "./Layout/LayoutAdmin";

import List from "./admin/product/List";
import Edit from "./admin/product/Edit";
import Add from "./admin/product/Add";
import ProductDetail from "./admin/product/DetailAd";
// import Register from "./admin/Register";
// import Login from "./admin/Login";
// import HomePage from "./pages/HomePage";
// import Cart from "./pages/Cart";
// import Pay from "./pages/Pay";
// import Detail from "./pages/Detail";
// import Signin from "./pages/Signin";
// import Signup from "./pages/Signup";
// import Bill from "./admin/Bill";
// import Inbox from "./admin/Inbox";
// import LayoutPage from "./Layout/LayoutPage";

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/products");
        setProducts(data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<LayoutAdmin />}>
          <Route path="/detailad" element={<ProductDetail />} />
          <Route path="/list-pr" element={<List />} />
          <Route path="/add-pr" element={<Add />} />
          <Route path="/edit-pr" element={<Edit />} />
          {/* <Route path="/bill" element={<Bill />} /> */}
          {/* <Route path="/inbox" element={<Inbox />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} /> */}
        </Route>
      </Routes>
    </>
  );
}

export default App;
