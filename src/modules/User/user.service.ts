import { Request } from "express";
import { TUser } from "./user.interface";
import { UserModel, UserSchema } from "./user.model";
import { getTenantModel } from "../../app/utils/getTenantModel";

const createUser = async (req: Request, userData: TUser): Promise<TUser> => {
  const UserModel = getTenantModel(req, 'User', UserSchema);
  const result = await UserModel.create(userData);
  return result;
};

const getAllUsers = async (req: Request): Promise<TUser[]> => {
  const UserModel = getTenantModel(req, 'User', UserSchema);
  const result = await UserModel.find({ isDeleted: { $ne: true } });
  return result;
};

const getUserById = async (req: Request, id: string): Promise<TUser | null> => {
  const UserModel = getTenantModel(req, 'User', UserSchema);
  const result = await UserModel.findOne({ _id: id, isDeleted: { $ne: true } });
  return result;
};

const getUserByEmail = async (req: Request, email: string): Promise<TUser | null> => {
  const UserModel = getTenantModel(req, 'User', UserSchema);
  const result = await UserModel.findOne({ email, isDeleted: { $ne: true } });
  return result;
};

const updateUser = async (req: Request, id: string, updateData: Partial<TUser>): Promise<TUser | null> => {
  const UserModel = getTenantModel(req, 'User', UserSchema);
  const result = await UserModel.findOneAndUpdate(
    { _id: id, isDeleted: { $ne: true } },
    updateData,
    { new: true }
  );
  return result;
};

const deleteUser = async (req: Request, id: string): Promise<TUser | null> => {
  const UserModel = getTenantModel(req, 'User', UserSchema);
  const result = await UserModel.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  return result;
};

const checkUserStatus = async (req: Request, id: string): Promise<boolean> => {
  const UserModel = getTenantModel(req, 'User', UserSchema);
  const user = await UserModel.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!user) {
    throw new Error('User not found');
  }
  return user.status === 'active';
};

export const UserService = {
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  checkUserStatus,
};

