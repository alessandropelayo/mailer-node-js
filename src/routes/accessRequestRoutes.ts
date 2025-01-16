import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { requestAccessLevel } from "../controllers/accessController";

const router = Router();

// Route for users to request access
router.post("/request", authenticateToken, requestAccessLevel);

export default router;
