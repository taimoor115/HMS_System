import twilio from 'twilio';
import ExpressError from './ExpressError.js';

const accountSId = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = twilio(accountSId, authToken, {
    lazyLoading: true
});



export const sendOTP = async (phoneNo) => { 


    try {
      const otpResponse = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications.create({
       to:phoneNo,
       channel: "sms"
      })
    
    console.log("Successfull...")

      return JSON.stringify(otpResponse);
    } catch (error) {
        console.log(error);
    }
}

export const verifyOTP = async(phoneNo,otp, next) => {
    try {
        const verifyResponse =await client.verify.v2
        .services(process.env.TWILIO_SERVICE_SID)
        .verificationChecks.create({
          code: otp,
          to: phoneNo,
        })
        return JSON.stringify(verifyResponse);
    } catch (error) {
        next(new ExpressError(400, "OTP expires"))
        console.log("VerifyOTP", error);
    }
}



