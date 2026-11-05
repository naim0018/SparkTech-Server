import { z } from "zod";

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Name is required",
    }),
    email: z
      .string({
        required_error: "Email is required",
      })
      .email(),
    password: z.string({
      required_error: "Password is required",
    }),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    profileImage: z.string().optional(),
    bio: z.string().optional(),
  }),
});

const updateUserZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    profileImage: z.string().optional(),
    bio: z.string().optional(),
  }),
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
};
