import sql from "mssql";
import dbConfig from "../config/dbConfig.js";


export const createRide = async (req, res) => {
  const { UserId, Pickup, Destination, Fare, RideStatus = "Pending" } = req.body;

  if (!UserId || !Pickup || !Destination || !Fare) {
    return res.status(400).json({ error: "UserId, Pickup, Destination, Fare are required" });
  }

  try {
    const pool = await sql.connect(dbConfig);

  
    const userCheck = await pool.request()
      .input("UserId", sql.Int, UserId)
      .query("SELECT UserId FROM Users WHERE UserId = @UserId");

    if (userCheck.recordset.length === 0)
      return res.status(404).json({ error: "User not found" });

   
    const result = await pool.request()
      .input("UserId", sql.Int, UserId)
      .input("Pickup", sql.NVarChar, Pickup)
      .input("Destination", sql.NVarChar, Destination)
      .input("Fare", sql.Decimal(10, 2), Fare)
      .input("RideStatus", sql.NVarChar, RideStatus)
      .query(`
        INSERT INTO Ride (UserId, Pickup, Destination, Fare, RideStatus)
        OUTPUT INSERTED.RideId AS RideId
        VALUES (@UserId, @Pickup, @Destination, @Fare, @RideStatus)
      `);

    const RideId = result.recordset[0].RideId;

    res.status(201).json({
      message: "Ride created successfully",
      RideId,
    });

  } catch (err) {
    console.error("❌ Error creating ride:", err);
    res.status(500).json({ error: "Ride creation failed" });
  }
};



