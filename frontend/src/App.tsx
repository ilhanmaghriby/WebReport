import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Upload from "./components/Upload";
import Home from "./components/Home";
import Admin from "./components/Admin";
import Dashboard from "./components/Dashboard";
import UserRoute from "./components/UserRoute";
import AdminRoute from "./components/AdminRoute";
import Edit from "./components/Edit";
import Layout from "./components/Layout"; // ✅ Import Layout
import DataAuth from "./components/DataAuth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman tanpa Navbar/Footer */}
        <Route path="/login" element={<Login />} />
        <Route
          path="/upload"
          element={
            <UserRoute>
              <Upload />
            </UserRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <UserRoute>
              <Edit />
            </UserRoute>
          }
        />

        {/* Halaman dengan Navbar/Footer */}
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Layout>
                <Admin />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/auth"
          element={
            <AdminRoute>
              <Layout>
                <DataAuth />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <UserRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </UserRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
