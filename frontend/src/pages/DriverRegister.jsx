/* eslint-disable no-unused-vars */
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function DriverRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    FullName: "",
    Email: "",
    MobileNo: "",
    LicenseNo: "",
    CarModel: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/drivers/register`, form);

      alert("Driver registered successfully!");
      navigate("/driver-login");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

        
          <div className="hidden lg:flex flex-col justify-center px-6">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
              Earn with Uber
            </h1>
            <p className="text-gray-600 mb-8">
              Register as a driver, complete your profile and start accepting rides.
            </p>

            <img
              src="https://images.pexels.com/photos/7125373/pexels-photo-7125373.jpeg"
              alt="driver"
              className="rounded-xl w-full object-cover shadow-lg"
            />
          </div>

   
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Driver Registration
            </h2>

            <form onSubmit={handleRegister} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="FullName"
                  placeholder="Full Name"
                  value={form.FullName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-black"
                />
              </div>

          
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="Email"
                  placeholder="Email"
                  value={form.Email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-black"
                />
              </div>

       
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  name="MobileNo"
                  placeholder="Mobile Number"
                  value={form.MobileNo}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-black"
                />
              </div>

    
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input
                  type="text"
                  name="LicenseNo"
                  placeholder="License Number"
                  value={form.LicenseNo}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-black"
                />
              </div>

  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Car Model</label>
                <input
                  type="text"
                  name="CarModel"
                  placeholder="Car Model"
                  value={form.CarModel}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-black"
                />
              </div>

             
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-black"
                />
              </div>

      
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-black text-white py-3 rounded-md font-medium transition ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
                }`}
              >
                {loading ? "Registering..." : "Register as Driver"}
              </button>
            </form>

     
            <p className="text-center text-sm text-gray-600 mt-6">
              Already a driver?{" "}
              <span
                onClick={() => navigate("/driver-login")}
                className="text-black font-medium cursor-pointer hover:underline"
              >
                Login here
              </span>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
