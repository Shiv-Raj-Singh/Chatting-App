import dotenv from 'dotenv';
dotenv.config()
import mongoose from 'mongoose';

console.log(process.env.MONGO_DB);
async function db(){
    mongoose.set('strictQuery', false);
    await mongoose.connect(`${process.env.MONGO_DB}`)
    console.log('DataBase Connected !');
}
db().catch((err)=>{console.log(err.message);})