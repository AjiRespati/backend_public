import nodemailer from "nodemailer";
import { logger } from "../config/logger";

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    await mailer.sendMail({
      from: `"Aji Respati POS System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    logger.info(`📧 Email sent to ${to}`);
  } catch (err) {
    logger.error("❌ Failed to send email: " + (err as Error).message);
  }
};
