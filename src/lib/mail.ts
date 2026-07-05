import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
    || process.env.NEXTAUTH_URL 
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null)
    || "https://jlpt-master-practice.vercel.app";
    
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_ADDRESS}>`,
    to: email,
    subject: "Xác thực tài khoản JLPT Practice",
    html: `
      <h2>Chào mừng bạn đến với Nền tảng JLPT</h2>
      <p>Vui lòng click vào link bên dưới để xác thực tài khoản của bạn:</p>
      <a href="${verifyUrl}" style="padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Xác thực tài khoản</a>
      <p>Hoặc copy link này dán vào trình duyệt:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    `,
  });
}
