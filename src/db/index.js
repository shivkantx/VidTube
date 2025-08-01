import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGOOSE_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDb connected! Db Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDb Connection eroor ", error);
    process.exit(1);
  }
};

export default connectDB;
