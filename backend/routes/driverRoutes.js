import express from "express";
import { registerDriver, getAllDrivers, getAvailableDrivers, updateDriverAvailability, loginDriver} from "../controllers/driverController.js"; 

const router = express.Router();

router.post("/register", registerDriver);
router.get("/all", getAllDrivers);
router.get("/available", getAvailableDrivers);
router.put("/availability", updateDriverAvailability);
router.post("/login", loginDriver);

export default router;
