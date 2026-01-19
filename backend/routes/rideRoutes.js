import express from "express";
import { createRide, getAllRides, getRidesByUser, getRidesByDriver, updateRideStatus, getUnassignedRides, acceptRide, getRideById } from "../controllers/rideController.js";

const router = express.Router();

router.post("/create", createRide);
router.get("/all", getAllRides);
router.get("/user/:UserId", getRidesByUser);
router.get("/driver/:DriverId", getRidesByDriver);
router.put("/update/:RideId", updateRideStatus);
router.get("/unassigned", getUnassignedRides); 
router.post("/:RideId/accept", acceptRide); 
router.get("/:rideId", getRideById); 
export default router;