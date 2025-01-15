import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { Role, AccessLevel } from "@prisma/client";
import { userService } from "../models/userModel";
import { AuthRequest } from "../types/auth.types";

const router = Router();

// Admin route to update user access level
router.patch(
	"/users/:userId/access-level",
	authenticateToken,
	authorizeRoles(Role.ADMIN),
	async (req: AuthRequest, res) => {
		try {
			const { userId } = req.params;
			const { accessLevel } = req.body;

			// Validate access level
			if (!Object.values(AccessLevel).includes(accessLevel)) {
				return res.status(400).json({
					error: "Invalid access level",
					validLevels: Object.values(AccessLevel),
				});
			}

			const targetUser = await userService.findUserById(userId);
			if (!targetUser) {
				return res.status(404).json({ error: "User not found" });
			}

			const updatedUser = await userService.updateUserAccess(
				userId,
				accessLevel
			);
			const sanitizedUser = await userService.sanitizeUser(updatedUser);

			res.json({
				message: "Access level updated successfully",
				user: sanitizedUser,
			});
		} catch (error) {
			console.error("Error updating access level:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

// Get all users with their access levels
router.get(
	"/users",
	authenticateToken,
	authorizeRoles(Role.ADMIN),
	async (req: AuthRequest, res) => {
		try {
			const users = await userService.getAllUsers();
			res.json(users);
		} catch (error) {
			console.error("Error fetching users:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
);

export default router;
