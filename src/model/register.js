import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt'

const AVATAR_COLORS = [
  '#7c3aed', '#06b6d4', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#8b5cf6',
];

const userSchema = new Schema(
  {
    phone: { type: String, unique: true, sparse: true, trim: true },
    name: { type: String, trim: true },
    email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'male', trim: true },
    password: { type: String, trim: true },
    cPassword: { type: String, trim: true },
    avatarColor: {
      type: String,
      default: () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);


userSchema.pre('save' ,async function (next){
  if(this.isModified('password')){
      this.password = await bcrypt.hash(this.password , 10)
      this.cPassword = await bcrypt.hash(this.cPassword , 10)
      console.log(this.password , this.cPassword)
      next()
  } 
})

const userModel = new model("Chatting-User", userSchema);
export default userModel;
