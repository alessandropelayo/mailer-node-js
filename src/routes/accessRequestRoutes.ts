import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
	checkAccessAndRole,
	getAccessRequestUser,
	requestAccessLevel,
} from "../controllers/accessController";

const router = Router();

// Route for users to request access
router.post("/request", authenticateToken, requestAccessLevel);
router.get("/my-level", authenticateToken, checkAccessAndRole);
router.get("/my-requests", authenticateToken, getAccessRequestUser);

export default router;
