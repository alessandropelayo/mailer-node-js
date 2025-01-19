import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
	cancelRequestUser,
	checkAccessAndRole,
	getAccessRequestUser,
	requestAccessLevel,
} from "../controllers/accessController";

const router = Router();

// Route for users to request access
router.post("/request", authenticateToken, requestAccessLevel);
router.patch("/request/cancel", authenticateToken, cancelRequestUser);
router.get("/my-level", authenticateToken, checkAccessAndRole);
router.get("/my-requests", authenticateToken, getAccessRequestUser);

export default router;
