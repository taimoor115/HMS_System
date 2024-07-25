import express from "express";
import { MONGO_URL, PORT } from "./config.js";
import User from "./model/userModel.js";
import mongoose from "mongoose";
import { uploadStorage } from "./middleware/middleware.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { generateToken } from "./lib/utils/generateToken.js";
import "dotenv/config";
import Admin from "./model/adminModel.js";

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

app.post("/admin", async (req, res) => {
  try {
    const adminData = req.body;
    // console.log(adminData);

    const admin = new Admin(adminData);
    // const accessToken = generateToken(admin._id, res);
    // admin.access_token = accessToken;

    const savedAdmin = await admin.save();
    console.log(savedAdmin);
    return res.json({ message: "Admin Created successfully..." });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500).json({ error: "Server Error" });
  }
});

app.post(
  "/register",
  uploadStorage.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const userData = req.body;
      const imagePath = req.files.profile_picture[0].filename;
      const resumePath = req.files.resume[0].filename;
      userData.profile_picture = imagePath;
      userData.resume = resumePath;

      const user = new User(userData);
      // const accessToken = generateToken(user._id, res);
      // user.access_token = accessToken;
      const savedUser = await user.save();

      // console.log(savedUser);
      return res.json({ message: "User Created successfully..." });
    } catch (error) {
      console.log("User", error);
      return res.status(500).json({ error: "Error" });
    }
  }
);

app.listen(PORT, (req, res) => {
  console.log(`Server is working on port ${PORT}`);
});
