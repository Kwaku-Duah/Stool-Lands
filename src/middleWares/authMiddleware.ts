import { Request as ExpressRequest, NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../secrets';
import { UnauthorizedException } from '../exceptions/unAuthorised';
import { ErrorCode } from '../exceptions/rootException';
import db from '../dbConfig/db';

export interface User {
  id: number;
  role: string;
}

export interface Request extends ExpressRequest {
  user?: User;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication token not provided' });
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET!) as { userId: number };
      const user = await db.user.findFirst({ where: { id: payload.userId } });

      if (!user) {
        throw new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED);
      }

      req.user = {
        id: user.id,
        role: user.role
      };
      next();
    } catch (error) {
      next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user as User;

    if (role === 'ADMIN') {
      next();
    } else {
      return res.status(403).json({ error: 'Insufficient privileges' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const applicantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user as User;

    if (role === 'APPLICANT') {
      next();
    } else {
      return res.status(403).json({ error: 'Insufficient privileges' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const secretaryMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user as User;

    if (role === 'SECRETARY') {
      next();
    } else {
      return res.status(403).json({ error: 'Insufficient privileges' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};



export const roleMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user as User;

    if (role === 'ADMIN' || role === 'SECRETARY') {
      next();
    } else {
      return res.status(403).json({ error: 'Insufficient Privileges' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const inspectorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user as User;

    if (role === 'INSPECTOR') {
      next();
    } else {
      return res.status(403).json({ error: 'Insufficient privileges' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const permitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.user as User;

    if (role === 'ADMIN' || role === 'SECRETARY' || role === 'INSPECTOR') {
      next();
    } else {
      return res.status(403).json({ error: 'Insufficient Privileges' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

