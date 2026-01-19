import sql from "mssql";
import dbConfig from "../config/dbConfig.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerDriver = async (req, res) => {
    const {FullName, Email, MobileNo, LicenseNo, CarModel, password} = req.body;
    try {
        if(!FullName || !Email || !MobileNo || !LicenseNo || !CarModel) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const UserPassword = await bcrypt.hash(password, 10);
        const pool = await sql.connect(dbConfig);
        const existingUser = await pool.request()
            .input("Email", sql.NVarChar, Email)
            .query("SELECT * FROM Users WHERE Email = @Email");
        if (existingUser.recordset.length > 0) {
            return res.status(409).json({ error: "Email already in use" });
        }
        const insertUser = await pool.request()
            .input("FullName", sql.NVarChar, FullName)
            .input("Email", sql.NVarChar, Email)
            .input("MobileNo", sql.NVarChar, MobileNo)  
            .input("UserPassword", sql.NVarChar, UserPassword)
            .input("PersonRole", sql.NVarChar, "driver")
            .query("INSERT INTO Users (FullName, Email, MobileNo, UserPassword, PersonRole)  OUTPUT INSERTED.UserId VALUES (@FullName, @Email, @MobileNo, @UserPassword, @PersonRole)");
        const userId = insertUser.recordset[0].UserId;
        await pool.request()
            .input("UserId", sql.Int, userId)
            .input("LicenseNo", sql.NVarChar, LicenseNo)
            .input("CarModel", sql.NVarChar, CarModel)
            .query("INSERT INTO Drivers (UserId, LicenseNo, CarModel) VALUES (@UserId, @LicenseNo, @CarModel)");
        res.status(201).json({ message: "Driver registered successfully" });
    } catch (error) {
        console.error("Driver registration failed:", error);
        res.status(500).json({ error: "Driver registration failed" });
    }
};

export const getAllDrivers = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query(`SELECT d.DriverId as DriverId, u.FullName, u.Email, u.MobileNo, d.LicenseNo, d.CarModel, d.isAvailable
                from Drivers d
                JOIN Users u ON d.UserId = u.UserId`);
        res.status(200).json(result.recordset);
    }   catch (error) {
        console.error("Error fetching drivers:", error);
        res.status(500).json({ error: "Error fetching drivers" });
    }
};

export const getAvailableDrivers = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query(`SELECT d.DriverId as DriverId, u.FullName, d.CarModel, d.LicenseNo
                from Drivers d
                JOIN Users u ON d.UserId = u.UserId
                WHERE d.isAvailable = 1`);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Error fetching available drivers:", error);
        res.status(500).json({ error: "Error fetching available drivers" });
    }           
};

export const updateDriverAvailability = async (req, res) => {
    const {DriverId, isAvailable} = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input("DriverId", sql.Int, DriverId)
            .input("isAvailable", sql.Bit, isAvailable)
            .query("UPDATE Drivers SET isAvailable = @isAvailable WHERE DriverId = @DriverId");
        res.status(200).json({ message: "Driver availability updated successfully" });
    } catch (error) {
        console.error("Error updating driver availability:", error);
        res.status(500).json({ error: "Error updating driver availability" });
    }
};

export const loginDriver = async (req, res) => {
  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password) {
    return res.status(400).json({ error: "Email/Phone and password are required" });
  }

  try {
    const pool = await sql.connect(dbConfig);

    let userQuery;

   
    const isEmail = emailOrPhone.includes("@");

    if (isEmail) {
      userQuery = await pool
        .request()
        .input("Email", sql.NVarChar, emailOrPhone)
        .query("SELECT * FROM Users WHERE Email = @Email");
    } else {
      userQuery = await pool
        .request()
        .input("MobileNo", sql.NVarChar, emailOrPhone)
        .query("SELECT * FROM Users WHERE MobileNo = @MobileNo");
    }

    
    if (userQuery.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userQuery.recordset[0];

    
    const isPasswordValid = await bcrypt.compare(password, user.UserPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }


    const driverResult = await pool.request()
      .input("UserId", sql.Int, user.UserId)
      .query("SELECT DriverId FROM Drivers WHERE UserId = @UserId");

    const driverId = driverResult.recordset.length > 0
      ? driverResult.recordset[0].DriverId
      : null;

    
    const token = jwt.sign(
      { id: user.Id, email: user.Email, mobile: user.MobileNo },
      "XYYZZA",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        Id: driverId, 
        FullName: user.FullName,
        Email: user.Email,
        MobileNo: user.MobileNo,
      },
    });

  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: "Login failed" });
  }
};
