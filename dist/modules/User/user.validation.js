"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const createUserZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: "Name is required",
        }),
        email: zod_1.z
            .string({
            required_error: "Email is required",
        })
            .email(),
        password: zod_1.z.string({
            required_error: "Password is required",
        }),
        phoneNumber: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        dateOfBirth: zod_1.z.string().optional(),
        gender: zod_1.z.enum(["male", "female", "other"]).optional(),
        profileImage: zod_1.z.string().optional(),
        bio: zod_1.z.string().optional(),
    }),
});
const updateUserZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        password: zod_1.z.string().optional(),
        phoneNumber: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        dateOfBirth: zod_1.z.string().optional(),
        gender: zod_1.z.enum(["male", "female", "other"]).optional(),
        profileImage: zod_1.z.string().optional(),
        bio: zod_1.z.string().optional(),
    }),
});
exports.UserValidation = {
    createUserZodSchema,
    updateUserZodSchema,
};
