import mongoose, { Mongoose } from "mongoose";

const connectDb = async (MONGO_URI) => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn.connection.host;
  } catch (error) {
    console.error(`Error connecting to db: ${error}`);
    process.exit(1);
  }
};

export default connectDb;
