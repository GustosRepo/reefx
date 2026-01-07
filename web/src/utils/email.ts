// Email utility using Resend
import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  try {
    const client = getResendClient();
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'REEFXONE <noreply@reefxone.com>';
    
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: 'Failed to send email' };
  }
}

// Password Reset Email Template
export function getPasswordResetEmailHtml(resetUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - REEFXONE</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0e1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 500px; width: 100%; border-collapse: collapse;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #06b6d4, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">REEFXONE</h1>
            </td>
          </tr>
          
          <!-- Card -->
          <tr>
            <td style="background: rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 40px; border: 1px solid rgba(255, 255, 255, 0.1);">
              <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 24px; font-weight: 600; text-align: center;">
                Reset Your Password
              </h2>
              <p style="margin: 0 0 24px; color: #9ca3af; font-size: 16px; line-height: 1.6; text-align: center;">
                We received a request to reset your password. Click the button below to create a new password.
              </p>
              
              <!-- Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 30px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} REEFXONE. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getPasswordResetEmailText(resetUrl: string) {
  return `
REEFXONE - Reset Your Password

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.

© ${new Date().getFullYear()} REEFXONE. All rights reserved.
  `.trim();
}

// Welcome/Signup Confirmation Email Template
export function getWelcomeEmailHtml(confirmUrl: string, name: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to REEFXONE</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0e1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 500px; width: 100%; border-collapse: collapse;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #06b6d4, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">REEFXONE</h1>
            </td>
          </tr>
          
          <!-- Card -->
          <tr>
            <td style="background: rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 40px; border: 1px solid rgba(255, 255, 255, 0.1);">
              <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 24px; font-weight: 600; text-align: center;">
                Welcome, ${name}! 🎉
              </h2>
              <p style="margin: 0 0 24px; color: #9ca3af; font-size: 16px; line-height: 1.6; text-align: center;">
                Thanks for signing up for REEFXONE! Please confirm your email address to get started tracking your reef tank.
              </p>
              
              <!-- Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${confirmUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px;">
                      Confirm Email
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                This link will expire in 24 hours.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 30px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} REEFXONE. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getWelcomeEmailText(confirmUrl: string, name: string) {
  return `
REEFXONE - Welcome, ${name}!

Thanks for signing up for REEFXONE! Please confirm your email address to get started tracking your reef tank.

Click here to confirm your email:
${confirmUrl}

This link will expire in 24 hours.

© ${new Date().getFullYear()} REEFXONE. All rights reserved.
  `.trim();
}
