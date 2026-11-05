import { Request } from "express";
import httpStatus from "http-status";
import { TLoginUser } from "./auth.interface";
import AppError from "../../app/error/AppError";
import { UserSchema } from "../User/user.model";
import { createToken, verifyToken } from "./auth.utils";
import { JwtPayload } from "jsonwebtoken";
import config from "../../app/config";
import { sendEmail } from "../../app/utils/sendEmail";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getTenantModel } from "../../app/utils/getTenantModel";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const loginUser = async (req: Request, payload: TLoginUser) => {
  const UserModel = getTenantModel(req, 'User', UserSchema);
  // checking if the user is exist
  const user = await (UserModel as any).isUserExistsByCustomId(payload.email);

  if (!user || user == null) {
    throw new AppError(httpStatus.NOT_FOUND, "This user is not found!");
  }
  // checking if the user is already deleted

  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
  }

  // checking if the user is blocked

  const userStatus = user?.status;

  if (userStatus === "blocked") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked ! !");
  }

  //checking if the password is correct

  if (!(await (UserModel as any).isPasswordMatched(payload?.password, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, "Password do not matched");

  //create token and sent to the  client

  const jwtPayload = {
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needsPasswordChange: user?.needsPasswordChange,
  };
};

const changePassword = async (
  req: Request,
  userData: JwtPayload,
  payload: { currentPassword: string; newPassword: string }
) => {
  const UserModel = getTenantModel(req, 'User', UserSchema);
  // checking if the user is exist
  const user = await (UserModel as any).isUserExistsByCustomId(userData.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
  }
  // checking if the user is already deleted

  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
  }

  // checking if the user is blocked

  const userStatus = user?.status;

  if (userStatus === "blocked") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked ! !");
  }

  //checking if the password is correct

  if (!(await (UserModel as any).isPasswordMatched(payload.currentPassword, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, "Password do not matched");

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await UserModel.findOneAndUpdate(
    {
      email: userData.email,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    }
  );

  return null;
};

const refreshToken = async (req: Request, token: string) => {
  const UserModel = getTenantModel(req, 'User', UserSchema);
  // checking if the given token is valid
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);

  const { email, iat } = decoded;

  // checking if the user is exist
  const user = await (UserModel as any).isUserExistsByCustomId(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === "blocked") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked ! !");
  }

  if (
    user.passwordChangedAt &&
    (UserModel as any).isJWTIssuedBeforePasswordChanged(
      user.passwordChangedAt,
      iat as number
    )
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized !");
  }

  const jwtPayload = {
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return {
    accessToken,
  };
};

const forgetPassword = async (req: Request, userId: string) => {
  const UserModel = getTenantModel(req, 'User', UserSchema);
  // checking if the user is exist
  const user = await (UserModel as any).isUserExistsByCustomId(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === "blocked") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked ! !");
  }

  const jwtPayload = {
    email: user.email,
    role: user.role,
    purpose: "RESET_PASSWORD",
  };

  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    "10m"
  );

  const resetUILink = `${config.reset_pass_ui_link}?id=${user.id}&token=${resetToken} `;
  sendEmail(user.email, resetUILink);
};

const resetPassword = async (
  req: Request,
  payload: { email: string; newPassword: string },
  token: string
) => {
  const UserModel = getTenantModel(req, 'User', UserSchema);
  // checking if the user is exist
  const user = await (UserModel as any).isUserExistsByCustomId(payload?.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === "blocked") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked ! !");
  }

  const decoded = jwt.verify(
    token,
    config.jwt_access_secret as string
  ) as JwtPayload & { purpose?: string };

  if (decoded.purpose !== "RESET_PASSWORD") {
    throw new AppError(httpStatus.FORBIDDEN, "Invalid token: not authorized for password reset!");
  }

  if (payload.email !== decoded.email) {
    throw new AppError(httpStatus.FORBIDDEN, "You are forbidden!");
  }

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await UserModel.findOneAndUpdate(
    {
      email: decoded.email,
      role: decoded.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    }
  );
};

const googleLogin = async (req: Request, payload: { idToken: string }) => {
  const UserModel = getTenantModel(req, 'User', UserSchema);

  // 1. Verify ID Token from Google
  let googlePayload;
  try {
    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${payload.idToken}`
    );
    googlePayload = response.data;
  } catch (error: any) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Google ID token!");
  }

  // Verify client ID (aud)
  const expectedClientId = config.google?.clientId;
  if (googlePayload.aud !== expectedClientId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Token client ID mismatch!");
  }

  const email = googlePayload.email;
  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email not provided by Google!");
  }

  // 2. Check if user exists
  let user = await (UserModel as any).isUserExistsByCustomId(email);

  if (user) {
    if (user.isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, "This user is deleted!");
    }
    if (user.status === "blocked") {
      throw new AppError(httpStatus.FORBIDDEN, "This user is blocked!");
    }
  } else {
    // Register new user
    const randomPassword = uuidv4();
    const newUser = {
      name: googlePayload.name || email.split("@")[0],
      email: email,
      password: randomPassword,
      needsPasswordChange: false,
      role: "user",
      status: "active",
      isDeleted: false,
      profileImage: googlePayload.picture || "",
    };

    user = await UserModel.create(newUser);
  }

  // 3. Create tokens
  const jwtPayload = {
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needsPasswordChange: user.needsPasswordChange,
  };
};

export const AuthServices = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
  googleLogin,
};

