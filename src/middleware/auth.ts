import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role, UserPayload, AuthRequest } from "../types/auth.types";
import { userService } from "../models/userModel";

export const authenticateToken = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const authHeader = req.headers.authorization;
		const token = authHeader?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "Access token required" });
		}

		const decoded = jwt.verify(
			token,
			process.env.JWT_ACCESS_SECRET!
		) as UserPayload;

		// Verify user still exists and has proper permissions
		const user = await userService.findUserById(decoded.userId);
		if (!user) {
			return res.status(403).json({ error: "User no longer exists" });
		}

		req.user = decoded;
		next();
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			return res.status(401).json({ error: "Token has expired" });
		}
		return res.status(403).json({ error: "Invalid token" });
	}
};

export const authorizeRoles = (...roles: Role[]) => {
	return (req: AuthRequest, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({ error: "Authentication required" });
		}

		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				error: "You do not have permission to perform this action",
			});
		}
		next();
	};
};

export const refreshTokenMiddleware = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	const refreshToken = req.cookies.refreshToken;

	if (!refreshToken) {
		return res.status(401).json({ error: "Refresh token required" });
	}

	try {
		const decoded = jwt.verify(
			refreshToken,
			process.env.JWT_REFRESH_SECRET!
		) as UserPayload;
		req.user = decoded;
		next();
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			return res.status(401).json({ error: "Refresh token has expired" });
		}
		return res.status(403).json({ error: "Invalid refresh token" });
	}
};
