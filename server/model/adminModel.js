import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
const adminSchema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    default: "admin",
  },
  access_token: {
    type: String,
  },
});

adminSchema.pre("save", async function (next) {
  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(err);
  }
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
