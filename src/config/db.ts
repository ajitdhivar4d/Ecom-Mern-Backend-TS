import { connect } from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "";
  try {
    await connect(mongoUri);
    console.log("Successfully  Connected to MongoDB");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error connecting to MongoDB: ${error.message}`);
    } else {
      console.error("An unknown error occurred");
    }
    process.exit(1);
  }
};

export default connectDB;
