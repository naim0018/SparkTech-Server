"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("./user.model");
const getTenantModel_1 = require("../../app/utils/getTenantModel");
const createUser = (req, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const UserModel = (0, getTenantModel_1.getTenantModel)(req, 'User', user_model_1.UserSchema);
    const result = yield UserModel.create(userData);
    return result;
});
const getAllUsers = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const UserModel = (0, getTenantModel_1.getTenantModel)(req, 'User', user_model_1.UserSchema);
    const result = yield UserModel.find({ isDeleted: { $ne: true } });
    return result;
});
const getUserById = (req, id) => __awaiter(void 0, void 0, void 0, function* () {
    const UserModel = (0, getTenantModel_1.getTenantModel)(req, 'User', user_model_1.UserSchema);
    const result = yield UserModel.findOne({ _id: id, isDeleted: { $ne: true } });
    return result;
});
const getUserByEmail = (req, email) => __awaiter(void 0, void 0, void 0, function* () {
    const UserModel = (0, getTenantModel_1.getTenantModel)(req, 'User', user_model_1.UserSchema);
    const result = yield UserModel.findOne({ email, isDeleted: { $ne: true } });
    return result;
});
const updateUser = (req, id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const UserModel = (0, getTenantModel_1.getTenantModel)(req, 'User', user_model_1.UserSchema);
    const result = yield UserModel.findOneAndUpdate({ _id: id, isDeleted: { $ne: true } }, updateData, { new: true });
    return result;
});
const deleteUser = (req, id) => __awaiter(void 0, void 0, void 0, function* () {
    const UserModel = (0, getTenantModel_1.getTenantModel)(req, 'User', user_model_1.UserSchema);
    const result = yield UserModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    return result;
});
const checkUserStatus = (req, id) => __awaiter(void 0, void 0, void 0, function* () {
    const UserModel = (0, getTenantModel_1.getTenantModel)(req, 'User', user_model_1.UserSchema);
    const user = yield UserModel.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!user) {
        throw new Error('User not found');
    }
    return user.status === 'active';
});
exports.UserService = {
    createUser,
    getAllUsers,
    getUserById,
    getUserByEmail,
    updateUser,
    deleteUser,
    checkUserStatus,
};
