// twilio-sms.js
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID ;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID ;

const client = twilio(accountSid, authToken);

export const sendPaymentSMS = async (to, amount) => {
  try {
    const message = await client.messages.create({
      body: `Hi! Your payment of ₹${amount} has been deducted from your bank account.`,
      messagingServiceSid, // Your Messaging Service SID
      to,
    });
    // console.log("SMS sent successfully:", message.sid);
    return message;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};

export default sendPaymentSMS;
