import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({
      status: "error",
      message: "Authentication token required",
    });
    return;
  }

  if (!JWT_SECRET) {
    res.status(500).json({
      status: "error",
      message: "JWT configuration missing",
    });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded || typeof decoded === "string") {
      res.status(401).json({
        status: "error",
        message: "Invalid or expired token",
      });
      return;
    }

    req.user = {
      id: decoded.id as string,
    };

    next();
  });
};