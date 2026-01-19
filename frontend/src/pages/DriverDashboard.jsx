/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const API_BASE = import.meta.env.VITE_API_BASE_URL;


const SAMPLE_IMG_URL = "/mnt/data/Screenshot 2025-11-07 194203.png";

export default function DriverDashboard() {
  const driver = JSON.parse(localStorage.getItem("driver"));
  const driverId = driver?.Id; 

  const [unassignedRides, setUnassignedRides] = useState([]);
  const [myRides, setMyRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingRideId, setUpdatingRideId] = useState(null);


  const fetchUnassigned = async () => {
    try {
      const res = await axios.get(`${API_BASE}/rides/unassigned`);
      setUnassignedRides(res.data || []);
    } catch (err) {
      console.error("Error fetching unassigned rides:", err);
    }
  };

 
  const fetchMyRides = async () => {
    if (!driverId) {
      setMyRides([]);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/rides/driver/${driverId}`);
      setMyRides(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching driver rides:", err);
    }
  };

 
  const acceptRide = async (rideId) => {
    if (!driverId) {
      alert("Driver not logged in.");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/rides/${rideId}/accept`, {
        DriverId: driverId,
      });

      alert("Ride accepted successfully!");
      await Promise.all([fetchUnassigned(), fetchMyRides()]);
    } catch (err) {
      console.error("Error accepting ride:", err);
      alert(err.response?.data?.error || "Failed to accept ride");
    } finally {
      setLoading(false);
    }
  };

  
  const updateRideStatus = async (rideId, newStatus) => {
    if (!driverId) {
      alert("Driver not logged in.");
      return;
    }

    try {
      setUpdatingRideId(rideId);
      const res = await axios.put(`${API_BASE}/rides/update/${rideId}`, {
        RideStatus: newStatus,
      });

     
      await Promise.all([fetchUnassigned(), fetchMyRides()]);
    } catch (err) {
      console.error("Error updating ride status:", err);
      alert(err.response?.data?.error || "Failed to update ride status");
    } finally {
      setUpdatingRideId(null);
    }
  };

  useEffect(() => {
    fetchUnassigned();
    fetchMyRides();

    
  }, [driverId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-6 max-w-6xl mx-auto">
       
        <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {driver?.FullName || "Driver"}</h1>
            <p className="text-gray-600">Driver Dashboard</p>
          </div>

          
        </div>

     
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Available Rides</h2>

          {unassignedRides.length === 0 ? (
            <p className="text-gray-600">No rides available right now.</p>
          ) : (
            <div className="space-y-4">
              {unassignedRides.map((ride) => (
                <div
                  key={ride.RideId}
                  className="p-4 bg-white rounded-xl shadow flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-lg">
                      {ride.Pickup} → {ride.Destination}
                    </p>
                    <p className="text-gray-600">Fare: ₹{ride.Fare}</p>
                    <p className="text-gray-500 text-sm">User: {ride.UserName}</p>
                  </div>

                  <button
                    disabled={loading}
                    onClick={() => acceptRide(ride.RideId)}
                    className="px-5 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                  >
                    {loading ? "Accepting..." : "Accept Ride"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-3">Your Rides</h2>

          {myRides.length === 0 ? (
            <p className="text-gray-600">No rides assigned yet.</p>
          ) : (
            <div className="space-y-4">
              {myRides.map((ride) => {
                const status = (ride.RideStatus || ride.Status || "").toLowerCase();
                return (
                  <div
                    key={ride.RideId}
                    className="p-4 bg-white rounded-xl shadow flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-lg">
                        {ride.Pickup} → {ride.Destination}
                      </p>
                      <p className="text-gray-600">Fare: ₹{ride.Fare}</p>
                      <p className="text-sm text-gray-500 mt-1">User: {ride.UserName}</p>
                      <p className="text-sm mt-1">
                        Status:{" "}
                        <span
                          className={`px-2 py-1 rounded text-white ${
                            status === "completed"
                              ? "bg-green-600"
                              : status === "accepted"
                              ? "bg-yellow-500 text-black"
                              : status === "ongoing"
                              ? "bg-purple-600"
                              : "bg-gray-500"
                          }`}
                        >
                          {ride.RideStatus || ride.Status}
                        </span>
                      </p>
                    </div>

               
                    <div className="flex flex-col items-end gap-2">
                   
                      {status === "accepted" && (
                        <button
                          disabled={updatingRideId === ride.RideId}
                          onClick={() => updateRideStatus(ride.RideId, "Started")}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          {updatingRideId === ride.RideId ? "Updating..." : "Start Ride"}
                        </button>
                      )}

                      {status === "started" && (
                        <button
                          disabled={updatingRideId === ride.RideId}
                          onClick={() => updateRideStatus(ride.RideId, "Completed")}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          {updatingRideId === ride.RideId ? "Updating..." : "Complete Ride"}
                        </button>
                      )}

                 
                      {["pending"].includes(status) && (
                        <span className="text-sm text-gray-500">Pending assignment</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
