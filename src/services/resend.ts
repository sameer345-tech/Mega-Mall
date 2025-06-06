import dotenv from "dotenv";
dotenv.config();
import { Resend } from "resend";
 export const resend = new Resend(process.env.RESEND_API_KEY! as string ?? ""  );
 export const emailVerification = async(userName: string, email: string, otp: string) => {
       const { error, data } = await resend.emails.send({
    from: `Mega Mall <verification@sameer-dev.online>`,
    to: email.trim(),
    subject: "Email Verification",
    html: `<div style="font-family: sans-serif">
    <h1>Hello ${userName}!</h1>
    <p>Your verification code is ${otp}. Please enter this code to verify your email address.</p>
    <p>If you did not request this email, please ignore it.</p>
    <p>Best, Mega Mall</p>
    </div> `
  });
 
  if (error) {
    return {success: false, status: 500, message: error.message || "Something went wrong during email verification"};
  }
  return {success: true, status: 200, message: "Email verification sent successfully"};

 };

