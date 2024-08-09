
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import { MONGO_URL, PORT } from "./config.js";
import userRouter from "./routes/users.routes.js";
import ExpressError from "./utils/ExpressError.js";
import adminRouter from "./routes/admin.routes.js"
// import slotRouter from "./routes/slot.routes.js"

const app = express();

main()
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Server Working...");
});



app.use("/users", userRouter);
app.use("/admin", adminRouter);

// app.use("/slots", slotRouter);

app.all((req, res, next) => {
  next(new ExpressError("404", "Page not found"));
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).json({ error: message });
});

app.listen(PORT, (req, res) => {
  console.log(`Server is working on port ${PORT}`);
});


