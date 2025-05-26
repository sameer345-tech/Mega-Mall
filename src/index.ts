import app from "./app.js";
import dbConnection from "./db-connection/db.js";
import dotenv from "dotenv";
dotenv.config();
const port = process.env.PORT || 5000;

dbConnection()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error: unknown) => {
    if (error instanceof Error) {
      console.log(error.message || "Something went wrong during DB connection");
    }
  });
