import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  prenom: string;
  nom: string;
  email: string;
  dateNaissance: Date;
  numeroEtudiant: string;
  role: string;
  consentementRGPD: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  prenom: { type: String, required: true },
  nom: { type: String, required: true },
  email: { type: String, required: true },
  dateNaissance: { type: Date, required: true },
  numeroEtudiant: { type: String, required: true },
  role: { type: String, required: true },
  consentementRGPD: { type: Boolean, default: false },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
});

export default mongoose.model<IUser>('User', UserSchema);
