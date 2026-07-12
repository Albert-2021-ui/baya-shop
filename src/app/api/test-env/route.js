import { NextResponse } from 'next/server';

export async function GET() {
  // Accepte plusieurs noms possibles pour chaque variable
  const resendApiKey =
    process.env.RESEND_API_KEY ||
    process.env.RESEND_KEY ||
    process.env.RESEND_API;

  const webhookUrl =
    process.env.GMAIL_WEBHOOK_URL ||
    process.env.GMAIL_WEBHOOK_API_KEY ||
    process.env.WEBHOOK_URL ||
    process.env.GMAIL_WEBHOOK;

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

  // Afficher TOUTES les variables d'env contenant des mots-clés email (pour diagnostic)
  const allEnvKeys = Object.keys(process.env).filter(k =>
    /resend|webhook|gmail|smtp|mail|email/i.test(k)
  );

  return NextResponse.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    // Diagnostic : toutes les variables email détectées dans Railway
    detectedEmailVars: allEnvKeys.map(k => ({
      name: k,
      valuePreview: process.env[k]
        ? process.env[k].substring(0, 20) + '...'
        : 'vide',
    })),
    email: {
      resend: {
        configured: hasResend,
        apiKeyPrefix: resendApiKey
          ? resendApiKey.trim().substring(0, 10) + '...'
          : 'NON DÉFINI',
        fromAddress: resendFrom || 'onboarding@resend.dev (par défaut)',
      },
      webhook: {
        configured: hasWebhook,
        urlPrefix: webhookUrl
          ? webhookUrl.substring(0, 40) + '...'
          : 'NON DÉFINI',
      },
      smtp_legacy: {
        configured: hasSmtp,
        host: smtpHost || 'NON DÉFINI',
        user: smtpUser || 'NON DÉFINI',
        hasPass: !!smtpPass,
        from: smtpFrom || 'NON DÉFINI',
      },
      contactEmail: contactEmail || smtpUser || 'eugenebaya6@gmail.com',
    },
    activeMethod: hasResend
      ? 'RESEND (API)'
      : hasWebhook
      ? 'GMAIL WEBHOOK'
      : hasSmtp
      ? 'SMTP (legacy)'
      : 'AUCUN',
    message: hasResend
      ? '✅ Resend API configuré.'
      : hasWebhook
      ? '✅ Webhook Gmail configuré.'
      : '❌ Aucun service email configuré.',
  });
}
