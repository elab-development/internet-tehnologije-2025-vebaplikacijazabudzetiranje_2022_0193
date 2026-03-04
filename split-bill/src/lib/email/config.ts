import { Resend } from 'resend';

/**
 * Resend Email Configuration
 *
 * Free plan constraint: emails can only be delivered to the account-owner's
 * verified address. Set RESEND_TO_OVERRIDE to that address so every outgoing
 * email is redirected there during development / on the free tier.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

if (!RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY is not set. Email functionality will not work.');
}

// Conditionally instantiate to avoid a throw during Next.js build
// when environment variables are not yet injected.
export const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Email configuration
 */
export const emailConfig = {
  from: {
    // Use Resend's shared sending domain until a custom domain is verified.
    // After domain verification, switch to e.g. "SplitBill <noreply@yourdomain.com>"
    email: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    name: 'SplitBill',
  },
  replyTo: process.env.EMAIL_REPLY_TO || 'andjeladanilovic19@gmail.com',

  /**
   * Free-plan override: when set, ALL outgoing emails are delivered to this
   * address instead of the real recipient. Required on Resend's free tier.
   */
  toOverride: process.env.RESEND_TO_OVERRIDE || '',

  // Feature flags
  enabled: !!RESEND_API_KEY && process.env.NODE_ENV !== 'test',

  // Rate limiting
  maxRetries: 3,
  retryDelay: 1000, // ms
};
