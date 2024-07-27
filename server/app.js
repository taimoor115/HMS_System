import express from "express";
import { MONGO_URL, PORT } from "./config.js";
import User from "./model/userModel.js";
import mongoose from "mongoose";
import {
  isAdmin,
  uploadStorage,
  validateAdmin,
  validateLogin,
  validateUser,
} from "./middleware/middleware.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { generateToken } from "./lib/utils/generateToken.js";
import "dotenv/config";
import Admin from "./model/adminModel.js";
import ExpressError from "./lib/utils/ExpressError.js";
import bcrypt from "bcrypt";

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

app.post(
  "/users/register",

  uploadStorage.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),

  validateUser,
  async (req, res) => {
    try {
      const userData = req.body;
      const imagePath = req.files.profile_picture[0].filename;
      const resumePath = req.files.resume[0].filename;
      userData.profile_picture = imagePath;
      userData.resume = resumePath;

      const user = new User(userData);
      const savedUser = await user.save();

      return res.json({ message: "User Created successfully..." });
    } catch (error) {
      console.log("User", error);
      return res.status(500).json({ error: "Error" });
    }
  }
);

app.get("/users/getAllUser", isAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    if (!users) {
      return res.status(400).json({ message: "Users not found" });
    }
    return res.status(201).json({ count: users.length, users: users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
});

app.post("/admin/register", validateAdmin, async (req, res) => {
  try {
    const adminData = req.body;

    const admin = new Admin(adminData);

    const adminPerson = await Admin.findOne({ email: adminData.email });

    if (adminPerson) {
      throw new ExpressError("400", "Email is alreay taken");
    }

    const savedAdmin = await admin.save();
    console.log(savedAdmin);
    return res.json({ message: "Admin Created successfully..." });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

app.post("/admin/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ error: "Invalid email and password" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email and password" });
    }

    const token = generateToken(admin, res);

    await Admin.findOneAndUpdate(
      { _id: admin._id },
      { access_token: token },
      { runValidator: true, new: true }
    );

    console.log("Token Admin", token);

    return res.status(200).json({ message: "Login Successfull..." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
});

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
