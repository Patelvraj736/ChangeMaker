const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendDonationSMS(toPhone, donorName, amount, ngoName) {
    const message = `Hi ${donorName}, thank you for your donation of ₹${amount} to ${ngoName}. Receipt has been sent to your email. 🙏`;
  
    try {
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${toPhone}`, // Assuming India country code
      });
    } catch (err) {
      console.error("Failed to send SMS:", err.message);
    }
  }
  

module.exports = sendDonationSMS;
