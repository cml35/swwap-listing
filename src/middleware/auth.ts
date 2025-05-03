import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    iat: number;
    exp: number;
  };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Backend - Auth middleware - Checking authorization header');
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log('Backend - Auth middleware - No authorization header');
      return res.status(401).json({ error: 'Please authenticate.', details: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Backend - Auth middleware - Token exists:', !!token);

    if (!token) {
      console.log('Backend - Auth middleware - No token in authorization header');
      return res.status(401).json({ error: 'Please authenticate.', details: 'Invalid token format' });
    }

    try {
      console.log('Backend - Auth middleware - Verifying token');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
        userId: string;
        iat: number;
        exp: number;
      };
      console.log('Backend - Auth middleware - Token verified, user ID:', decoded.userId);
      req.user = decoded;
      next();
    } catch (error) {
      console.log('Backend - Auth middleware - Token verification failed:', error);
      return res.status(401).json({ error: 'Please authenticate.', details: 'Invalid token' });
    }
  } catch (error) {
    console.error('Backend - Auth middleware - Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 