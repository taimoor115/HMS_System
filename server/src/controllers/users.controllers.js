import User from "../models/user.models.js";
import ExpressError from "../utils/ExpressError.js";
import { sendMail, transporter } from "../utils/sender.js";

export const registerUser = async (req, res, next) => {
    const userData = req.body;
    console.log(userData)

    const selectedDate = new Date(userData.interview);
    const now = new Date();


    if(selectedDate <= now) {
        return next(new ExpressError(400, "Please selected future date"))
    }

    if(selectedDate.getHours() < 10 || selectedDate.getHours() >= 19) {
        return next(new ExpressError(400, "The interview must be in between 10am to 7pm"))
    }

    const uniqueEmail = await User.findOne({email: userData.email})
    if(uniqueEmail) {
      return res.status(400).json({error: "Email must be unique"})
    }


    const users = await User.find({});
    
    for (const user of users) {
        const existingDate = new Date(user.interview)
        // console.log(existingDate.getTime());
        // console.log(selectedDate.getTime());
        if(existingDate.getTime() === selectedDate.getTime()) {
            return res.status(400).json({error: "This time slot is not available"})
        }
    }
    
    const imagePath = req.files.profile_picture[0].filename;
    const resumePath = req.files.resume[0].filename;
    userData.profile_picture = imagePath;
    userData.resume = resumePath;

    const user = new User(userData);
    await user.save();
    console.log("Eamil ",userData.email);
    
    const interviewDateFormatted = selectedDate.toLocaleString(); // or use moment.js for custom formatting
    const emailSubject = "Softmind Solution Received Your Resume";
    const html = `
    Hello Candidate,
    <p>
    Thank you for applying with us.
    </p>

    <p>
    Your interview has been scheduled on ${interviewDateFormatted}. Please make sure to be available at this time.
    </p>
    <p>
    <b>

    Best Regards,

    <p>
    Softmind Solution
    </p>
    </b></p>`;

    // Send the email
    await sendMail(transporter, userData.email, emailSubject, html);

    return res.json({ message: "User Created successfully..." });
  
}

export const getAllUsers = async (req, res) => {
  
    const pageNo = Math.floor(req.query.page) || 0;
    const limit = Math.floor(req.query.limit) || 12;

    if (pageNo < 0 || limit <= 0) {
      return res.status(400).json({ error: "Invalid page number and limit" });
    }

    const totalDocuments = await User.find({}).countDocuments();


    let skip = pageNo * limit;

    const users = await User.find({}).skip(skip).limit(limit);
    const totalPage = Math.ceil(totalDocuments / limit);

    if (!users || totalDocuments === 0) {
      return res.status(400).json({ message: "Users not found" });
    }
    return res.status(201).json({ totalPage, data: users });
  
}
export const editUser = async (req, res) => {
    
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

  
}



export const userHistory = async(req, res) => {
      const {id} = req.params;
  
      const user = await User.findById(id)
      .populate("history.changedFields")
      console.log("User", user.history[0].changedFields);
  
      const length = user.history.length - 1;
      const history = user.history[length].changedFields;
      return res.status(200).json({history})
}


export const deleteUser = async (req,res) => {
   
      const {id} = req.params;

      const user = await User.findByIdAndDelete(id);
      if(!user) {
        return res.status(400).json({error: "User not found..."});
      }

      return res.status(200).json({message: "User deleted successfully"})
    
}