import { emailConfig, resend } from './config';
import {
  verificationEmailTemplate,
  VerificationEmailData,
} from './templates/verification';
import {
  expenseAddedEmailTemplate,
  ExpenseAddedEmailData,
} from './templates/expense-added';
import {
  groupInviteEmailTemplate,
  GroupInviteEmailData,
} from './templates/group-invite';
import {
  settlementConfirmedEmailTemplate,
  SettlementEmailData,
} from './templates/settlement-confirmed';

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

  // Free-plan override: redirect all emails to the verified account address
  const recipient = emailConfig.toOverride || options.to;
  if (emailConfig.toOverride && emailConfig.toOverride !== options.to) {
    console.log(`📧 [Free plan] Redirecting email from "${options.to}" to "${recipient}"`);
  }

  try {
    const { error } = await resend!.emails.send({
      from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
      to: recipient,
      replyTo: emailConfig.replyTo,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return false;
    }

    console.log('✅ Email sent successfully to:', recipient);
    return true;
  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
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

/**
 * Send group invite email
 */
export async function sendGroupInviteEmail(
  email: string,
  data: GroupInviteEmailData
): Promise<boolean> {
  const html = groupInviteEmailTemplate(data);

  return sendEmail({
    to: email,
    subject: `🎉 ${data.inviterName} invited you to join "${data.groupName}" on SplitBill`,
    html,
    text: `${data.inviterName} invited you to join the group "${data.groupName}". Click here: ${data.inviteUrl}`,
  });
}

/**
 * Send member joined group notification
 */
export async function sendMemberJoinedEmail(
  to: string,
  data: { newMemberName: string; newMemberEmail: string; groupName: string }
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `👥 ${data.newMemberName} joined "${data.groupName}"`,
    html: `<p>Hi,</p><p><strong>${data.newMemberName}</strong> (${data.newMemberEmail}) just joined your group <strong>${data.groupName}</strong> on SplitBill.</p>`,
    text: `${data.newMemberName} (${data.newMemberEmail}) joined "${data.groupName}".`,
  });
}

/**
 * Send settlement confirmed email
 */
export async function sendSettlementEmail(
  email: string,
  data: SettlementEmailData
): Promise<boolean> {
  const html = settlementConfirmedEmailTemplate(data);

  return sendEmail({
    to: email,
    subject: `✅ Payment received from ${data.payerName} (${data.amount})`,
    html,
    text: `${data.payerName} sent you ${data.amount} to settle debts in "${data.groupName}".`,
  });
}
