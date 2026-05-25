import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private lastResetPreviewUrl?: string;
  private lastResetHtml?: string;

  constructor() {
    const host = process.env.EMAIL_HOST || 'smtp.ethereal.email';
    const port = parseInt(process.env.EMAIL_PORT || '587', 10);
    const secure = port === 465;
    const authUser = process.env.EMAIL_USER;
    const authPass = process.env.EMAIL_PASS;

    const transportOptions: nodemailer.TransportOptions = {
      host,
      port,
      secure,
    };

    if (authUser && authPass) {
      transportOptions.auth = { user: authUser, pass: authPass };
    }

    this.transporter = nodemailer.createTransport(transportOptions);
  }

  async sendVaccinationReminder(
    to: string,
    motherName: string,
    childName: string,
    vaccineName: string,
    scheduledDate: Date,
    facilityName: string,
  ): Promise<void> {
    const dateStr = scheduledDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">💉 Vaccination Reminder</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Smart Maternal Health System</p>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px;">Dear <strong>${motherName}</strong>,</p>
          <p style="color: #374151;">This is a reminder that your child <strong>${childName}</strong> has a vaccination appointment scheduled:</p>
          
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Vaccine</td>
                <td style="padding: 8px 0; color: #111827; font-weight: bold;">${vaccineName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date</td>
                <td style="padding: 8px 0; color: #111827; font-weight: bold;">${dateStr}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Facility</td>
                <td style="padding: 8px 0; color: #111827; font-weight: bold;">${facilityName}</td>
              </tr>
            </table>
          </div>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; margin: 16px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              ⚠️ Please bring your child's vaccination card when you visit.
            </p>
          </div>

          <p style="color: #374151;">If you have any questions, please contact your health center.</p>
          <p style="color: #6b7280; font-size: 13px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            This is an automated message from the Smart Maternal Health System. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Smart Maternal Health" <${process.env.EMAIL_USER || 'no-reply@example.com'}>`,
        to,
        subject: `Vaccination Reminder: ${childName} - ${vaccineName} on ${dateStr}`,
        html,
      });
      this.logger.log(`Vaccination reminder email sent to ${to} for child ${childName}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      // Don't throw — a failed email should not crash the cron job
    }
  }

  async sendPregnancyVisitReminder(
    to: string,
    motherName: string,
    nextVisitDate: Date,
    gestationalAge: number,
    facilityName: string,
  ): Promise<void> {
    const dateStr = nextVisitDate.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #16a34a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">🤰 Antenatal Visit Reminder</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Smart Maternal Health System</p>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px;">Dear <strong>${motherName}</strong>,</p>
          <p style="color: #374151;">This is a reminder that your next antenatal care visit is scheduled for tomorrow:</p>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date</td>
                <td style="padding: 8px 0; color: #111827; font-weight: bold;">${dateStr}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Gestational Age</td>
                <td style="padding: 8px 0; color: #111827; font-weight: bold;">${gestationalAge} weeks</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Facility</td>
                <td style="padding: 8px 0; color: #111827; font-weight: bold;">${facilityName}</td>
              </tr>
            </table>
          </div>
          <div style="background: #dcfce7; border: 1px solid #16a34a; border-radius: 8px; padding: 12px; margin: 16px 0;">
            <p style="margin: 0; color: #14532d; font-size: 14px;">
              ✅ Please bring your antenatal care card and any previous test results.
            </p>
          </div>
          <p style="color: #374151;">Regular antenatal visits are important for your health and your baby's health.</p>
          <p style="color: #6b7280; font-size: 13px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            This is an automated message from the Smart Maternal Health System. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Smart Maternal Health" <${process.env.EMAIL_USER || 'no-reply@example.com'}>`,
        to,
        subject: `Antenatal Visit Reminder: ${dateStr}`,
        html,
      });
      this.logger.log(`Pregnancy visit reminder email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send pregnancy visit email to ${to}: ${error.message}`);
    }
  }

  async sendMotherVaccinationReminder(
    to: string,
    motherName: string,
    doseNumber: number,
    scheduledDate: Date,
  ): Promise<void> {
    const dateStr = scheduledDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #7c3aed; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">💉 Maternal Vaccination Reminder</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Smart Maternal Health System</p>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px;">Dear <strong>${motherName}</strong>,</p>
          <p style="color: #374151;">Your tetanus toxoid (TD) vaccination appointment is coming up:</p>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Dose:</strong> TD${doseNumber}</p>
            <p style="margin: 0;"><strong>Date:</strong> ${dateStr}</p>
          </div>
          <p style="color: #374151;">Please visit your health center on the scheduled date.</p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Smart Maternal Health" <${process.env.EMAIL_USER || 'no-reply@example.com'}>`,
        to,
        subject: `TD${doseNumber} Vaccination Reminder — ${dateStr}`,
        html,
      });
      this.logger.log(`Mother vaccination reminder email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send mother vaccination email to ${to}: ${error.message}`);
    }
  }

  /**
   * Send password reset email containing a one-time token link.
   * Security: the token sent is the raw secure token; only a hashed version should be stored in the DB.
   */
  async sendResetPasswordEmail(to: string, name: string, token: string): Promise<void> {
    const base = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    const resetUrl = `${base.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #111827; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Reset your password</h2>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #374151;">Hello <strong>${name}</strong>,</p>
          <p style="color: #374151;">We received a request to reset your account password. Click the button below to set a new password. This link will expire in 15 minutes.</p>
          <div style="text-align:center; margin: 20px 0;">
            <a href="${resetUrl}" style="background:#2563eb;color:white;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Reset Password</a>
          </div>
          <p style="color:#6b7280; font-size:13px;">If you did not request a password reset, you can safely ignore this message.</p>
          <p style="color:#6b7280; font-size:13px; margin-top:16px; border-top:1px solid #e2e8f0; padding-top:12px;">This is an automated message from the Smart Maternal Health System.</p>
        </div>
      </div>
    `;

    const buildEtherealTransporter = async () => {
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    };

    const sendWithTransporter = async (transporter: nodemailer.Transporter) => {
      return transporter.sendMail({
        from: `"Smart Maternal Health" <${process.env.EMAIL_USER || 'no-reply@example.com'}>`,
        to,
        subject: `Reset your password`,
        html,
      });
    };

    const shouldUseEthereal = process.env.EMAIL_PREVIEW === 'ethereal' || !process.env.EMAIL_USER;
    let transporterToUse = this.transporter;

    if (shouldUseEthereal) {
      transporterToUse = await buildEtherealTransporter();
    }

    try {
      const info = await sendWithTransporter(transporterToUse);
      this.logger.log(`Password reset email send attempted to ${to}. MessageId: ${info.messageId}`);
      // store raw html for dev inspection
      this.lastResetHtml = html;
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) {
        this.lastResetPreviewUrl = preview;
        this.logger.log(`Password reset preview URL: ${preview}`);
      }
    } catch (primaryError: any) {
      this.logger.error(`Primary password reset email send failed to ${to}: ${primaryError.message}`);

      const canFallback = process.env.NODE_ENV !== 'production' && process.env.EMAIL_PREVIEW !== 'disabled';
      if (canFallback) {
        try {
          const fallbackTransporter = await buildEtherealTransporter();
          const info = await sendWithTransporter(fallbackTransporter);
          this.logger.log(`Fallback Ethereal password reset email sent to ${to}. MessageId: ${info.messageId}`);
          // store raw html for dev inspection
          this.lastResetHtml = html;
          const preview = nodemailer.getTestMessageUrl(info);
          if (preview) {
            this.lastResetPreviewUrl = preview;
            this.logger.log(`Password reset preview URL: ${preview}`);
          }
          return;
        } catch (fallbackError: any) {
          this.logger.error(`Fallback Ethereal password reset email failed to ${to}: ${fallbackError.message}`);
        }
      }
    }
  }

  // Development helper to retrieve last preview URL (if any)
  getLastResetPreviewUrl(): string | undefined {
    return this.lastResetPreviewUrl;
  }

  // Development helper to retrieve the last raw HTML sent (if any)
  getLastResetHtml(): string | undefined {
    return this.lastResetHtml;
  }
}
