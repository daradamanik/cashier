import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'cashier';

export const checkRole = (allowedRoles: string[]) => {
  return (req: any, res: any, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(403).json({ message: 'Access denied. No token provided.' });
    }
    try {
      const decoded = jwt.verify(token, SECRET_KEY) as { role: string };
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      }
      next();
    } catch (error) {
      return res.status(400).json({ message: 'Invalid token.' });
    }
  };
};