export const getAllRides = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        R.RideId AS RideId,
        R.Pickup,
        R.Destination,
        R.Fare,
        R.RideStatus AS RideStatus,
        U.FullName AS UserName,
        DU.FullName AS DriverName
      FROM Ride R
      JOIN Users U ON R.UserId = U.UserId
      LEFT JOIN Drivers D ON R.DriverId = D.DriverId
      LEFT JOIN Users DU ON D.UserId = DU.UserId
      ORDER BY R.CreatedAt DESC
    `);

    res.status(200).json(result.recordset);

  } catch (err) {
    console.error("❌ Error fetching rides:", err);
    res.status(500).json({ error: "Error fetching rides" });
  }
};



export const getRidesByUser = async (req, res) => {
  const { UserId } = req.params;

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input("UserId", sql.Int, UserId)
      .query(`
        SELECT 
          R.RideId AS RideId,
          R.Pickup,
          R.Destination,
          R.Fare,
          R.RideStatus AS RideStatus,
          DU.FullName AS DriverName
        FROM Ride R
        LEFT JOIN Drivers D ON R.DriverId = D.DriverId
        LEFT JOIN Users DU ON D.UserId = DU.UserId
        WHERE R.UserId = @UserId
        ORDER BY R.CreatedAt DESC
      `);

    res.status(200).json(result.recordset);

  } catch (err) {
    console.error("❌ Error fetching rides by user:", err);
    res.status(500).json({ error: "Error fetching user rides" });
  }
};


export const getRidesByDriver = async (req, res) => {
  const { DriverId } = req.params;

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input("DriverId", sql.Int, DriverId)
      .query(`
        SELECT 
          R.RideId AS RideId,
          R.Pickup,
          R.Destination,
          R.Fare,
          R.RideStatus AS RideStatus,
          U.FullName AS UserName
        FROM Ride R
        JOIN Users U ON R.UserId = U.UserId
        WHERE R.DriverId = @DriverId
        ORDER BY R.CreatedAt DESC
      `);

    res.status(200).json(result.recordset);

  } catch (err) {
    console.error("❌ Error fetching driver rides:", err);
    res.status(500).json({ error: "Error fetching driver rides" });
  }
};



export const getUnassignedRides = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request().query(`
      SELECT 
        R.RideId AS RideId,
        R.Pickup,
        R.Destination,
        R.Fare,
        R.RideStatus AS RideStatus,
        U.FullName AS UserName
      FROM Ride R
      JOIN Users U ON R.UserId = U.UserId
      WHERE R.DriverId IS NULL AND R.RideStatus = 'Pending'
      ORDER BY R.CreatedAt ASC
    `);

    res.status(200).json(result.recordset);

  } catch (err) {
    console.error("❌ Error fetching unassigned rides:", err);
    res.status(500).json({ error: "Could not fetch unassigned rides" });
  }
};



export const acceptRide = async (req, res) => {
  const { RideId } = req.params;
  const { DriverId } = req.body;

  if (!DriverId) return res.status(400).json({ error: "DriverId required" });

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input("RideId", sql.Int, RideId)
      .input("DriverId", sql.Int, DriverId)
      .query(`
        UPDATE Ride
        SET DriverId = @DriverId, RideStatus = 'Accepted'
        WHERE RideId = @RideId AND DriverId IS NULL AND RideStatus = 'Pending';

        SELECT @@ROWCOUNT AS RowsAffected;
      `);

    if (result.recordset[0].RowsAffected === 0) {
      return res.status(400).json({ error: "Ride already taken by another driver" });
    }

    
    await pool.request()
      .input("DriverId", sql.Int, DriverId)
      .query(`UPDATE Drivers SET IsAvailable = 0 WHERE DriverId = @DriverId`);

    res.status(200).json({ message: "Ride accepted successfully" });

  } catch (err) {
    console.error("❌ Error accepting ride:", err);
    res.status(500).json({ error: "Could not accept ride" });
  }
};



export const updateRideStatus = async (req, res) => {
  const { RideId } = req.params;
  let { RideStatus } = req.body;

  if (!RideStatus)
    return res.status(400).json({ error: "RideStatus is required" });

  
  RideStatus =
    RideStatus.charAt(0).toUpperCase() + RideStatus.slice(1).toLowerCase();

  
  const allowed = ["Pending", "Accepted", "Started", "Completed", "Cancelled"];

  if (!allowed.includes(RideStatus)) {
    return res.status(400).json({
      error: `Invalid RideStatus. Allowed: ${allowed.join(", ")}`,
    });
  }

  try {
    const pool = await sql.connect(dbConfig);

    
    const ride = await pool
      .request()
      .input("RideId", sql.Int, RideId)
      .query("SELECT DriverId FROM Ride WHERE RideId = @RideId");

    if (ride.recordset.length === 0)
      return res.status(404).json({ error: "Ride not found" });

    const DriverId = ride.recordset[0].DriverId;

    
    await pool
      .request()
      .input("RideId", sql.Int, RideId)
      .input("RideStatus", sql.NVarChar, RideStatus)
      .query("UPDATE Ride SET RideStatus = @RideStatus WHERE RideId = @RideId");

    
    if (
      DriverId &&
      ["Completed", "Cancelled"].includes(RideStatus)
    ) {
      await pool.request()
        .input("DriverId", sql.Int, DriverId)
        .query("UPDATE Drivers SET IsAvailable = 1 WHERE DriverId = @DriverId");
    }

    res.status(200).json({ message: "Ride status updated successfully" });

  } catch (err) {
    console.error("❌ Error updating ride status:", err);
    res.status(500).json({ error: "Failed to update ride status" });
  }
};

export const getRideById = async (req, res) => {
  const { rideId } = req.params;

  try {
    const pool = await sql.connect(dbConfig);

    
    const rideResult = await pool.request()
      .input("RideId", sql.Int, rideId)
      .query("SELECT * FROM Ride WHERE RideId = @RideId");

    if (rideResult.recordset.length === 0) {
      return res.status(404).json({ error: "Ride not found" });
    }

    const ride = rideResult.recordset[0];

    let driver = null;

    
    if (ride.DriverId) {
      
      const driverResult = await pool.request()
        .input("DriverId", sql.Int, ride.DriverId)
        .query("SELECT * FROM Drivers WHERE DriverId = @DriverId");

      if (driverResult.recordset.length > 0) {
        const driverRow = driverResult.recordset[0];

        
        const userResult = await pool.request()
          .input("UserId", sql.Int, driverRow.UserId)
          .query("SELECT UserId, FullName, MobileNo FROM Users WHERE UserId = @UserId");

        const userRow =
          userResult.recordset.length > 0 ? userResult.recordset[0] : null;

        driver = {
          DriverId: driverRow.DriverId,
          CarModel: driverRow.CarModel,
          LicenseNo: driverRow.LicenseNo,
          User: userRow
            ? {
                UserId: userRow.UserId,
                FullName: userRow.FullName,
                MobileNo: userRow.MobileNo,
              }
            : null,
        };
      }
    }

    
    return res.status(200).json({
      Ride: {
        RideId: ride.RideId,
        UserId: ride.UserId,
        DriverId: ride.DriverId,
        Pickup: ride.Pickup,
        Destination: ride.Destination,
        Fare: ride.Fare,
        RideStatus: ride.RideStatus,
        CreatedAt: ride.CreatedAt,
        DriverDetails: driver, 
      },
    });

  } catch (err) {
    console.error("Error fetching ride:", err);
    return res.status(500).json({ error: "Error fetching ride" });
  }
};
