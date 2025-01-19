import { accessRequestService } from "../models/accessRequestService";
import { userService } from "../models/userModel";
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

export const checkAccessAndRole = async (req: AuthRequest, res) => {
	try {
		const userId = req.user?.userId;
		const userEmail = req.user?.email;

		if (!userId || !userEmail) {
			return res.status(401).json({ error: "Authentication required" });
		}

		const result = await userService.findUserById(req.user.userId);

		if (!result) {
			res.status(500).json({ error: "User could not be found" });
		}

		const sanitizedUser = await userService.sanitizeUser(result);

		res.status(201).json(sanitizedUser);
	} catch (error) {
		console.error("Error processing access request:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getAccessRequestUser = async (req: AuthRequest, res) => {
	try {
		const userId = req.user?.userId;

		if (!userId) {
			return res.status(401).json({ error: "Authentication required" });
		}

		// Get user's access requests
		const accessRequests = await accessRequestService.getUserRequests(userId);

		res.status(201).json(accessRequests);
	} catch (error) {
		console.error("Error processing access request:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const cancelRequestUser = async (req: AuthRequest, res) => {
	try {
		const userId = req.user?.userId;
		const { id } = req.body;

		if (!userId) {
			return res.status(401).json({ error: "Authentication required" });
		}

		// Get access request
		const accessRequest = await accessRequestService.getRequest(id);

		if (!accessRequest) {
			return res.status(500).json({ error: "Request not found" });
		}

		if (userId !== accessRequest.userId) {
			return res.status(401).json({ error: "Unauthorized access to request" });
		}

		if("PENDING" !== accessRequest.status) {
			return res.status(401).json({ error: "Unauthorized permission to modify" });
		}

		await accessRequestService.deleteRequest(id);

		res.status(201).json({ status: "Success" });
	} catch (error) {
		console.error("Error processing access request:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
