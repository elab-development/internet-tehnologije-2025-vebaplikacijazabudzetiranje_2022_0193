import { emailConfig, sgMail } from './config';
import {
  verificationEmailTemplate,
  VerificationEmailData,
} from './templates/verification';
import {
  expenseAddedEmailTemplate,
  ExpenseAddedEmailData,
} from './templates/expense-added';

/**
 * Email sending utility functions
 */

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Generic email sending function
 */
async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  // Skip sending in test environment
  if (!emailConfig.enabled) {
    console.log('📧 Email sending disabled (test environment or missing API key)');
    console.log('📧 Would send email to:', options.to);
    console.log('📧 Subject:', options.subject);
    return true;
  }

  try {
    const msg = {
      to: options.to,
      from: {
        email: emailConfig.from.email,
        name: emailConfig.from.name,
      },
      replyTo: emailConfig.replyTo,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject,
    };

    await sgMail.send(msg as any);
    console.log('✅ Email sent successfully to:', options.to);
    return true;
  } catch (error: any) {
    console.error('❌ Email sending failed:', error);

    if (error.response) {
      console.error('SendGrid error:', error.response.body);
    }

    return false;
  }
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(
  email: string,
  data: VerificationEmailData
): Promise<boolean> {
  const html = verificationEmailTemplate(data);

  return sendEmail({
    to: email,
    subject: '✉️ Verify your SplitBill account',
    html,
    text: `Hi ${data.name}, please verify your email by visiting: ${data.verificationUrl}`,
  });
}

/**
 * Send expense added notification
 */
export async function sendExpenseAddedEmail(
  email: string,
  data: ExpenseAddedEmailData
): Promise<boolean> {
  const html = expenseAddedEmailTemplate(data);

  return sendEmail({
    to: email,
    subject: `💸 New expense in "${data.groupName}": ${data.expenseDescription}`,
    html,
    text: `New expense: ${data.expenseDescription} (${data.totalAmount}). Your share: ${data.yourShare}`,
  });
}

/**
 * Send bulk emails (for expense notifications to multiple users)
 */
export async function sendBulkEmails(
  emails: Array<{ to: string; data: ExpenseAddedEmailData }>
): Promise<void> {
  const promises = emails.map((email) =>
    sendExpenseAddedEmail(email.to, email.data)
  );

  await Promise.allSettled(promises);
}
