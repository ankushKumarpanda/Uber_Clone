import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import Navbar from "../components/Navbar";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function UserRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    FullName: "",
    Email: "",
    MobileNo: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const registerUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_BASE}/users/register`, form);

      alert("Account created successfully!");
      navigate("/user-login");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Registration failed");
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
            Create your account
          </h2>

          <form onSubmit={registerUser} className="space-y-4">

            <input
              type="text"
              name="FullName"
              placeholder="Full name"
              value={form.FullName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-black"
              required
            />

            <input
              type="email"
              name="Email"
              placeholder="Email"
              value={form.Email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-black"
              required
            />

            <input
              type="text"
              name="MobileNo"
              placeholder="Phone number"
              value={form.MobileNo}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-black"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Create password"
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
              {loading ? "Creating..." : "Create Account"}
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
            <span className="font-medium text-gray-700">Sign up with Google</span>
          </button>

          <button className="w-full flex items-center justify-center gap-3 border
                             border-gray-300 py-3 rounded-md mt-3 hover:bg-gray-50 transition">
            <FaApple size={20} />
            <span className="font-medium text-gray-700">Sign up with Apple</span>
          </button>

          <p className="text-gray-600 text-sm mt-8">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-black font-medium hover:underline cursor-pointer"
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
