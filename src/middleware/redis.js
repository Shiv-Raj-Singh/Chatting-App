import Redis from "ioredis"
import dotenv from 'dotenv';
dotenv.config()

const redis = new Redis({
    host: process.env.HOST,
    port: 12571,
    password: process.env.PASSWORD
});

export default redis