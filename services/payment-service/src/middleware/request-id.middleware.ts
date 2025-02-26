import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  req.id = req.headers['x-request-id'] as string || uuidv4();
  next();
};
