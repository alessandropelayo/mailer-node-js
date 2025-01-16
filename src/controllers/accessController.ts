import { accessRequestService } from "../models/accessRequestService";
import { AccessLevel, AuthRequest } from "../types/auth.types";

export const requestAccessLevel = async (req: AuthRequest, res) => {
	try {
		const userId = req.user?.userId;
		const userEmail = req.user?.email;
		const { requestedLevel } = req.body;

		if (!userId || !userEmail) {
			return res.status(401).json({ error: "Authentication required" });
		}

		// Validate requested level
		if (!Object.values(AccessLevel).includes(requestedLevel)) {
			return res.status(400).json({
				error: "Invalid access level request",
				validLevels: Object.values(AccessLevel),
			});
		}

		const result = await accessRequestService.handleUserRequest(
			userId,
			userEmail,
			requestedLevel
		);

		res.status(201).json(result);
	} catch (error) {
		console.error("Error processing access request:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
