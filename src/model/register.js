import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt'

const userSchema = new Schema(
  {
    phone: {
      type: String,
      // required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      trim: true,
      // required: true,
    },

    email: {
      type: String,
      // required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      // required: true,
      trim: true,
    },
    cPassword: {
      type: String,
      // required: true,
      trim: true,
    },
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
