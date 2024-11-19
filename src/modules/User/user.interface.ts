import { Model } from "mongoose";
import { USER_ROLE, USER_STATUS } from "./user.constant";

export interface TUser {
  id: string;
  name: string;
  email: string;
  password: string;
  needsPasswordChange: boolean;
  role: 'user' | 'admin';
  isDeleted: boolean;
  status: 'active' | 'blocked';
  passwordChangedAt?: Date;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  profileImage?: string;
  bio?: string;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TUserModel extends Model<TUser> {
  isUserExistsByCustomId(id: string): Promise<TUser | null>;
  isPasswordMatched(plainTextPassword: string, hashedPassword: string): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(passwordChangedAt: Date, iat: number): boolean;
  checkUserStatus(id: string): Promise<boolean>;
}

export type TUserRole = keyof typeof USER_ROLE;
export type TUserStatus = keyof typeof USER_STATUS;
