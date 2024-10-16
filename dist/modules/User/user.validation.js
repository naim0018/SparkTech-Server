"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const createUserZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: 'Name is required',
        }),
        email: zod_1.z
            .string({
            required_error: 'Email is required',
        })
            .email(),
        password: zod_1.z.string({
            required_error: 'Password is required',
        }),
        needsPasswordChange: zod_1.z.boolean().default(true),
        role: zod_1.z.enum(['user', 'admin']).default('user'),
        status: zod_1.z.enum(['active', 'blocked']).default('active'),
    }),
});
const updateUserZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        password: zod_1.z.string().optional(),
        needsPasswordChange: zod_1.z.boolean().optional(),
        role: zod_1.z.enum(['user', 'admin']).optional(),
        status: zod_1.z.enum(['active', 'blocked']).optional(),
    }),
});
exports.UserValidation = {
    createUserZodSchema,
    updateUserZodSchema,
};
