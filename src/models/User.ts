import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'etudiant' | 'administrateur' | 'examinateur';
export type UserDocument = mongoose.Document & {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  token?: string;
  tokenExpires?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
};



const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['etudiant', 'admin', 'examinateur'],
    required: true,
  },
  token: {
    type: String,
    default: '',
  },
  tokenExpires: {
    type: Date,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password avant la sauvegarde
UserSchema.pre('save', async function (this: UserDocument, next: (err?: Error) => void) {
  if (!this.isModified('password')) return next();

  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Méthode pour comparer les mots de passe
UserSchema.methods.comparePassword = async function(this: UserDocument, candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
