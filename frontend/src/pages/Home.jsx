import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">

      <Navbar />

      <div className="grid grid-cols-1 lg:grid-cols-2 px-10 py-8">
        <div className="flex flex-col justify-center">
          <h1 className="text-5xl font-bold leading-snug">
            Log in to access<br />your account
          </h1>
        </div>

        <div className="flex justify-center">
          <img
            src="/car.png"
            alt="car"
            className="rounded-xl w-[600px] h-[350px] object-cover"
          />
        </div>
      </div>

      <div className="px-10 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="border-t border-gray-700 pt-8 flex items-center justify-between">
          <div className="text-3xl font-semibold">Rider</div>
          <Link to="/user-login" className="text-3xl">→</Link>
        </div>

        <div className="border-t border-gray-700 pt-8 flex items-center justify-between">
          <div className="text-3xl font-semibold">Driver</div>
          <Link to="/driver-login" className="text-3xl">→</Link>
        </div>
      </div>

    </div>
  );
}
