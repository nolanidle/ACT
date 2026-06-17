import transporter from "../config/mail.js";
import dotenv from "dotenv";

dotenv.config();

const FROM = process.env.SMTP_FROM || "noreply@actstroyds.com";
const APP_NAME = "ACTstroyds";
const PRIMARY_COLOR = "#4F46E5";

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${APP_NAME}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; color: #1f2937; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: ${PRIMARY_COLOR}; padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 4px; }
    .body { padding: 40px; }
    .body h2 { font-size: 22px; color: #111827; margin-bottom: 12px; }
    .body p { font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 16px; }
    .code-box { background: #f0f4ff; border: 2px solid ${PRIMARY_COLOR}; border-radius: 8px; text-align: center; padding: 24px; margin: 24px 0; }
    .code-box span { font-size: 40px; font-weight: 800; letter-spacing: 12px; color: ${PRIMARY_COLOR}; }
    .btn { display: inline-block; background: ${PRIMARY_COLOR}; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; margin: 20px 0; }
    .btn:hover { background: #4338ca; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    .footer { padding: 24px 40px; text-align: center; background: #f9fafb; }
    .footer p { font-size: 13px; color: #9ca3af; line-height: 1.6; }
    .footer a { color: ${PRIMARY_COLOR}; text-decoration: none; }
    .warning { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-top: 16px; font-size: 14px; color: #92400e; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>${APP_NAME}</h1>
      <p>Your ACT Test Prep Platform</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>You received this email because you have an account with ${APP_NAME}.</p>
      <p>If you did not request this, please ignore this email or <a href="mailto:${FROM}">contact support</a>.</p>
      <p style="margin-top: 12px;">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const sendVerificationEmail = async (email, name, code) => {
  const html = baseTemplate(`
    <h2>Verify Your Email Address</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Welcome to ${APP_NAME}! To get started on your ACT prep journey, please verify your email address using the code below:</p>
    <div class="code-box">
      <span>${code}</span>
    </div>
    <p>This code expires in <strong>15 minutes</strong>. Enter it on the verification page to activate your account.</p>
    <hr class="divider" />
    <div class="warning">
      <strong>Security Notice:</strong> If you didn't create an account with ${APP_NAME}, you can safely ignore this email.
    </div>
  `);

  await transporter.sendMail({
    from: `"${APP_NAME}" <${FROM}>`,
    to: email,
    subject: `${code} — Your ${APP_NAME} Verification Code`,
    html,
    text: `Hi ${name},\n\nYour ${APP_NAME} verification code is: ${code}\n\nThis code expires in 15 minutes.\n\nIf you didn't create an account, please ignore this email.`,
  });
};

export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const html = baseTemplate(`
    <h2>Reset Your Password</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>We received a request to reset your ${APP_NAME} password. Click the button below to create a new password:</p>
    <p style="text-align: center;">
      <a href="${resetUrl}" class="btn">Reset My Password</a>
    </p>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; font-size: 13px; color: #6b7280;">${resetUrl}</p>
    <hr class="divider" />
    <p>This link expires in <strong>1 hour</strong> and can only be used once.</p>
    <div class="warning">
      <strong>Security Notice:</strong> If you did not request a password reset, please ignore this email. Your password will not be changed.
    </div>
  `);

  await transporter.sendMail({
    from: `"${APP_NAME}" <${FROM}>`,
    to: email,
    subject: `Reset Your ${APP_NAME} Password`,
    html,
    text: `Hi ${name},\n\nWe received a request to reset your ${APP_NAME} password.\n\nClick this link to reset it: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
  });
};
