import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    id: string; // user ID
    role: string; // user role
    level: number; // role level
  };
}
