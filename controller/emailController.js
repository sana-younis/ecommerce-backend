// const nodemailer = require("nodemailer");
// const asyncHandler = require("express-async-handler");

// const sendEmail = asyncHandler(async (data, req, res) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false, // true for port 465, false for other ports
//     auth: {
//       user: process.env.MAIL_ID,
//       pass: process.env.MP,
//     },
//   });

//   // async..await is not allowed in global scope, must use a wrapper
//   async function main() {
//     // send mail with defined transport object
//     const info = await transporter.sendMail({
//       from: '"Hey 👻" <abc@gmail.com>', // sender address
//       to: data.to,
//       subject: data.subject,
//       text: data.text,
//       html: data.htm,
//     });

//     console.log("Message sent: %s", info.messageId);
//     // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
//   }
// });

// module.exports = sendEmail;

const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data, req, res) => {
  try {
    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: process.env.MAIL_ID, // your Gmail address
        pass: process.env.MP, // your Gmail app password or regular password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Hey 👻" <abc@gmail.com>', // sender address
      to: data.to, // list of receivers
      subject: data.subject, // subject line
      text: data.text, // plain text body
      html: data.htm, // html body
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
});

module.exports = sendEmail;
