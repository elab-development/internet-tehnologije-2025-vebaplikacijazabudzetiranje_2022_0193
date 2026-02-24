import sgMail from '@sendgrid/mail';

/**
 * SendGrid Email Configuration
 */

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';

if (!SENDGRID_API_KEY) {
  console.warn('⚠️  SENDGRID_API_KEY is not set. Email functionality will not work.');
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

/**
 * Email configuration
 */
export const emailConfig = {
  from: {
    email: process.env.EMAIL_FROM || 'noreply@splitbill.com',
    name: 'SplitBill',
  },
  replyTo: process.env.EMAIL_REPLY_TO || 'support@splitbill.com',

  // Email templates
  templates: {
    verification: 'verification',
    groupInvite: 'group-invite',
    expenseAdded: 'expense-added',
    settlementConfirmed: 'settlement-confirmed',
    passwordReset: 'password-reset',
  },

  // Feature flags
  enabled: !!SENDGRID_API_KEY && process.env.NODE_ENV !== 'test',

  // Rate limiting
  maxRetries: 3,
  retryDelay: 1000, // ms
};

export { sgMail };
