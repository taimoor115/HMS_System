import nodemailer from "nodemailer"


export const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.email",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  
export const sendMail = async (transporter,email,text, subject) => {
    try {

        console.log("Hey",process.env.PASSWORD);
        
      await transporter.sendMail({
        from: {
        name: "Softmind Solution",
        address: process.env.EMAIL,
    },
        to: email,
        subject,
        text
 

      });
      console.log("email send successfull");
    } catch (error) {
      console.log(error);
    }
};
