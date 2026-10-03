import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ApiTest from "./pages/ApiTest";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import Employees from "./pages/Employees";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/api-test"
          element={<ApiTest />}
        />

        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/sales"
            element={<Sales />}
          />

            <Route
            path="/inventory"
            element={<Inventory />}
          />

            <Route
            path="/customers"
            element={<Customers />}
          />

          <Route path="/employees" element={<Employees />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;