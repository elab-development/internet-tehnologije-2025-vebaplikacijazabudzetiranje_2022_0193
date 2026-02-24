/**
 * Base HTML email template
 * Responsive design with inline CSS
 */
export function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>SplitBill</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
      color: #1f2937;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 32px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #16a34a;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #15803d;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #16a34a;
      text-decoration: none;
    }
    h2 {
      color: #111827;
      font-size: 24px;
      margin-top: 0;
    }
    p {
      line-height: 1.6;
      color: #4b5563;
      margin: 16px 0;
    }
    .info-box {
      background-color: #f0fdf4;
      border-left: 4px solid #16a34a;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 SplitBill</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>
        This email was sent by <strong>SplitBill</strong><br>
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}">Visit our website</a> |
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/support">Support</a>
      </p>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
        © ${new Date().getFullYear()} SplitBill. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
