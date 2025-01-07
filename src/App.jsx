import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LayoutAdmin from "./Layout/LayoutAdmin";
import Categories from "./admin/category";

function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<LayoutAdmin />}>
          <Route path="/categories" element={<Categories />} />
        </Route>
      </Routes>
    </Router>
    </>
  );
}

export default App;
