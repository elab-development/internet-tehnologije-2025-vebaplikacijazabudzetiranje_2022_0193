# 📧 SendGrid Setup Guide

## Prerequisites

- SendGrid account (free tier available)
- Verified sender email address

---

## Step 1: Create SendGrid Account

1. Go to https://signup.sendgrid.com/
2. Sign up for a free account (100 emails/day)
3. Verify your email address

---

## Step 2: Verify Sender Identity

### Option A: Single Sender Verification (Recommended for development)

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details:
   - **From Name:** SplitBill
   - **From Email Address:** noreply@yourdomain.com (or your personal email)
   - **Reply To:** support@yourdomain.com
   - **Company Address:** Your address
4. Click **Create**
5. Check your email and click the verification link

### Option B: Domain Authentication (Recommended for production)

1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow the DNS setup instructions
4. Wait for DNS propagation (can take up to 48 hours)

---

## Step 3: Create API Key

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name: `SplitBill Development` (or `SplitBill Production`)
4. Permissions: **Full Access** (or **Restricted Access** with Mail Send only)
5. Click **Create & View**
6. **Copy the API key** (you won't be able to see it again!)

---

## Step 4: Configure Environment Variables

Add to your `.env` file:

```env
EMAIL_FROM="noreply@yourdomain.com"  # Must match verified sender
EMAIL_REPLY_TO="support@yourdomain.com"
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

## Step 5: Test Email Sending

### Using API endpoint:

```bash
# Register a new user (triggers verification email)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

### Check SendGrid Activity:

1. Go to **Activity** in SendGrid dashboard
2. You should see the email in the activity feed
3. Check your inbox for the verification email

---

## Troubleshooting

### Email not received?

- Check spam folder
- Verify sender email in SendGrid dashboard
- Check API key is correct and has Mail Send permission
- Check Activity feed in SendGrid for errors
- Check application logs for error messages

### Common Errors:

**Error: "The from email does not match a verified Sender Identity"**
- Solution: Verify your sender email in SendGrid dashboard

**Error: "Unauthorized"**
- Solution: Check that your API key is correct and has proper permissions

**Error: "Daily sending limit exceeded"**
- Solution: Free tier has 100 emails/day limit. Upgrade plan or wait 24 hours.

---

## Email Templates

All email templates are located in:

```
src/lib/email/templates/
├── base.ts                    # Base HTML template
├── verification.ts            # Email verification
└── expense-added.ts           # Expense notification
```

### Customizing Templates:

1. Edit the template file
2. Restart development server
3. Test by triggering the email event

---

## Rate Limits

### Free Tier:
- 100 emails/day
- 2,000 contacts

### Essentials Plan ($19.95/month):
- 50,000 emails/month
- 100,000 contacts

### Pro Plan ($89.95/month):
- 100,000 emails/month
- 200,000 contacts

---

## Best Practices

- ✅ Use verified sender - Always use a verified email address
- ✅ Handle failures gracefully - Don't block user registration if email fails
- ✅ Log email events - Track sent, delivered, bounced emails
- ✅ Respect unsubscribes - Implement unsubscribe functionality
- ✅ Monitor deliverability - Check SendGrid analytics regularly

---

## Production Checklist

- ☐ Domain authentication configured
- ☐ Production API key created (restricted permissions)
- ☐ Environment variables set in production
- ☐ Email templates tested
- ☐ Unsubscribe links added (if required)
- ☐ GDPR compliance checked
- ☐ Rate limiting configured
- ☐ Error handling implemented

---

## Resources

- [SendGrid Documentation](https://sendgrid.com/docs/)
- [SendGrid API Reference](https://docs.sendgrid.com/api-reference/)
- [Email Best Practices](https://sendgrid.com/blog/email-best-practices/)
