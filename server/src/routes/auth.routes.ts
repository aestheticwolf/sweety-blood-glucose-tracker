import { Router } from "express";
import { pool } from "../database/connection.js";
import { hashPassword, comparePassword } from "../auth/auth.js";
import jwt from "jsonwebtoken";
import { authenticateToken, type AuthRequest } from "../auth/middleware.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name.trim(), email.trim().toLowerCase(), passwordHash]
    );

    const user = result.rows[0];

    if (!JWT_SECRET) {
      return res.status(500).json({
        message: "JWT configuration is missing.",
      });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Something went wrong while registering.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const result = await pool.query(
      `SELECT id, name, email, password_hash
       FROM users
       WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    const isPasswordValid = await comparePassword(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!JWT_SECRET) {
      return res.status(500).json({
        message: "JWT configuration is missing.",
      });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Something went wrong while logging in.",
    });
  }
});

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    const result = await pool.query(
      `SELECT id, name, email, created_at
       FROM users
       WHERE id = $1`,
      [authReq.user?.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Something went wrong while retrieving user.",
    });
  }
});

export default router;