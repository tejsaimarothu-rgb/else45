const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mailhog',
  port: parseInt(process.env.SMTP_PORT || '1025', 10),
  secure: false,
  ignoreTLS: true,
});

/**
 * Send an email verification link to the newly registered user.
 * @param {string} to      - Recipient email address
 * @param {string} name    - Recipient display name
 * @param {string} token   - UUID verification token
 */
async function sendVerificationEmail(to, name, token) {
  const verifyUrl = `${process.env.APP_URL}/verify?token=${token}`;

  await transporter.sendMail({
    from: '"ThreeTier App" <no-reply@threetier.dev>',
    to,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto;">
        <h2 style="color: #6366f1;">Welcome to ThreeTier App, ${name}!</h2>
        <p>Thanks for registering. Please confirm your email address by clicking the button below.</p>
        <p style="margin: 32px 0;">
          <a href="${verifyUrl}"
             style="background:#6366f1;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">
            Verify Email
          </a>
        </p>
        <p style="color:#888;font-size:13px;">
          This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin-top:32px;">
        <p style="color:#aaa;font-size:11px;">ThreeTier App · Docker Demo</p>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail };
