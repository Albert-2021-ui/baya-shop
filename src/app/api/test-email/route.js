import { NextResponse } from 'next/server';

export async function GET() {
  // Fallback codé en dur si Railway n'a pas les variables
  const resendApiKey =
    process.env.RESEND_API_KEY ||
    process.env.RESEND_KEY ||
    process.env.RESEND_API ||
    're_CYe1WrwC_3ejGfiHH439h1NRWATYw615J';

  const webhookUrl =
    process.env.GMAIL_WEBHOOK_URL ||
    process.env.GMAIL_WEBHOOK_API_KEY ||
    process.env.WEBHOOK_URL ||
    process.env.GMAIL_WEBHOOK ||
    'https://script.google.com/macros/s/AKfycby0__BIyN-BlUm6Qvq67I0wZThlElyGxuCuzHPZx20MnqjcTRYzUKF4mQH8s-Y_eH_yaQ/exec';

  const fromAddress = process.env.RESEND_FROM || 'BAYA SHOP <onboarding@resend.dev>';
  const testTo = process.env.CONTACT_EMAIL || 'eugenebaya6@gmail.com';

  const config = {
    hasResendKey: !!resendApiKey,
    resendKeyPrefix: resendApiKey ? resendApiKey.trim().substring(0, 10) + '...' : 'NON DÉFINI',
    hasWebhookUrl: !!webhookUrl,
    webhookUrlPrefix: webhookUrl ? webhookUrl.substring(0, 40) + '...' : 'NON DÉFINI',
    fromAddress,
    testTo,
    environment: process.env.NODE_ENV,
  };

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f8f9fa; border-radius: 8px;">
      <div style="background: #080b1a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; border-bottom: 3px solid #ff7a00;">
        <h1 style="color: white; margin: 0; font-size: 20px;">BAYA SHOP</h1>
      </div>
      <div style="background: white; padding: 25px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #10b981; margin-top: 0;">✅ Configuration réussie !</h2>
        <p>Si vous recevez cet e-mail, votre service d'envoi d'e-mails est parfaitement configuré sur Railway.</p>
        <p style="color: #666; font-size: 13px; margin-top: 20px;">Envoyé le : ${new Date().toLocaleString('fr-FR')}</p>
      </div>
    </div>
  `;

  // ── Méthode 1 : Resend via fetch natif ──
  if (resendApiKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [testTo],
          subject: '✅ Test Resend - BAYA SHOP fonctionne !',
          html: emailHtml,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const result = await response.json();

      if (response.ok) {
        return NextResponse.json({
          success: true,
          method: 'resend',
          config,
          message: `✅ E-mail envoyé via Resend à ${testTo} !`,
          emailId: result.id,
        });
      }
      // Resend a échoué → on tombe sur le webhook
      console.error('Resend response error:', result);
    } catch (err) {
      console.error('Resend fetch failed:', err.message);
    }
  }

  // ── Méthode 2 : Gmail Webhook (fallback) ──
  if (webhookUrl) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          to: testTo,
          subject: '✅ Test Webhook - BAYA SHOP fonctionne !',
          html: emailHtml,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const result = await response.json();

      if (result.success) {
        return NextResponse.json({
          success: true,
          method: 'gmail_webhook',
          config,
          message: `✅ E-mail envoyé via Gmail Webhook à ${testTo} !`,
        });
      }

      return NextResponse.json({
        success: false,
        method: 'gmail_webhook',
        config,
        error: result.error || 'Erreur webhook inconnue',
      });
    } catch (err) {
      return NextResponse.json({
        success: false,
        method: 'gmail_webhook',
        config,
        error: `Webhook injoignable: ${err.message}`,
      });
    }
  }

  return NextResponse.json({
    success: false,
    config,
    error: 'Aucun service email disponible.',
  });
}
