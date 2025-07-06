import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { maileType } from "../types/mailType";

dotenv.config();

const sendCode = (
  email: string,
  code?: string,
  _mailType?: string,
  details?: {
    location?: [number, number];
    temperature?: number;
    coordinates?: string;
    incidentId?: string;
    firefighterName?: string;
  }
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_USER as string,
      pass: process.env.ETHEREAL_PASS as string,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const main = async () => {
    try {
      const subject =
        _mailType === maileType.RESET
          ? "Your Reset OTP Code"
          : _mailType === maileType.VERIFY_OTP
          ? "Your Verification Code"
          : _mailType === maileType.CLIENT_REQUEST
          ? "PyroAlert Installation Request Received"
          : _mailType === maileType.INCIDENT_ALERT
          ? `🔥 Fire Alert: Incident for ${
              details?.firefighterName || "Firefighter"
            }`
          : "IGNORE THIS PLEASE";

      const text =
        _mailType === maileType.RESET
          ? `Your reset OTP code is ${code}`
          : _mailType === maileType.VERIFY_OTP
          ? `Your verification code is ${code}`
          : _mailType === maileType.CLIENT_REQUEST
          ? `You have successfully submitted a request for Smart Sensor Module installation.`
          : _mailType === maileType.INCIDENT_ALERT
          ? `🔥 Fire alert at ${details?.location}.\nTemp: ${details?.temperature}°C\nCoordinates: ${details?.coordinates}\nIncident ID: ${details?.incidentId}`
          : "IGNORE THIS PLEASE";

      const html =
        _mailType === maileType.RESET
          ? `
          <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
            <h2 style="color: #333; font-size: 24px;">Password Reset Request</h2>
            <p>You requested to reset your password. Use the following code:</p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; font-size: 20px; font-weight: bold;">${code}</div>
            <p>If you didn’t make this request, please ignore this email.</p>
            <hr />
            <p style="color: #888;">– PyroAlert Team</p>
          </div>
        `
          : _mailType === maileType.VERIFY_OTP
          ? `
          <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
            <h2 style="color: #333; font-size: 24px;">Verify Your Email</h2>
            <p>Thank you for signing up. Please use the code below to verify your account:</p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; font-size: 20px; font-weight: bold;">${code}</div>
            <p>If you didn’t initiate this, simply ignore the email.</p>
            <hr />
            <p style="color: #888;">– PyroAlert Team</p>
          </div>
        `
          : _mailType === maileType.CLIENT_REQUEST
          ? `
          <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; background: #f4f4f4; border-radius: 5px; padding: 10px;">
            <h2 style=" color: #333; font-size: 24px; margin-bottom: 20px;">Request Received – PyroAlert Installation</h2>
            <p style="margin-bottom: 20px;">
              Thank you for submitting your request for the <strong>Smart Sensor Module (SSM)</strong> installation.
              We’ve successfully received your details and our team will review your request shortly.
            </p>
            <p style="margin-bottom: 20px;">
              Once approved, a representative from PyroAlert will contact you to schedule a site visit or provide further instructions.
            </p>
            <p style="margin-bottom: 20px;">
              If you have any urgent queries, feel free to reach out to our support team.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #777; margin-bottom: 0;">Thank you,<br />Team PyroAlert</p>
            <p style="color: #777; font-size: 14px; margin-top: 5px;">(This is an automated message. Please do not reply.)</p>
          </div>
        `
          : _mailType === maileType.INCIDENT_ALERT
          ? `
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
          <h2 style="color: #d32f2f;">🚨 Emergency Fire Alert</h2>
          <p><strong>Firefighter:</strong> ${details?.firefighterName}</p>
          <p><strong>Location:</strong> ${
            details?.location && Array.isArray(details.location)
              ? `<p style="margin-top: 20px;">
             <a href="https://www.google.com/maps?q=${details.location[1]},${details.location[0]}" 
                style="display: inline-block; padding: 10px 20px; background-color: #d32f2f; color: #fff; text-decoration: none; border-radius: 5px;">
               <button>Open in Google Maps</button>
             </a>
           </p>`
              : ""
          }</p>
          <p><strong>Temperature:</strong> ${details?.temperature}°C</p>
          <p><strong>Coordinates:</strong> ${details?.coordinates}</p>
          <p><strong>Incident ID:</strong> ${details?.incidentId}</p>
          <p style="margin-top: 20px;">Please prepare for immediate response and coordinate with your team.</p>
          <hr />
          <p style="color: #888;">– PyroAlert Dispatch System</p>
        </div>
      `
          : "";

      const info = await transporter.sendMail({
        from: '"PyroAlert" <Pyroalert201@gmail.com>',
        to: email,
        subject,
        text,
        html,
      });

      console.log("✅ Email sent: %s", info.messageId);
    } catch (error) {
      console.error("❌ Error sending email:", error);
    }
  };

  main().catch(console.error);
};

export { sendCode };
