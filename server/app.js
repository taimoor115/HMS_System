import express from "express";
import { MONGO_URL, PORT } from "./config.js";
import User from "./model/userModel.js";
import mongoose from "mongoose";
import { uploadStorage } from "./middleware/index.js";

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

app.get("/", (req, res) => {
  res.send("Server Working...");
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

      console.log(req.files.profile_picture.filename);

      const imagePath = req.files.profile_picture[0].filename;
      const resumePath = req.files.resume[0].filename;
      userData.profile_picture = imagePath;
      userData.resume = resumePath;

      const user = new User(userData);

      const savedUser = await user.save();

      console.log(savedUser);
      return res.status(201).json({ message: "User Created successfully..." });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Error" });
    }
  }
);

app.listen(PORT, (req, res) => {
  console.log(`Server is working on port ${PORT}`);
});
