import "./App.css";
import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./axios";
import LayoutAdmin from "./layout/LayoutAdmin";
import ProductDetail from "./admin/product/DetailAd";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LayoutAdmin />}>
          <Route path="/detailad" element={<ProductDetail />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
