import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { checkAccessLevel } from '../middleware/accessControl';
import { 
  getPackage, 
  getRecentPackagesHomePage, 
  getPackagePhoto 
} from '../controllers/packageController';
import { AccessLevel } from '../types/auth.types';

const router = Router();

// Basic access for viewing individual packages
router.get('/packages',
  authenticateToken,
  checkAccessLevel(AccessLevel.BASIC),
  getPackage
);

// Basic access for viewing recent packages
router.get('/packages/home',
  authenticateToken,
  checkAccessLevel(AccessLevel.BASIC),
  getRecentPackagesHomePage
);

// Basic access for viewing package photos
router.get('/packages/file/get',
  authenticateToken,
  checkAccessLevel(AccessLevel.BASIC),
  getPackagePhoto
);

export default router;
