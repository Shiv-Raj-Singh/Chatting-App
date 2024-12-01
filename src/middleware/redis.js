import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

let redis;
try {
  redis = new Redis({
    host: process.env.HOST,
    port: 12571,
    password: process.env.PASSWORD,
  });
} catch (error) {
  console.error("Error connecting to Redis:", error);
  throw new Error("Error connecting to Redis:", error);
}
export default redis;
