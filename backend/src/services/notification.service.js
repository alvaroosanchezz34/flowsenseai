import fetch from "node-fetch";
import nodemailer from "nodemailer";

export const sendWebhook = async (payload) => {
    if (!process.env.WEBHOOK_URL) return;

    try {
        await fetch(process.env.WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error("Webhook error:", error.message);
    }
};

export const sendEmail = async ({ to, subject, text }) => {
    if (!process.env.EMAIL_HOST) return;

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // STARTTLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });


    try {
        await transporter.sendMail({
            from: `"FlowSense AI" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text
        });
    } catch (error) {
        console.error("Email error:", error.message);
    }
};
