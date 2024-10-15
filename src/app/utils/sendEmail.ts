import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com.',
    port: 587,
    secure: config.NODE_ENV === 'production',
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: 'mdkazinaim0018@gmail.com',
      pass: 'iikv knbg lewt sila',
    },
  });

  await transporter.sendMail({
    from: 'mdkazinaim0018@gmail.com', // sender address
    to, // list of receivers
    subject: 'Password Reset Instructions', // Subject line
    text: 'You have requested to reset your password. Please follow the instructions provided in the HTML section of this email to complete the process within the next 10 minutes.', // plain text body
    html: `<h2>Password Reset Instructions</h2>
           <p>You have requested to reset your password. Please follow the instructions provided in this email to complete the process within the next 10 minutes.</p>
           <a href="${html}">Click here to reset your password</a>
           <p>If you did not request a password reset, please ignore this email.</p>
           <p>Best regards,</p>
           <p>SparkTech</p>`, // html body
  });
};
