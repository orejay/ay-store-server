import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import getRoutes from "./routes/get.js";
import postRoutes from "./routes/post.js";
import authRoutes from "./routes/auth.js";
import editRoutes from "./routes/edit.js";

/* Configurations */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* Routes */
app.use("/api/v1/get", getRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/edit", editRoutes);
app.use("/api/v1/auth", authRoutes);

/* Initialization */
const PORT = process.env.PORT || 5050;

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () => console.log(`app is listening on port ${PORT}`))
  )
  .catch((error) => console.log(`${error} did not connect`));
