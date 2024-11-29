import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (err) {
    console.log("database connection error: ", err);
    process.exit(1);
  }
};

export default connectDB;
