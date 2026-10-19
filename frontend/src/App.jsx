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
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import Employees from "./pages/Employees";
import DeliveryOrders from "./pages/DeliveryOrders";
import DeliveryDrivers from "./pages/DeliveryDrivers";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import UsersPage from "./pages/Users";
import Settings from "./pages/Settings";
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
            path="/products"
            element={<Products />}
          />

          <Route
            path="/categories"
            element={<Categories />}
          />

          <Route
            path="/inventory"
            element={<Inventory />}
          />

          <Route
            path="/customers"
            element={<Customers />}
          />

          <Route
            path="/employees"
            element={<Employees />}
          />

          <Route
            path="/payments"
            element={<Payments />}
          />

          <Route
  path="/delivery-orders"
  element={<DeliveryOrders />}
/>
          <Route path="/delivery-drivers" element={<DeliveryDrivers />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;