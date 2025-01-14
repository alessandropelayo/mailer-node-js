import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userService } from "../models/userModel";

const generateTokens = (user: any) => {
	const accessToken = jwt.sign(
		{ userId: user.id, email: user.email, role: user.role },
		process.env.JWT_ACCESS_SECRET!,
		{ expiresIn: "15m" }
	);
	const refreshToken = jwt.sign(
		{ userId: user.id },
		process.env.JWT_REFRESH_SECRET!,
		{ expiresIn: "7d" }
	);
	return { accessToken, refreshToken };
};

export const register = async (req: any, res: any) => {
	try {
		const { email, password } = req.body;

		const existingUser = await userService.findUserByEmail(email);
		if (existingUser) {
			return res.status(400).json({ error: "Email already registered" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await userService.createUser({
			email,
			password: hashedPassword,
		});

		const { accessToken, refreshToken } = generateTokens(user);
		await userService.updateRefreshToken(user.id, refreshToken);

		const sanitizedUser = await userService.sanitizeUser(user);

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.status(201).json({
			user: sanitizedUser,
			accessToken,
		});
	} catch (error) {
		console.error("Registration error:", error);
		res.status(500).json({ error: "Error creating user" });
	}
};

export const login = async (req: any, res: any) => {
	try {
		const { email, password } = req.body;

		const user = await userService.findUserByEmail(email);
		if (!user) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const { accessToken, refreshToken } = generateTokens(user);
		await userService.updateRefreshToken(user.id, refreshToken);

		const sanitizedUser = await userService.sanitizeUser(user);

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.json({
			user: sanitizedUser,
			accessToken,
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "Error logging in" });
	}
};

export const logout = async (req: any, res: any) => {
	try {
		// Get user ID from authenticated request
		const userId = req.user?.userId;

		if (userId) {
			// Clear refresh token in database
			await userService.updateRefreshToken(userId, null);
		}

		// Clear refresh token cookie
		res.cookie("refreshToken", "", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			expires: new Date(0), // Expire immediately
		});

		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.error("Logout error:", error);
		res.status(500).json({ error: "Error during logout" });
	}
};

export const refreshToken = async (req: any, res: any) => {
	try {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return res.status(401).json({ error: "Refresh token required" });
		}

		const user = await userService.findUserByRefreshToken(refreshToken);
		if (!user) {
			return res.status(403).json({ error: "Invalid refresh token" });
		}

		try {
			jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
		} catch (error) {
			return res.status(403).json({ error: "Invalid refresh token" });
		}

		const tokens = generateTokens(user);
		await userService.updateRefreshToken(user.id, tokens.refreshToken);

		res.cookie("refreshToken", tokens.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.json({ accessToken: tokens.accessToken });
	} catch (error) {
		console.error("Token refresh error:", error);
		res.status(500).json({ error: "Error refreshing token" });
	}
};

export default {
	register,
	login,
	logout,
	refreshToken,
};
