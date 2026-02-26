import { baseTemplate } from './base';

export interface SettlementEmailData {
  recipientName: string;
  payerName: string;
  amount: string;
  comment?: string;
  groupName: string;
  date: string;
  groupUrl: string;
}

export function settlementConfirmedEmailTemplate(
  data: SettlementEmailData
): string {
  const content = `
    <h2>Payment Received ✅</h2>

    <p>Hi <strong>${data.recipientName}</strong>,</p>

    <p>
      Great news! <strong>${data.payerName}</strong> has recorded a payment
      in the "<strong>${data.groupName}</strong>" group.
    </p>

    <div class="info-box">
      <p style="margin: 0 0 10px 0;">
        <strong>💳 Payment Details:</strong>
      </p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>From:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${data.payerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Amount:</strong></td>
          <td style="padding: 8px 0; text-align: right; font-size: 18px; font-weight: bold; color: #16a34a;">
            ${data.amount}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Date:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${data.date}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Group:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${data.groupName}</td>
        </tr>
        ${
          data.comment
            ? `<tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Note:</strong></td>
          <td style="padding: 8px 0; text-align: right; font-style: italic;">"${data.comment}"</td>
        </tr>`
            : ''
        }
      </table>
    </div>

    <div style="text-align: center;">
      <a href="${data.groupUrl}" class="button">
        View Group Details
      </a>
    </div>

    <p>
      This payment has been recorded and your balance has been updated.
      Your debt has been settled!
    </p>

    <p>
      Best regards,<br>
      <strong>The SplitBill Team</strong>
    </p>
  `;

  return baseTemplate(content);
}
