// Outbound email. No provider is wired yet, so this logs and reports false; the caller must
// behave the same either way (never reveal whether an address exists).
// To enable: set MAIL_FROM and a provider token as Worker secrets and implement send() below,
// e.g. with Resend's HTTP API (free tier covers a small user base).

export async function sendMail(env, to, subject, text) {
  if (env && env.RESEND_API_KEY && env.MAIL_FROM) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.MAIL_FROM, to: [to], subject, text }),
    });
    return r.ok;
  }
  console.log('mail (no provider configured) to=' + to + ' subject=' + subject);
  return false;
}
