import Home from "./pages/home";
import { BrowserRouter, Routes, Route } from "react-router";

import "./App.css";
import AllProducts from "./pages/allProducts";
import Layout from "./pages/layout";
import AddProduct from "./pages/addProduct";
import AllOrders from "./pages/allOrders";
import AllUsers from "./pages/allUsers";
import AllCategories from "./pages/allCategory";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="/all-products" element={<AllProducts />} />
          <Route path="/all-orders" element={<AllOrders />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/all-categories" element={<AllCategories />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
