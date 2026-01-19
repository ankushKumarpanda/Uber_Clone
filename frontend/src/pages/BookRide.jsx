/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import markerIcon2x from "../assets/leaflet/marker-icon-2x.png";
import markerIcon from "../assets/leaflet/marker-icon.png";
import markerShadow from "../assets/leaflet/marker-shadow.png";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;


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
      show: false,
      routeWhileDragging: false,
      createMarker: () => null,
    }).addTo(map);

    routingControl.on("routesfound", function (e) {
      const bounds = L.latLngBounds([
        [pickupCoords[0], pickupCoords[1]],
        [destinationCoords[0], destinationCoords[1]],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    });

    return () => map.removeControl(routingControl);
  }, [map, pickupCoords, destinationCoords]);

  return null;
}

export default function BookRide() {
  const [searchParams] = useSearchParams();
  const pickup = searchParams.get("pickup");
  const destination = searchParams.get("destination");
  const schedule = searchParams.get("schedule");

  const navigate = useNavigate();

  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [selectedOption, setSelectedOption] = useState("UberX");
  const [loading, setLoading] = useState(false);

 
  const getCoordinates = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data && data[0]) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      return null;
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      return null;
    }
  };


  useEffect(() => {
    const fetchCoords = async () => {
      const pickupResult = await getCoordinates(pickup);
      const destinationResult = await getCoordinates(destination);
      setPickupCoords(pickupResult);
      setDestinationCoords(destinationResult);
    };
    fetchCoords();
  }, [pickup, destination]);

 const handleConfirmBooking = async () => {
  if (!pickup || !destination) return;
  setLoading(true);

  try {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user?.Id) {
      alert("Please log in first!");
      navigate("/user-login");
      return;
    }

    const rideData = {
      UserId: user.Id,    
      DriverId: null,     
      Pickup: pickup,
      Destination: destination,
      Fare:
        selectedOption === "UberX"
          ? 349
          : selectedOption === "Premier"
          ? 449
          : 649,
      RideStatus: "Pending",
    };

    const res = await axios.post(`${API_BASE}/rides/create`, rideData);

    if (res.data.RideId) {
      navigate(
        `/ride-confirm?rideId=${res.data.RideId}&pickup=${encodeURIComponent(
          pickup
        )}&destination=${encodeURIComponent(
          destination
        )}&schedule=${encodeURIComponent(
          schedule || "now"
        )}&option=${encodeURIComponent(selectedOption)}`
      );
    } else {
      alert("Ride creation failed — no rideId returned.");
    }
  } catch (err) {
    console.error("Error creating ride:", err);
    alert("Error while creating ride. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Book Your Ride</h1>
          <p className="text-gray-600">
            From: {pickup} → To: {destination}
            {schedule === "later" && " (Scheduled)"}
          </p>
        </div>

    
        <div className="h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            scrollWheelZoom={true}
            zoomControl={true}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {pickupCoords && (
              <Marker position={pickupCoords} icon={customIcon}>
                <Popup>Pickup: {pickup}</Popup>
              </Marker>
            )}
            {destinationCoords && (
              <Marker position={destinationCoords} icon={customIcon}>
                <Popup>Destination: {destination}</Popup>
              </Marker>
            )}
            {pickupCoords && destinationCoords && (
              <Routing
                pickupCoords={pickupCoords}
                destinationCoords={destinationCoords}
              />
            )}
          </MapContainer>
        </div>

       
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: "UberX", name: "UberX", desc: "Affordable everyday rides", price: "₹349" },
            { id: "Premier", name: "Premier", desc: "Premium cars, top-rated drivers", price: "₹449" },
            { id: "XL", name: "XL", desc: "Spacious rides for groups", price: "₹649" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedOption(opt.id)}
              className={`p-4 rounded-xl transition-all text-left border ${
                selectedOption === opt.id
                  ? "border-black bg-gray-100"
                  : "border-gray-200 hover:border-black"
              }`}
            >
              <h3 className="font-semibold mb-2">{opt.name}</h3>
              <p className="text-gray-600">{opt.desc}</p>
              <p className="text-lg font-bold mt-2">{opt.price}</p>
            </button>
          ))}
        </div>

       
        <button
          onClick={handleConfirmBooking}
          disabled={!pickup || !destination || loading}
          className={`mt-6 w-full text-white font-semibold py-4 rounded-xl transition ${
            !pickup || !destination || loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
          }`}
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}
