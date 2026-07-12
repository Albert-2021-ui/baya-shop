import { NextResponse } from 'next/server';

export async function GET() {
  const resendApiKey = process.env.RESEND_API_KEY;
  const webhookUrl = process.env.GMAIL_WEBHOOK_URL;
  const resendFrom = process.env.RESEND_FROM;
  const contactEmail = process.env.CONTACT_EMAIL;

  // Legacy SMTP vars (pour référence)
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM;
  
  const hasResend = !!resendApiKey;
  const hasWebhook = !!webhookUrl;
  const hasSmtp = !!(smtpHost && smtpUser && smtpPass);

  return NextResponse.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    email: {
      // Méthode principale
      resend: {
        configured: hasResend,
        apiKeyPrefix: resendApiKey ? resendApiKey.substring(0, 8) + '...' : 'NON DÉFINI',
        fromAddress: resendFrom || 'onboarding@resend.dev (par défaut)',
      },
      // Méthode de fallback
      webhook: {
        configured: hasWebhook,
        urlPrefix: webhookUrl ? webhookUrl.substring(0, 35) + '...' : 'NON DÉFINI',
      },
      // Legacy (plus utilisé activement)
      smtp_legacy: {
        configured: hasSmtp,
        host: smtpHost || 'NON DÉFINI',
        user: smtpUser || 'NON DÉFINI',
        hasPass: !!smtpPass,
        from: smtpFrom || 'NON DÉFINI',
      },
      contactEmail: contactEmail || smtpUser || 'eugenebaya6@gmail.com',
    },
    activeMethod: hasResend ? 'RESEND (API)' : hasWebhook ? 'GMAIL WEBHOOK' : hasSmtp ? 'SMTP (legacy)' : 'AUCUN',
    message: hasResend
      ? '✅ Resend API est configuré — les e-mails seront envoyés via Resend.'
      : hasWebhook
      ? '⚠️ Webhook Gmail configuré — utilisé comme méthode d\'envoi.'
      : '❌ Aucun service d\'email configuré. Ajoutez RESEND_API_KEY dans Railway.',
  });
}
