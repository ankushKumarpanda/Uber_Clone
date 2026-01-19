/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Navbar from "../components/Navbar";
import markerIcon2x from "../assets/leaflet/marker-icon-2x.png";
import markerIcon from "../assets/leaflet/marker-icon.png";
import markerShadow from "../assets/leaflet/marker-shadow.png";



const customIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
    

export default function UserDashboard() {
  const [location, setLocation] = useState([12.9716, 77.5946]); // Default to Bengaluru
  const [formData, setFormData] = useState({
    pickup: "",
    destination: "",
    schedule: "now",
  });

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation([pos.coords.latitude, pos.coords.longitude]),
      () => console.log("Location access denied")
    );
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const handleSearch = () => {
    if (!formData.pickup || !formData.destination) {
      alert("Please enter both pickup and destination!");
      return;
    }
   
    navigate(`/book-ride?pickup=${encodeURIComponent(formData.pickup)}&destination=${encodeURIComponent(formData.destination)}&schedule=${encodeURIComponent(formData.schedule)}`);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
       
        <div className="bg-white text-black p-6 rounded-xl shadow-lg flex flex-col justify-between min-h-[480px]">
          <div>
            <h2 className="text-xl font-bold mb-6">Get a ride</h2>

         
            <div className="mb-4">
              <label className="text-gray-600 text-sm">Pickup location</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="pickup"
                  placeholder="Enter pickup location"
                  value={formData.pickup}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 mt-1 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
            </div>

            
            <div className="mb-4">
              <label className="text-gray-600 text-sm">Dropoff location</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="destination"
                  placeholder="Enter destination"
                  value={formData.destination}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 mt-1 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
            </div>
       
            <div className="mb-6">
              <label className="text-gray-600 text-sm">Pickup time</label>
              <select
                name="schedule"
                value={formData.schedule}
                onChange={handleChange}
                className="w-full p-3 mt-1 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <option value="now">Pickup now</option>
                <option value="later">Schedule for later</option>
              </select>
            </div>

    
            <button
              onClick={handleSearch}
              className="w-full bg-gray-200 text-gray-600 font-semibold py-3 rounded-md hover:bg-gray-300 transition"
            >
              Search
            </button>
          </div>
        </div>

    
        <div className="lg:col-span-2 rounded-xl overflow-hidden shadow-lg border border-gray-700">
          <MapContainer
            center={location}
            zoom={13}
            scrollWheelZoom={false}
            className="h-[500px] w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <Marker position={location} icon={customIcon}>
              <Popup>You are here!</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
