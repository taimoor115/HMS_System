import express from "express";
import { MONGO_URL, PORT } from "./config.js";
import User from "./model/userModel.js";
import mongoose from "mongoose";
import {
  isAdmin,
  isContentWriter,
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
  
  validateUser,
  uploadStorage.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  
  async (req, res) => {
    try {
      const userData = req.body;


      console.log(userData);
      
      const uniqueEmail = await User.findOne({email: userData.email})
      if(uniqueEmail) {
        return res.status(400).json({error: "Email must be unique"})
      }
      console.log(userData);
      const imagePath = req.files.profile_picture[0].filename;
      const resumePath = req.files.resume[0].filename;
      userData.profile_picture = imagePath;
      userData.resume = resumePath;

      const user = new User(userData);
      const savedUser = await user.save();

      return res.json({ message: "User Created successfully..." });
    } catch (error) {
      console.log("User", error);
      return res.status(500).json({ error: "Internal Server error" });
    }
  }
);

app.get("/users/getAllUser", isAdmin, async (req, res) => {
  try {
    const pageNo = Math.floor(req.query.page) || 0;
    const limit = Math.floor(req.query.limit) || 12;

    console.log(pageNo, limit);

    if (pageNo < 0 || limit <= 0) {
      return res.status(400).json({ error: "Invalid page number and limit" });
    }

    const totalDocuments = await User.find({}).countDocuments();
    console.log(totalDocuments);

    let skip = pageNo * limit;

    const users = await User.find({}).skip(skip).limit(limit);
    const totalPage = Math.ceil(totalDocuments / limit);

    if (!users || totalDocuments === 0) {
      return res.status(400).json({ message: "Users not found" });
    }
    return res.status(201).json({ totalPage, data: users });
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
    console.log(req.body);

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

    return res
      .status(200)
      .json({ message: "Login Successfull...", access_token: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
});


app.put("/users/:id/edit", isContentWriter, uploadStorage.fields([
  { name: "profile_picture", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]), async (req,res) => {

  
  try {
    const {id} = req.params;
    const updatedData = req.body;

    const forbiddenFields = ['email','password'];
    for(const field of forbiddenFields) {
      if(updatedData[field]) {
        return res.status(400).json({error: `You cannot modify ${field} field`})
      }
    }


    const currentUser = await User.findById(id);
    if(!currentUser) {
      return res.status(404).json({error: "User not found"})
    }

    if (req.files) {
      if (req.files.profile_picture && req.files.profile_picture[0]) {
        const newProfilePic = req.files.profile_picture[0].filename;
        if (currentUser.profile_picture !== newProfilePic) {
          updatedData.profile_picture = newProfilePic; 
        }
      }
      if (req.files.resume && req.files.resume[0]) {
        const newResume = req.files.resume[0].filename;
        if (currentUser.resume !== newResume) {
          updatedData.resume = newResume;
        }
      }
    }

    const user = await User.findByIdAndUpdate(id, updatedData, {
      runValidator:true,
      new:true,
    });

    const writerId = req.user._id;
    if(user) {
      await User.findByIdAndUpdate(id, {
        $push: {
          history: {
            updatedBy: writerId,
            updatedAt: new Date(),
            beforeChange: currentUser,
            afterChange: user
          }
        }
      })
    }

    return res.status(201).json({message:"User updated successfully"})

  } catch (error) {
    console.log(error);
    
    res.status(500).json({error: error})
  }
  
})



// app.get("/users/:id/changes", async (req,res) => {
//   try {
//     const {id} = req.params;
//     const user = await User.findById(id)
//   .select({ history: { $slice: -1 } }) // Retrieve only the last element of the history array
//   .exec()

//      // Extract the last history entry
//      const lastHistoryEntry = user.history[0];

//      // Populate the beforeChange field to get all its fields
//    const users =   await User.populate(lastHistoryEntry, {
//        path: 'beforeChange' // Populate all fields of the referenced document
//      });  
  
//   console.log("User", users);
    
    

//     res.send("working...")
    
//   } catch (error) {
//     console.log(error);
    
//   }
// })



app.delete("/users/:id", isAdmin, async (req,res) => {
    try {
      const {id} = req.params;

      const user = await User.findByIdAndDelete(id);
      if(!user) {
        return res.status(400).json({error: "User not found..."});
      }

      return res.status(200).json({message: "User deleted successfully"})
    } catch (error) {
      console.log(error);
      res.status(500).json({error: error})
    }
})


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
