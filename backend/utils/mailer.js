const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const { Buffer } = require("buffer");
const sendDonationSMS = require("./sms"); // Import the SMS utility function

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to generate a clean and professional receipt PDF
async function generateReceiptPDF({ donor_name, email, amount, ngoName, razorpay_payment_id, phone }) {
  const doc = new PDFDocument({ margin: 50 });
  const buffers = [];

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {});

  // === Header ===
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor("#2E86C1")
    .text(ngoName, { align: "center" })
    .moveDown(0.5);

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor("#000")
    .text("Donation Receipt", { align: "center" })
    .moveDown();

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#555")
    .text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" })
    .moveDown();

  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

  // === Donor Info ===
  doc.moveDown(1);
  doc.font("Helvetica-Bold").fontSize(12).text("Donor Information", { underline: true });
  doc.moveDown(0.5);
  doc.font("Helvetica").fontSize(11);
  doc.text(`Name            : ${donor_name}`);
  doc.text(`Email           : ${email}`);
  doc.text(`Phone           : ${phone}`);

  // === Donation Info ===
  doc.moveDown(1);
  doc.font("Helvetica-Bold").fontSize(12).text("Donation Details", { underline: true });
  doc.moveDown(0.5);
  doc.font("Courier-Bold").fontSize(11); // Monospace for aligned numbers
  doc.text(`Donation Amount : ₹ ${amount}`);
  doc.text(`Payment ID      : ${razorpay_payment_id}`);

  // === Thank You Section ===
  doc.moveDown(2);
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#2E86C1")
    .text("Thank you for your generous support!", { align: "center" })
    .moveDown(0.5);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#444")
    .text("Your contribution makes a big difference in helping us serve our cause.", {
      align: "center",
    });

  // === Footer ===
  doc.moveDown(3);
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#888")
    .text("This is a system-generated receipt and does not require a signature.", {
      align: "center",
    });

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on("error", reject);
  });
}

async function sendDonationConfirmation(to, donor_name, amount, ngoName, razorpay_payment_id, phone = null) {
  const pdfBuffer = await generateReceiptPDF({
    donor_name,
    email: to,
    amount,
    ngoName,
    razorpay_payment_id,
    phone,
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Donation Receipt - Thank You!",
    text: `Dear ${donor_name},\n\nThank you for your kind donation of ₹${amount} to ${ngoName}.\nPlease find your receipt attached.\n\nWith gratitude,\nTeam ${ngoName}`,
    attachments: [
      {
        filename: "DonationReceipt.pdf",
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  await transporter.sendMail(mailOptions);

  // Send SMS if phone number is provided
  if (phone) {
    await sendDonationSMS(phone, donor_name, amount, ngoName);
  }
}

module.exports = sendDonationConfirmation;
