import mongoose, { Schema } from "mongoose";

import bcrypt from "bcrypt";

const userSchema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: [true, "Email should be unique"],
    lowerCase: true,
  },
  profile_picture: {
    type: String,
  },
  about_me: {
    type: String,
  },
  password: {
    type: String,
    min: [8, "Password must be greater than 8 characters"],
  },
  education: [
    {
      degree: {
        type: String,
      },
      end_date: {
        type: Date,
      },
    },
  ],
  resume: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Prefer not to say"],
  },
  city: {
    type: String,
  },
  skills: [String],
  role: {
    type: String,
  },
  social_media: [
    {
      name: {
        type: String,
      },
      url: {
        type: String,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  date_of_birth: {
    type: Date,
  },
  cell_phone: {
    type: Number,
  },
  expectedSalary: {
    type: Number,
  },
  interview_availability: {
    type: Date,
  },
  notice_period: {
    type: Number,
  },
  experience: [
    {
      duration: {
        type: Number,
      },
      designation: {
        type: String,
      },
      company: {
        type: String,
      },
      salary: {
        type: Number,
      },
      company_linkedin: {
        type: String,
      },
    },
  ],
});

userSchema.pre("save", async function (next) {
  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

const User = mongoose.model("User", userSchema);
export default User;
