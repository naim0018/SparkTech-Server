import { z } from 'zod';

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email(),
    password: z.string({
      required_error: 'Password is required',
    }),
    needsPasswordChange: z.boolean().default(true),
    role: z.enum(['user', 'admin']).default('user'),
    status: z.enum(['active', 'blocked']).default('active'),
    isDeleted: z.boolean().default(false),
    passwordChangedAt: z.date().optional(),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    dateOfBirth: z.date().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    profileImage: z.string().optional(),
    bio: z.string().optional(),
    lastLoginAt: z.date().optional()
  }),
});

const updateUserZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
    needsPasswordChange: z.boolean().optional(),
    role: z.enum(['user', 'admin']).optional(),
    status: z.enum(['active', 'blocked']).optional(),
    isDeleted: z.boolean().optional(),
    passwordChangedAt: z.date().optional(),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    dateOfBirth: z.date().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    profileImage: z.string().optional(),
    bio: z.string().optional(),
    lastLoginAt: z.date().optional()
  }),
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
};
