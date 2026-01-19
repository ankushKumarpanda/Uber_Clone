import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); 
    navigate("/"); 
  };

 
  const isLoggedIn = localStorage.getItem("user") || localStorage.getItem("driver");

  return (
    <nav className="w-full bg-black text-white py-4 px-8 flex items-center justify-between">
      <div className="flex items-center space-x-10">
        <Link to="/" className="text-2xl font-bold hover:opacity-90">Uber</Link>

        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link to="/user-dashboard" className="hover:text-gray-300">Ride</Link>
          <Link to="/driver-dashboard" className="hover:text-gray-300">Drive</Link>
          <Link to="/about" className="hover:text-gray-300">About</Link>
        </div>
      </div>

      <div className="flex items-center space-x-6 text-sm font-medium">
        <button className="hover:text-gray-300">🌐 EN</button>
        <button className="hover:text-gray-300">Help</button>

        
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="hover:text-gray-300"
          >
            Log off
          </button>
        ) : (
          <>
            <Link to="/user-login" className="hover:text-gray-300">Log in</Link>
            <Link 
              to="/user-register"
              className="bg-white text-black px-5 py-2 rounded-full font-medium hover:bg-gray-200 transition"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
