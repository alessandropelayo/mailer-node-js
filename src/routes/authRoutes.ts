import { Router } from 'express';
import { 
  register, 
  login, 
  refreshToken,
  logout
} from '../controllers/authController';
import { 
  authenticateToken, 
  authorizeRoles,
  refreshTokenMiddleware 
} from '../middleware/auth';
import { Role } from '../types/auth.types';
import { validateRegistration, validateLogin } from '../middleware/validation';
import { userService } from '../models/userModel';

const router = Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshTokenMiddleware, refreshToken);
router.post('/logout', authenticateToken, logout);


// router.get(
//   '/admin/users',
//   authenticateToken,
//   authorizeRoles(Role.ADMIN),
//   async (req, res) => {
//     const users = await userService.getAllUsers();
//     res.json(users);
//   }
// );

// Export the router directly
export default router;