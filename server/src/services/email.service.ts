import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #111; color: #e5e5e5; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background: #10b981; color: white; font-weight: 700; font-size: 14px; padding: 8px 14px; border-radius: 10px; letter-spacing: -0.5px;">CI</div>
        <h1 style="margin: 16px 0 0; font-size: 20px; font-weight: 600; color: #ffffff;">CoreInventory</h1>
      </div>
      <p style="font-size: 14px; color: #a3a3a3; margin-bottom: 24px; text-align: center;">
        Use the code below to reset your password. It expires in <strong style="color: #f97316;">10 minutes</strong>.
      </p>
      <div style="background: #1a1a1a; border: 1px solid #262626; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #10b981; font-family: monospace;">${otp}</span>
      </div>
      <p style="font-size: 12px; color: #525252; text-align: center; margin: 0;">
        If you didn't request this, ignore this email.
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"CoreInventory" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'CoreInventory — Password Reset OTP',
    html,
  };

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    await transporter.sendMail(mailOptions);
  } else {
    console.log(`[EMAIL] EMAIL_USER/EMAIL_PASS not set. OTP for ${to}: ${otp}`);
  }
};
