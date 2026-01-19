import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import UserLogin from "./pages/UserLogin";
import UserDashboard from "./pages/UserDashboard";
import BookRide from "./pages/BookRide";
import UserRegister from "./pages/UserRegister";
import RideConfirm from "./pages/RideConfirm";
import RideStatus from "./pages/RideStatus";
import DriverLogin from "./pages/DriverLogin";
import DriverDashboard from "./pages/DriverDashboard";
import DriverRegister from "./pages/DriverRegister";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/user-login" element={<UserLogin />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/book-ride" element={<BookRide />} />
      <Route path="/user-register" element={<UserRegister />} />
      <Route path="/ride-confirm" element={<RideConfirm />} />
      <Route path="/ride-status" element={<RideStatus />} />
      <Route path="/driver-login" element={<DriverLogin />} />
      <Route path="/driver-dashboard" element={<DriverDashboard />} />
      <Route path="/driver-register" element={<DriverRegister />} />
    </Routes>
  );
}