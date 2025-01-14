import { Request, Response, NextFunction } from "express";
import { RegisterRequestBody, LoginRequestBody } from "../types/auth.types";

export const validateRegistration = (
	req: Request<{}, {}, RegisterRequestBody>,
	res: Response,
	next: NextFunction
) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: "Email and password are required" });
	}

	// Email validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return res.status(400).json({ error: "Invalid email format" });
	}

	// Password validation
	if (password.length < 8) {
		return res.status(400).json({
			error: "Password must be at least 8 characters long",
		});
	}

	next();
};

export const validateLogin = (
	req: Request<{}, {}, LoginRequestBody>,
	res: Response,
	next: NextFunction
) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: "Email and password are required" });
	}

	next();
};
