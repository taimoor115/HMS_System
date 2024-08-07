import Admin from "../models/admin.models.js";
import { generateToken } from "../utils/generateToken.js";
import bcrypt from "bcrypt"

export const registerAdmin = async (req, res) => {
  
      const adminData = req.body;
  
      const admin = new Admin(adminData);
  
      const adminPerson = await Admin.findOne({ email: adminData.email });
  
      if (adminPerson) {
        throw new ExpressError("400", "Email is alreay taken");
      }
  
      const savedAdmin = await admin.save();
      console.log(savedAdmin);
      return res.json({ message: "Admin Created successfully..." });
   
  }


export const loginAdmin = async (req, res) => {
 
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
  
      return res
        .status(200)
        .json({ message: "Login Successfull...", access_token: token });
    } 

export const deleteAdmin = async (req,res) => {
      const {id} = req.params;
  
      const admin = await Admin.findByIdAndDelete(id);
      if(!admin) {
        return res.status(400).json({error: "Admin not found..."});
      }
  
      return res.status(200).json({message: "Admin deleted successfully"})
    
  }    