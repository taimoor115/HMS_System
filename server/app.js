
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
import cookieSession from "cookie-session";
import passport from "passport"
import { Strategy as GoogleStrategy, Strategy } from 'passport-google-oauth20';
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

app.use(cookieSession({
  name: "googleSession",
  keys:"softmind",
  maxAge: 24*60*60*100
}))







passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    scope:['profile', 'email']
    },
function (accessToken, refreshToken, profile, callback) {
    callback(null, profile);
}

))


// SerializeUser

// Purpose: This function determines which data should be stored in the session. It is called when a user is authenticated and their information needs to be saved to the session.
// Parameters:
// user: The user object that you want to serialize. This usually contains information about the user.
// done: A callback function that should be called once the serialization is complete. It takes two arguments:
// err: An error object if there was an error during serialization (or null if no error).
// id: The identifier for the user to be stored in the session (often, this could be the user's unique ID or a specific identifier).
passport.serializeUser((user, done) => {
	done(null, user);
});

// deserializeUser
// Purpose: This function is responsible for retrieving the full user object from the session data. It is called on every subsequent request to reconstruct the user object from the session.

// Parameters:

// id: The identifier that was stored in the session during serializeUser.
// done: A callback function that should be called once the deserialization is complete. It takes two arguments:
// err: An error object if there was an error during deserialization (or null if no error).
// user: The user object that has been fetched from the database or another source based on the identifier.

passport.deserializeUser((user, done) => {
	done(null, user);
});






app.use(passport.initialize());
app.use(passport.session());


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


app.patch("/users/:id/edit", isContentWriter, uploadStorage.fields([
  { name: "profile_picture", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const allowedFields = ['about_me', 'city'];
    const invalidFields = Object.keys(updatedData).filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      return res.status(400).json({ message: "You can only modify about_me, city fields" });
    }
    const currentUser = await User.findById(id);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const changedFields = {};

    allowedFields.forEach(field => {
      if (updatedData[field] !== undefined && currentUser[field] !== updatedData[field]) {
        changedFields[field] = {
          oldValue: currentUser[field],
          newValue: updatedData[field]
        };
      }
    });
    if (Object.keys(changedFields).length === 0) {
      return res.status(200).json({ message: "No changes detected" });
    }

    
    const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true
    });

    
    const writerId = req.user._id;
    await User.findByIdAndUpdate(id, {
      $push: {
        history: {
          updatedBy: writerId,
          updatedAt: new Date(),
          changedFields
        }
      }
    });

    return res.status(200).json({ message: "User updated successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});


app.get("/users/:id/history", isAdmin, async(req, res) => {
  try {
    const {id} = req.params;

    const user = await User.findById(id)
    .populate("history.changedFields")
    console.log("User", user.history[0].changedFields);

    const length = user.history.length - 1;
    const history = user.history[length].changedFields;
    return res.status(200).json({history})
  } catch (error) {
    console.log(error);
    return res.status(500).json({error})
  }
})



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

app.delete("/users/:id", isAdmin, async (req,res) => {
  try {
    const {id} = req.params;

    const user = await Admin.findByIdAndDelete(id);
    if(!user) {
      return res.status(400).json({error: "Admin not found..."});
    }

    return res.status(200).json({message: "Admin deleted successfully"})
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
