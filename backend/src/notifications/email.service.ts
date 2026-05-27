import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  // ── Send via Resend API (HTTPS port 443 — works when SMTP ports are blocked) ──
  private async sendViaResend(to: string, subject: string, html: string): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) return false;

    try {
      const from = process.env.RESEND_FROM || 'onboarding@resend.dev';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to, subject, html }),
      });

      if (!res.ok) {
        const body = await res.text();
        this.logger.error(`Resend API error ${res.status}: ${body}`);
        return false;
      }

      this.logger.log(`Email sent via Resend to ${to} — ${subject}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Resend fetch failed: ${err.message}`);
      return false;
    }
  }

  // ── Send via SMTP (nodemailer) ─────────────────────────────────────────────
  private async sendViaSMTP(to: string, subject: string, html: string): Promise<boolean> {
    const user = process.env.EMAIL_USER?.trim();
    const pass = process.env.EMAIL_PASS?.trim();
    if (!user || !pass) return false;

    const port = parseInt(process.env.EMAIL_PORT || '465', 10);
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port,
        secure: port === 465,
        auth: { user, pass },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
      });

      await transporter.sendMail({
        from: `"Smart Maternal Health" <${user}>`,
        to, subject, html,
      });

      this.logger.log(`Email sent via SMTP to ${to} — ${subject}`);
      return true;
    } catch (err: any) {
      this.logger.error(`SMTP send failed to ${to}: ${err.message}`);
      return false;
    }
  }

  // ── Dev fallback: print to console + save to file ─────────────────────────
  private devFallback(to: string, subject: string, html: string, extra?: string): void {
    this.logger.warn('══════════════════════════════════════════════════════');
    this.logger.warn('  EMAIL NOT SENT — no working mail transport found');
    this.logger.warn(`  To      : ${to}`);
    this.logger.warn(`  Subject : ${subject}`);
    if (extra) this.logger.warn(`  ${extra}`);
    this.logger.warn('  → Set RESEND_API_KEY in .env to send real emails');
    this.logger.warn('══════════════════════════════════════════════════════');

    try {
      const dir = path.join(process.cwd(), 'dev-emails');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      fs.writeFileSync(path.join(dir, `${ts}.html`), html, 'utf8');
      fs.writeFileSync(path.join(dir, 'latest.html'), html, 'utf8');
      if (extra) {
        fs.writeFileSync(path.join(dir, 'latest-info.txt'),
          `To: ${to}\nSubject: ${subject}\nTime: ${new Date().toISOString()}\n${extra}\n`, 'utf8');
      }
    } catch { /* ignore */ }
  }

  // ── Master send: Resend → SMTP → console ──────────────────────────────────
  private async send(to: string, subject: string, html: string, extra?: string): Promise<void> {
    if (await this.sendViaResend(to, subject, html)) return;
    if (await this.sendViaSMTP(to, subject, html)) return;
    this.devFallback(to, subject, html, extra);
  }

  // ── Public methods ─────────────────────────────────────────────────────────

  async sendVaccinationReminder(
    to: string, motherName: string, childName: string,
    vaccineName: string, scheduledDate: Date, facilityName: string,
  ): Promise<void> {
    const dateStr = scheduledDate.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#2563eb;color:white;padding:20px;border-radius:8px 8px 0 0">
          <h2 style="margin:0">💉 Vaccination Reminder</h2>
          <p style="margin:5px 0 0;opacity:.9">Smart Maternal Health System</p>
        </div>
        <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
          <p>Dear <strong>${motherName}</strong>,</p>
          <p>Your child <strong>${childName}</strong> has a vaccination appointment:</p>
          <table style="width:100%;border-collapse:collapse;background:white;border:1px solid #e2e8f0;border-radius:8px;padding:16px">
            <tr><td style="padding:8px;color:#6b7280">Vaccine</td><td style="padding:8px;font-weight:bold">${vaccineName}</td></tr>
            <tr><td style="padding:8px;color:#6b7280">Date</td><td style="padding:8px;font-weight:bold">${dateStr}</td></tr>
            <tr><td style="padding:8px;color:#6b7280">Facility</td><td style="padding:8px;font-weight:bold">${facilityName}</td></tr>
          </table>
          <p style="color:#92400e;background:#fef3c7;padding:12px;border-radius:8px;margin-top:16px">⚠️ Please bring your child's vaccination card.</p>
        </div>
      </div>`;
    await this.send(to, `Vaccination Reminder: ${childName} — ${vaccineName} on ${dateStr}`, html);
  }

  async sendPregnancyVisitReminder(
    to: string, motherName: string, nextVisitDate: Date,
    gestationalAge: number, facilityName: string,
  ): Promise<void> {
    const dateStr = nextVisitDate.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#16a34a;color:white;padding:20px;border-radius:8px 8px 0 0">
          <h2 style="margin:0">🤰 Antenatal Visit Reminder</h2>
        </div>
        <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
          <p>Dear <strong>${motherName}</strong>,</p>
          <p>Your next antenatal care visit is scheduled for <strong>${dateStr}</strong>.</p>
          <p>Gestational age: <strong>${gestationalAge} weeks</strong> | Facility: <strong>${facilityName}</strong></p>
          <p style="color:#14532d;background:#dcfce7;padding:12px;border-radius:8px">✅ Please bring your antenatal care card and previous test results.</p>
        </div>
      </div>`;
    await this.send(to, `Antenatal Visit Reminder: ${dateStr}`, html);
  }

  async sendMotherVaccinationReminder(
    to: string, motherName: string, doseNumber: number, scheduledDate: Date,
  ): Promise<void> {
    const dateStr = scheduledDate.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#7c3aed;color:white;padding:20px;border-radius:8px 8px 0 0">
          <h2 style="margin:0">💉 Maternal Vaccination Reminder</h2>
        </div>
        <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
          <p>Dear <strong>${motherName}</strong>,</p>
          <p>Your <strong>TD${doseNumber}</strong> vaccination is scheduled for <strong>${dateStr}</strong>.</p>
          <p>Please visit your health center on the scheduled date.</p>
        </div>
      </div>`;
    await this.send(to, `TD${doseNumber} Vaccination Reminder — ${dateStr}`, html);
  }

  async sendResetPasswordEmail(to: string, name: string, token: string): Promise<void> {
    const base = (process.env.FRONTEND_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
    const resetUrl = `${base}/reset-password?token=${encodeURIComponent(token)}`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#111827;color:white;padding:20px;border-radius:8px 8px 0 0">
          <h2 style="margin:0">🔐 Reset your password</h2>
          <p style="margin:5px 0 0;opacity:.8">Smart Maternal Health System</p>
        </div>
        <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
          <p>Hello <strong>${name}</strong>,</p>
          <p>We received a request to reset your password. Click the button below — this link expires in <strong>15 minutes</strong>.</p>
          <div style="text-align:center;margin:24px 0">
            <a href="${resetUrl}" style="background:#2563eb;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
              Reset Password
            </a>
          </div>
          <p style="color:#6b7280;font-size:13px">Or copy this link into your browser:<br>
            <a href="${resetUrl}" style="color:#2563eb;word-break:break-all">${resetUrl}</a>
          </p>
          <p style="color:#6b7280;font-size:12px;margin-top:16px;border-top:1px solid #e2e8f0;padding-top:12px">
            If you did not request a password reset, ignore this message.
          </p>
        </div>
      </div>`;

    await this.send(
      to,
      'Reset your password — Smart Maternal Health',
      html,
      `RESET LINK: ${resetUrl}`,
    );
  }

  getLastResetPreviewUrl(): string | undefined { return undefined; }
  getLastResetHtml(): string | undefined { return undefined; }
}
