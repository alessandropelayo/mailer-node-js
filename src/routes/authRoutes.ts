import { Router } from 'express';
import { 
  register, 
  login, 
  refreshToken,
  logout
} from '../controllers/authController';
import { 
  authenticateToken, 
  refreshTokenMiddleware 
} from '../middleware/auth';
import { validateRegistration, validateLogin } from '../middleware/validation';


const router = Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshTokenMiddleware, refreshToken);
router.post('/logout', authenticateToken, logout);

export default router;