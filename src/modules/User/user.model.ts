import { Schema, model } from 'mongoose';
import { TUser, TUserModel } from './user.interface';
import bcrypt from 'bcrypt';
import config from '../../app/config';
import { USER_ROLE, USER_STATUS } from './user.constant';

const userSchema = new Schema<TUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    needsPasswordChange: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'] as const,
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'blocked'] as const,
      default: 'active',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: {
      type: Date,
    },
    phoneNumber: {
      type: String,
    },
    address: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    profileImage: {
      type: String,
    },
    bio: {
      type: String,
    },
    lastLoginAt: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this as TUser;
  // hashing password and save into DB
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

userSchema.post('save', function (doc: TUser, next) {
  doc.password = '';
  next();
});

userSchema.statics.isUserExistsByCustomId = async function (email: string) {
  return await UserModel.findOne({ email }).select('+password');
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number,
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

userSchema.statics.checkUserStatus = async function (id: string) {
  const user = await UserModel.findById(id);
  return user?.status === USER_STATUS.ACTIVE;
};

export const UserModel = model<TUser, TUserModel>('User', userSchema);
