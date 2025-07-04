// require("dotenv").config();
const nodemailer = require("nodemailer");

interface MailContent {
  recipients: string[];
  subject: string;
  message: any;
}

// have tried every combination with and without tls.rejectUnauthorized, have tried with OAuth2 clientI and client secret, have tried every port
let transporter = nodemailer.createTransport({
  host: "smtp.rutgers.edu",
  port: 25, //  25 587 465
  secure: false, // false unless port is 465
  auth: {
    user: process.env.MAIL_SEND,
    pass: process.env.MAIL_SECRET,
  },
  logger: true,
});

// verify connection configuration
// transporter.verify(function (error: any, success:any) {
//   if (error) {
//     console.error(error);
//   } else {
//     console.log("Server is ready to take our mail messages");
//     console.log(success);
//   }
// });


export const sendEmail = (mailContent: MailContent) => {
 // ** split recipients into chunks of 48 to avoid error
  if (mailContent.recipients.length > 48) {
    let chunk = 48;
    let splittedArrays = mailContent.recipients.reduce<string[][]>((result, item, index) => {
      if (index % chunk === 0) {
        result.push(mailContent.recipients.slice(index, index + chunk));
      }
      return result;
    }, []);

    // Display Output
    splittedArrays.forEach((subArray) => {
      let mailOptions = {
        from: process.env.MAIL_USER,
        to: process.env.MAIL_USER,
        bcc: subArray,
        subject: mailContent.subject,
        html: mailContent.message + new Date(),
      };

      transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
          return console.error(error);
        }
        // console.log("Message sent: %s", info.messageId);
        return info
      });
    });
  }
  // ** if there is more than one recipient, bcc to respect privacy and cc the default account
  else if (mailContent.recipients.length < 1) {
    let mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.MAIL_USER,
      bcc: mailContent.recipients,
      subject: mailContent.subject,
      html: mailContent.message,
    };

    transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) {
        return console.error(error);
      }
      // console.log("Message sent: %s", info.messageId);
      return info
    });
  } 
  // ** if there is only one recipient, don't cc the default account to reduce email fatigue.
  else {
    let mailOptions = {
      from: process.env.MAIL_USER,
      to: mailContent.recipients,
      subject: mailContent.subject,
      html: mailContent.message,
    };

    transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) {
        return console.error(error);
      }
      // console.log("Message sent: %s", info.messageId);
      return info
    })

  };
}

