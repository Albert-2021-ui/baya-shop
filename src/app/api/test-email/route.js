import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dns from 'dns/promises';

export async function GET() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return NextResponse.json({ error: 'Variables SMTP manquantes' });
  }

  // Résoudre manuellement l'adresse IPv4 pour éviter le bug IPv6 (ENETUNREACH) sur Railway
  let resolvedHost = host;
  try {
    const lookupResult = await dns.lookup(host, { family: 4 });
    resolvedHost = lookupResult.address;
    console.log(`Resolved ${host} to IPv4: ${resolvedHost}`);
  } catch (err) {
    console.error(`Failed to resolve ${host} to IPv4:`, err);
  }

  const transportConfig = {
    host: resolvedHost,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: { 
      servername: host, // Requis car on utilise l'IP brute au lieu du nom de domaine
      rejectUnauthorized: false 
    }
  };

  try {
    const transporter = nodemailer.createTransport(transportConfig);
    
    // Test 1: Vérification de la connexion
    await transporter.verify();

    // Test 2: Envoi d'un mail de test
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || user,
      to: user, // Envoi à vous-même
      subject: 'Test Diagnostic SMTP Railway',
      html: '<p>Si vous recevez ceci, l\'envoi d\'e-mails fonctionne depuis Railway !</p>'
    });

    return NextResponse.json({ 
      success: true, 
      message: '✅ E-mail envoyé avec succès ! Vérifiez votre boîte de réception.',
      messageId: info.messageId 
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      errorName: error.name,
      errorMessage: error.message,
      errorCode: error.code,
      errorResponseCode: error.responseCode,
      errorCommand: error.command,
      fullError: error.toString()
    });
  }
}
