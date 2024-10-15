import { z } from 'zod';

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Email is required and must be a valid email address.' }),
    password: z.string({ message: 'Password is required' }),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    currentPassword: z.string({ required_error: 'Current password is required' }),
    newPassword: z.string({ message: 'New password is required' }),
    confirmNewPassword: z.string({ message: 'Confirm new password is required' }),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({ message: 'Refresh token is required!' }),
  }),
});

const forgetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Email is required and must be a valid email address.' }),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    password: z.string({ message: 'Password is required' }),
    confirmPassword: z.string({ message: 'Confirm password is required' }),
  }),
});

export const AuthValidation = {
  loginValidationSchema,
  changePasswordValidationSchema,
  refreshTokenValidationSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema,
};
