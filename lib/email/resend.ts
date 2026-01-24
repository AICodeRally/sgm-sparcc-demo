import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function getFromAddress(): string {
  const domain = process.env.EMAIL_FROM_DOMAIN || 'sgm-sparcc.com';
  return `noreply@${domain}`;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const from = getFromAddress();
  const subject = 'Reset Your Password';
  const html = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <p><a href="${resetUrl}">Reset Password</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you did not request this, you can safely ignore this email.</p>
  `;

  if (!resend) {
    console.log('[Dev Mode] Password reset email:');
    console.log('  To: ' + to);
    console.log('  From: ' + from);
    console.log('  Subject: ' + subject);
    console.log('  Reset URL: ' + resetUrl);
    return;
  }

  await resend.emails.send({
    from,
    to,
    subject,
    html,
  });
}

export async function sendInviteEmail(
  to: string,
  inviteUrl: string,
  organizationName: string
): Promise<void> {
  const from = getFromAddress();
  const subject = 'You have been invited to join ' + organizationName;
  const html = `
    <h2>You are Invited!</h2>
    <p>You have been invited to join <strong>${organizationName}</strong>.</p>
    <p>Click the link below to accept your invitation and set up your account:</p>
    <p><a href="${inviteUrl}">Accept Invitation</a></p>
    <p>If you did not expect this invitation, you can safely ignore this email.</p>
  `;

  if (!resend) {
    console.log('[Dev Mode] Invite email:');
    console.log('  To: ' + to);
    console.log('  From: ' + from);
    console.log('  Subject: ' + subject);
    console.log('  Invite URL: ' + inviteUrl);
    console.log('  Organization: ' + organizationName);
    return;
  }

  await resend.emails.send({
    from,
    to,
    subject,
    html,
  });
}