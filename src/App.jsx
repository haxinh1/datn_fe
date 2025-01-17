import { Route, Routes } from "react-router-dom";
import LayoutAdmin from './layout/LayoutAdmin';
import Categories from "./admin/category";

function App() {

  return (
    <>
    
      <Routes>
        <Route path="/" element={<LayoutAdmin />}>
          <Route path="/categories" element={<Categories />} />
        </Route>
      </Routes>
    
    </>
  );
}

export default App;
