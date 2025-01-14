import { Role } from '@prisma/client';
import { Request } from 'express';

export interface UserPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
  cookies: {
    refreshToken?: string;
  };
  headers: {
    authorization?: string;
  } & Request['headers'];
}

export interface RegisterRequestBody {
  email: string;
  password: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface RefreshTokenRequestBody {
  refreshToken: string;
}

export { Role };
