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
      map.fitBounds(bounds, { padding: [60, 60] });
    });

    return () => map.removeControl(routingControl);
  }, [map, pickupCoords, destinationCoords]);

  return null;
}

export default function RideConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const pickup = searchParams.get("pickup");
  const destination = searchParams.get("destination");
  const schedule = searchParams.get("schedule");
  const option = searchParams.get("option");
  const rideId = searchParams.get("rideId");

  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

  
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Confirm Your Ride</h1>
        <p className="text-gray-600 mb-6">
          From: {pickup} → To: {destination} ({option}){" "}
          {schedule === "later" && "(Scheduled)"}
        </p>

     
        <div className="h-[400px] rounded-xl overflow-hidden shadow-lg border border-gray-200 mb-6">
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

     
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
          <h2 className="text-xl font-semibold mb-2">Ride Details</h2>
          <p className="text-gray-700">Ride Type: {option}</p>
          <p className="text-gray-700">Fare Estimate: ₹{option === "XL" ? 649 : option === "Premier" ? 449 : 349}</p>
          <p className="text-gray-700">Pickup: {pickup}</p>
          <p className="text-gray-700">Destination: {destination}</p>
        </div>

       
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 border border-gray-400 rounded-md hover:bg-gray-100 transition"
          >
            Back
          </button>
          <button
            className="px-6 py-2 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition"
            onClick={() =>
              navigate(
                `/ride-status?rideId=${rideId}&pickup=${pickup}&destination=${destination}&option=${option}`
              )
            }
          >
            Confirm & Pay
          </button>
        </div>
      </div>
    </div>
  );
}
