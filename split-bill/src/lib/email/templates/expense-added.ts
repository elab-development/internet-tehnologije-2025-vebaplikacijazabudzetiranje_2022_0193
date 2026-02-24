import { baseTemplate } from './base';

export interface ExpenseAddedEmailData {
  recipientName: string;
  payerName: string;
  groupName: string;
  expenseDescription: string;
  totalAmount: string;
  yourShare: string;
  category: string;
  date: string;
  groupUrl: string;
}

export function expenseAddedEmailTemplate(data: ExpenseAddedEmailData): string {
  const content = `
    <h2>New Expense Added 💸</h2>

    <p>Hi <strong>${data.recipientName}</strong>,</p>

    <p>
      A new expense has been added to your group "<strong>${data.groupName}</strong>".
    </p>

    <div class="info-box">
      <p style="margin: 0 0 10px 0;">
        <strong>📝 Expense Details:</strong>
      </p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Description:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${data.expenseDescription}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Paid by:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${data.payerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Total Amount:</strong></td>
          <td style="padding: 8px 0; text-align: right; font-size: 18px; font-weight: bold;">
            ${data.totalAmount}
          </td>
        </tr>
        <tr style="background-color: #f0fdf4;">
          <td style="padding: 12px 8px; color: #16a34a; font-weight: bold;">
            <strong>Your Share:</strong>
          </td>
          <td style="padding: 12px 8px; text-align: right; font-size: 20px; font-weight: bold; color: #16a34a;">
            ${data.yourShare}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Category:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${data.category}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Date:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${data.date}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center;">
      <a href="${data.groupUrl}" class="button">
        View Group Details
      </a>
    </div>

    <p>
      You can view the full expense breakdown and settle your share in the group page.
    </p>

    <p>
      Best regards,<br>
      <strong>The SplitBill Team</strong>
    </p>
  `;

  return baseTemplate(content);
}
