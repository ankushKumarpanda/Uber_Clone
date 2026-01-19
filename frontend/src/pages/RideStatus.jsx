/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import axios from "axios";

import markerIcon2x from "../assets/leaflet/marker-icon-2x.png";
import markerIcon from "../assets/leaflet/marker-icon.png";
import markerShadow from "../assets/leaflet/marker-shadow.png";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";


const customIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


function Routing({ pickupCoords, destinationCoords }) {
  const map = useMap();

  useEffect(() => {
    if (!pickupCoords || !destinationCoords) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(pickupCoords[0], pickupCoords[1]),
        L.latLng(destinationCoords[0], destinationCoords[1]),
      ],
      lineOptions: {
        styles: [{ color: "black", weight: 5, opacity: 0.9 }],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      createMarker: () => null,
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, pickupCoords, destinationCoords]);

  return null;
}

export default function RideStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const pickup = searchParams.get("pickup");
  const destination = searchParams.get("destination");
  const option = searchParams.get("option");
  const rideId = searchParams.get("rideId"); 

  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

  const [rideStatus, setRideStatus] = useState("Finding Driver");
  const [driverInfo, setDriverInfo] = useState(null);

  const pollRef = useRef(null);


  const getCoordinates = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data?.[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const loadCoords = async () => {
      setPickupCoords(await getCoordinates(pickup));
      setDestinationCoords(await getCoordinates(destination));
    };
    loadCoords();
  }, [pickup, destination]);

  
useEffect(() => {
  if (!rideId) return;

  const fetchRide = async () => {
    try {
      const res = await axios.get(`${API_BASE}/rides/${rideId}`);

      const ride = res.data?.Ride;
      if (!ride) return;

      const status = ride.RideStatus?.toLowerCase();

 
      if (status === "pending") setRideStatus("Finding Driver");
      else if (status === "accepted") setRideStatus("Driver Assigned");
      else if (status === "started") setRideStatus("On Trip");
      else if (status === "completed") setRideStatus("Completed");

 
      const dd = ride.DriverDetails;
      if (dd && dd.User) {
        setDriverInfo({
          name: dd.User.FullName,
          phone: dd.User.MobileNo,
          car: dd.CarModel,
          licenseNo: dd.LicenseNo,
        });
      }


      if (status === "completed") {
        clearInterval(pollRef.current);
        pollRef.current = null;
        setTimeout(() => navigate("/user-dashboard"), 1000);
      }
    } catch (err) {
      console.error("Ride polling error:", err);
    }
  };

  fetchRide(); 
  pollRef.current = setInterval(fetchRide, 3000);

  return () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };
}, [rideId, navigate]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Ride Status</h1>
        <p className="text-gray-600 mb-6">
          From: {pickup} → To: {destination} {option ? `• ${option}` : ""}
        </p>

       
        <div className="h-[400px] rounded-xl overflow-hidden border mb-6">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {pickupCoords && <Marker position={pickupCoords} icon={customIcon} />}
            {destinationCoords && (
              <Marker position={destinationCoords} icon={customIcon} />
            )}
            {pickupCoords && destinationCoords && (
              <Routing pickupCoords={pickupCoords} destinationCoords={destinationCoords} />
            )}
          </MapContainer>
        </div>

       
        <div className="bg-gray-50 border rounded-xl p-5 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">
            Status:{" "}
            <span className="px-3 py-1 rounded-full bg-gray-200">
              {rideStatus}
            </span>
          </h2>

     
          {driverInfo ? (
            <div className="mt-4 flex items-center gap-4 text-gray-700">
              
              <div>
                <p><strong>Driver:</strong> {driverInfo.name}</p>
                <p><strong>Car:</strong> {driverInfo.car}</p>
                <p><strong>Phone:</strong> {driverInfo.phone}</p>
                <p><strong>License No:</strong> {driverInfo.licenseNo}</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-gray-600">Waiting for a driver to accept your ride...</p>
          )}

     
          {rideStatus === "Completed" && (
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/user-dashboard")}
                className="px-6 py-2 bg-black text-white rounded-md"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
