import nodemailer from 'nodemailer';
import { join } from 'path';

export const sendEmailFunction = async (to, subject, text, attachmentFileName = null) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: 'akashgupta.webdev@gmail.com',
      pass: 'iipd ycvn jmpo mefu',
    },
  });

  // Define base mail options
  const mailOptions = {
    from: 'akashgupta.webdev@gmail.com',
    to: to,
    html: text,
    subject: subject,
    // text: text,
  };

  // If there's a PDF file to attach
  if (attachmentFileName) {
    const filePath = join(process.cwd(), 'utils', 'upload', attachmentFileName);
    console.log("email with file =>", filePath)
    mailOptions.attachments = [
      {
        filename: attachmentFileName,
        path: filePath,
        contentType: 'application/pdf'
      }
    ];
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return "Email sent successfully!";
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email.");
  }
};
