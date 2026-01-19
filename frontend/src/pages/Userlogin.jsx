import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import Navbar from "../components/Navbar";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function UserLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    emailOrPhone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/users/login`, form);

      alert("Login successful!");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/user-dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="grow flex items-center justify-center">
        <div className="w-full max-w-sm p-6 text-center">

          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            What's your phone number or email?
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">


            <input
              type="text"
              name="emailOrPhone"
              placeholder="Enter email or phone"
              value={form.emailOrPhone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-3 
                         focus:outline-none focus:ring-2 focus:ring-black"
              required
            />


            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-3 
                         focus:outline-none focus:ring-2 focus:ring-black"
              required
            />


            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white font-medium py-3 rounded-md 
                         hover:bg-gray-800 transition"
            >
              {loading ? "Logging in..." : "Continue"}
            </button>
          </form>


          <div className="flex items-center justify-center my-6">
            <hr className="w-1/3 border-gray-300" />
            <span className="mx-2 text-gray-500 text-sm">or</span>
            <hr className="w-1/3 border-gray-300" />
          </div>


          <button className="w-full flex items-center justify-center gap-3 border 
                             border-gray-300 py-3 rounded-md hover:bg-gray-50 transition">
            <FcGoogle size={20} />
            <span className="font-medium text-gray-700">Continue with Google</span>
          </button>


          <button className="w-full flex items-center justify-center gap-3 border 
                             border-gray-300 py-3 rounded-md mt-3 hover:bg-gray-50 transition">
            <FaApple size={20} />
            <span className="font-medium text-gray-700">Continue with Apple</span>
          </button>


          <p className="text-gray-600 text-sm mt-8">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/user-register")}
              className="text-black font-medium hover:underline cursor-pointer"
            >
              Create one
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
