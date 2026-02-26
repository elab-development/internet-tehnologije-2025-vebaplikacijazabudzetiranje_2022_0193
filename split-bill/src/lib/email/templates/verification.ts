import { baseTemplate } from './base';

export interface VerificationEmailData {
  name: string;
  verificationUrl: string;
}

export function verificationEmailTemplate(data: VerificationEmailData): string {
  const content = `
    <h2>Welcome to SplitBill! 🎉</h2>

    <p>Hi <strong>${data.name}</strong>,</p>

    <p>
      Thank you for registering with SplitBill! We're excited to help you
      manage and share expenses with your friends and family.
    </p>

    <p>
      To complete your registration and start using SplitBill, please verify
      your email address by clicking the button below:
    </p>

    <div style="text-align: center;">
      <a href="${data.verificationUrl}" class="button">
        Verify Email Address
      </a>
    </div>

    <div class="info-box">
      <p style="margin: 0;">
        <strong>📧 Verification Link:</strong><br>
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${data.verificationUrl}" style="color: #16a34a; word-break: break-all;">
          ${data.verificationUrl}
        </a>
      </p>
    </div>

    <div class="warning-box">
      <p style="margin: 0;">
        <strong>⚠️ Security Note:</strong><br>
        This link will expire in 24 hours. If you didn't create an account with
        SplitBill, please ignore this email.
      </p>
    </div>

    <p>
      Once verified, you'll be able to:
    </p>
    <ul style="color: #4b5563; line-height: 1.8;">
      <li>Create and join expense groups</li>
      <li>Track shared expenses</li>
      <li>Split bills fairly</li>
      <li>Settle debts easily</li>
    </ul>

    <p>
      If you have any questions, feel free to reach out to our support team.
    </p>

    <p>
      Best regards,<br>
      <strong>The SplitBill Team</strong>
    </p>
  `;

  return baseTemplate(content);
}
