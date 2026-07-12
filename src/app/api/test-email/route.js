import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM || 'BAYA SHOP <onboarding@resend.dev>';
  const testTo = process.env.CONTACT_EMAIL || 'eugenebaya6@gmail.com';

  const config = {
    hasResendKey: !!resendApiKey,
    resendKeyPrefix: resendApiKey
      ? resendApiKey.substring(0, 10) + '...'
      : 'NON DÉFINI',
    resendKeyLength: resendApiKey ? resendApiKey.length : 0,
    fromAddress,
    testTo,
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
  };

  // ── 1. Clé manquante ──
  if (!resendApiKey) {
    return NextResponse.json({
      success: false,
      step: 'config_check',
      config,
      error: 'Variable RESEND_API_KEY manquante. Ajoutez-la dans Railway > Variables.',
    });
  }

  // ── 2. Test de connectivité réseau vers api.resend.com ──
  let networkOk = false;
  let networkError = null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const resp = await fetch('https://api.resend.com/', {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    networkOk = true; // même une 401 signifie que le réseau fonctionne
  } catch (err) {
    networkError = err.message;
  }

  if (!networkOk) {
    return NextResponse.json({
      success: false,
      step: 'network_check',
      config,
      error: `Impossible de joindre api.resend.com depuis ce serveur.`,
      networkError,
      hint: 'Railway bloque peut-être les connexions sortantes. Vérifiez que votre plan Railway autorise le trafic sortant HTTPS.',
    });
  }

  // ── 3. Envoi de l'email via Resend ──
  try {
    const resend = new Resend(resendApiKey.trim()); // .trim() pour enlever espaces invisibles

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [testTo],
      subject: '✅ Test Resend - BAYA SHOP fonctionne !',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f8f9fa; border-radius: 8px;">
          <div style="background: #080b1a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; border-bottom: 3px solid #ff7a00;">
            <h1 style="color: white; margin: 0; font-size: 20px;">BAYA SHOP</h1>
          </div>
          <div style="background: white; padding: 25px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #10b981; margin-top: 0;">✅ Configuration réussie !</h2>
            <p>Si vous recevez cet e-mail, votre service <strong>Resend</strong> est parfaitement configuré sur Railway.</p>
            <p style="color: #666; font-size: 13px; margin-top: 20px;">Envoyé le : ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({
        success: false,
        step: 'resend_api',
        config,
        networkOk,
        error: `Resend API a répondu avec une erreur: ${error.message || JSON.stringify(error)}`,
        resendError: error,
        hint: error.message?.includes('domain')
          ? "Vous devez vérifier un domaine sur Resend ou utiliser l'adresse onboarding@resend.dev comme expéditeur."
          : error.message?.includes('Invalid API Key') || error.message?.includes('401')
          ? 'La clé API est invalide. Vérifiez-la sur resend.com/api-keys.'
          : undefined,
      });
    }

    return NextResponse.json({
      success: true,
      step: 'done',
      config,
      networkOk,
      message: `✅ E-mail de test envoyé avec succès à ${testTo} ! Vérifiez votre boîte de réception.`,
      emailId: data.id,
    });

  } catch (err) {
    return NextResponse.json({
      success: false,
      step: 'send_exception',
      config,
      networkOk,
      errorName: err.name,
      errorMessage: err.message,
      errorCode: err.code,
      errorCommand: err.command,
      fullError: err.toString(),
      hint: err.code === 'ETIMEDOUT'
        ? 'Timeout réseau. Le serveur Railway ne peut pas atteindre api.resend.com.'
        : undefined,
    });
  }
}
