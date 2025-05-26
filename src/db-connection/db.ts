import mongoose from "mongoose";

const dbConnection = async (): Promise<void> => {
  try {
    const dbConnection = await mongoose.connect(`${process.env.MONGO_URI!}/${process.env.MONGO_NAME!}`);
    console.log(`Connected to MongoDB: ${dbConnection.connection.host}`);
  } catch (error: unknown) {
    if(error instanceof Error){
      console.log(error.message);
    }
  }
};

export default dbConnection;
