import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

export async function getMailerTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    return transporter;
  }

  // Fallback Ethereal / Test Transporter for development if SMTP not configured
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log(`[MAIL SERVICE] Test SMTP configured with Ethereal (${testAccount.user})`);
  } catch (e) {
    // Basic local transporter
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }

  return transporter;
}

export async function sendOtpEmail(toEmail: string, code: string): Promise<boolean> {
  try {
    const mailer = await getMailerTransporter();
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@learnlab.uz';

    const info = await mailer.sendMail({
      from: `"LearnLab Platformasi" <${fromAddress}>`,
      to: toEmail,
      subject: `LearnLab — Tasdiqlash kodingiz: ${code}`,
      text: `Salom!\n\nLearnLab ilmiy platformasiga kirish uchun tasdiqlash kodingiz: ${code}\n\nUshbu kod 10 daqiqa davomida amal qiladi. Kodni hech kimga bermang.\n\nHurmat bilan,\nLearnLab jamoasi`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0f766e; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">🧪 LearnLab</h1>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Interaktiv STEM Simulyatsiyalari Platformasi</p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <p style="color: #334155; font-size: 14px; margin: 0 0 12px 0; font-weight: 500;">
              Profilingizga kirish / ro‘yxatdan o‘tish uchun tasdiqlash kodingiz:
            </p>
            <div style="font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #0f766e; font-family: monospace; background: #ffffff; display: inline-block; padding: 10px 24px; border-radius: 8px; border: 2px dashed #0f766e;">
              ${code}
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin: 12px 0 0 0;">
              Ushbu kod 10 daqiqa davomida amal qiladi.
            </p>
          </div>
          <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
            Agar siz ushbu so‘rovni amalga oshirmagan bo‘lsangiz, ushbu xatni e’tiborsiz qoldiring.
          </p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} LearnLab STEM Platform. Barcha huquqlar himoyalangan.
          </p>
        </div>
      `
    });

    console.log(`[MAIL SERVICE] OTP email dispatched to ${toEmail}. Message ID: ${info.messageId}`);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`[MAIL SERVICE] Ethereal preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return true;
  } catch (err) {
    console.error(`[MAIL SERVICE] Failed to send email to ${toEmail}:`, err);
    return false;
  }
}
