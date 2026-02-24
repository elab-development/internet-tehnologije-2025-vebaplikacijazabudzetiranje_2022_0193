import { baseTemplate } from './base';

export interface GroupInviteEmailData {
  recipientName: string;
  groupName: string;
  inviterName: string;
  inviteUrl: string;
}

export function groupInviteEmailTemplate(data: GroupInviteEmailData): string {
  const content = `
    <h2>You're Invited to a Group! 👥</h2>

    <p>Hi <strong>${data.recipientName}</strong>,</p>

    <p>
      <strong>${data.inviterName}</strong> has invited you to join the group
      <strong>"${data.groupName}"</strong> on SplitBill!
    </p>

    <p>
      SplitBill makes it easy to split bills and track expenses with friends and family.
      Join the group to start managing shared expenses together.
    </p>

    <div style="text-align: center;">
      <a href="${data.inviteUrl}" class="button">
        Join Group
      </a>
    </div>

    <div class="info-box">
      <p style="margin: 0;">
        <strong>🔗 Invite Link:</strong><br>
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${data.inviteUrl}" style="color: #16a34a; word-break: break-all;">
          ${data.inviteUrl}
        </a>
      </p>
    </div>

    <p>
      Once you join, you'll be able to:
    </p>
    <ul style="color: #4b5563; line-height: 1.8;">
      <li>View all group expenses</li>
      <li>See how much you owe or are owed</li>
      <li>Add and track new expenses</li>
      <li>Settle debts with other group members</li>
    </ul>

    <p>
      If you don't recognize this invitation or have any questions,
      feel free to reach out to our support team.
    </p>

    <p>
      Best regards,<br>
      <strong>The SplitBill Team</strong>
    </p>
  `;

  return baseTemplate(content);
}
