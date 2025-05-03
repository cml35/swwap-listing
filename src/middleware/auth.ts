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
    console.log('Auth middleware - Headers:', req.headers);
    const authHeader = req.header('Authorization');
    console.log('Auth middleware - Authorization header:', authHeader);
    
    const token = authHeader?.replace('Bearer ', '');
    console.log('Auth middleware - Extracted token:', token ? 'Token exists' : 'No token');

    if (!token) {
      console.log('Auth middleware - No token provided');
      throw new Error('No token provided');
    }

    console.log('Auth middleware - JWT_SECRET:', process.env.JWT_SECRET);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: string;
        iat: number;
        exp: number;
      };
      console.log('Auth middleware - Decoded token:', decoded);
      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('Auth middleware - JWT verification error:', jwtError);
      throw jwtError;
    }
  } catch (error) {
    console.error('Auth middleware - Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(401).json({ 
      error: 'Please authenticate.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 