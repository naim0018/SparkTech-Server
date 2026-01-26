import { TUser } from "./user.interface";
import { UserModel } from "./user.model";

const createUser = async (userData: TUser, storeId: string): Promise<TUser> => {
  const result = await UserModel.create({ ...userData, storeId });
  return result;
};

const getAllUsers = async (storeId: string): Promise<TUser[]> => {
  const result = await UserModel.find({ storeId, isDeleted: { $ne: true } });
  return result;
};

const getUserById = async (id: string, storeId: string): Promise<TUser | null> => {
  const result = await UserModel.findOne({ _id: id, storeId, isDeleted: { $ne: true } });
  return result;
};

const getUserByEmail = async (email: string, storeId: string): Promise<TUser | null> => {
  const result = await UserModel.findOne({ email, storeId, isDeleted: { $ne: true } });
  return result;
};

const updateUser = async (id: string, updateData: Partial<TUser>): Promise<TUser | null> => {
  const result = await UserModel.findOneAndUpdate(
    { _id: id, isDeleted: { $ne: true } },
    updateData,
    { new: true }
  );
  return result;
};

const deleteUser = async (id: string): Promise<TUser | null> => {
  const result = await UserModel.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  return result;
};

const checkUserStatus = async (id: string): Promise<boolean> => {
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
