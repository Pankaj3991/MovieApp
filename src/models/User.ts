import { Schema, model, models, Document } from 'mongoose';

// 1️⃣ Define an interface for the User document
export interface IUser extends Document {
  name: string;
  email: string;
  password_hash: string;
  role: 'user' | 'admin'; // restrict role to known values
  created_at: Date;
}

// 2️⃣ Define the Schema
const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// 3️⃣ Export the model (prevent recompilation issues in Next.js)
const User = models.User || model<IUser>('User', UserSchema);
export default User;
