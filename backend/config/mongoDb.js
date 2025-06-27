import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/USER`);
    console.log("Connected to MongoDB");

    mongoose.connection.on("connected", () => console.log("connected"));
  } catch (err) {
    console.log(err.message);
  }
};

export default connectDB;
