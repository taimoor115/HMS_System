import twilio from 'twilio';

const accountSId = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = twilio(accountSId, authToken);



export const sendSms = async (body) => { 
    let msgOption = {
        from: process.env.TWILIO_PHONE_NO,
        to: process.env.TWILIO_SENDER_PHONE_NO,
        body
    }

    try {
        const message = await client.create(msgOption);
        console.log(message);
        
    } catch (error) {
        console.log(error);
        
    }
}