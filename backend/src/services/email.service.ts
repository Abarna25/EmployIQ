import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // For development, you can use ethereal.email or a real SMTP server.
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"EmployIQ Platform" <${process.env.SMTP_FROM || 'noreply@employiq.ai'}>`,
        to,
        subject,
        html,
      });
      logger.info(`Email sent to ${to} [MessageId: ${info.messageId}]`);
      
      // If using ethereal email for local dev, log the preview URL
      if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
        logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
