export interface User {
  id: string;
  email: string;
  password: string;
  role: string;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Token {
  id: string;
  token: string;
  type: string;
  userId: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
