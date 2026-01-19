import express from "express";
import cors from "cors";
import sql from "mssql";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import rideRoutes from "./routes/rideRoutes.js";
import dbConfig from "./config/dbConfig.js";


const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/rides", rideRoutes);



app.get("/api/testDB", async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query("SELECT TOP 1 * FROM Users");
        res.json(result.recordset);
    } catch (error) {
        console.error("Database connection failed:", error);
        res.status(500).json({ error: "Database connection failed" });
    }
});

app.listen(5000, () => {
    console.log("Server is running on http://localhost:5000");
});
