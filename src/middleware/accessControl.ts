import { Response, NextFunction } from 'express';
import { AccessLevel, AuthRequest } from '../types/auth.types';
import { userService } from '../models/userModel';

export const checkAccessLevel = (requiredLevel: AccessLevel) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await userService.findUserById(req.user.userId);
      
      if (!user) {
        return res.status(403).json({ error: 'User not found' });
      }

      const accessLevels = {
        'NO_ACCESS': 0,
        'BASIC': 1,
        'ADVANCED': 2,
        'FULL_ACCESS': 3
      };

      const userAccessLevel = accessLevels[user.accessLevel] || 0;
      const requiredAccessLevel = accessLevels[requiredLevel] || 0;

      if (userAccessLevel < requiredAccessLevel) {
        return res.status(403).json({ 
          error: 'Insufficient access level',
          required: requiredLevel,
          current: user.accessLevel
        });
      }

      next();
    } catch (error) {
      console.error('Access level check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};