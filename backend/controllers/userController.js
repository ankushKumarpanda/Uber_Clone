import sql from "mssql";
import dbConfig from "../config/dbConfig.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    const {FullName, Email, MobileNo, password} = req.body;
    try {
        const UserPassword = await bcrypt.hash(password, 10);
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input("FullName", sql.NVarChar, FullName)
            .input("Email", sql.NVarChar, Email)
            .input("MobileNo", sql.NVarChar, MobileNo)
            .input("UserPassword", sql.NVarChar, UserPassword)
            .query("INSERT INTO Users (FullName, Email, MobileNo, UserPassword) VALUES (@FullName, @Email, @MobileNo, @UserPassword)");
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration failed:", error);
        res.status(500).json({ error: "Registration failed" });
    }
};

export const loginUser = async (req, res) => {
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

   
    const token = jwt.sign(
      { id: user.Id, email: user.Email, mobile: user.MobileNo },
      "XYYZZA",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        Id: user.UserId,
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