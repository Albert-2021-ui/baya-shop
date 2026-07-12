import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dns from 'dns';

// Forcer Node.js à utiliser l'IPv4 en priorité
dns.setDefaultResultOrder('ipv4first');

export async function GET() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return NextResponse.json({ error: 'Variables SMTP manquantes' });
  }

  const transportConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    family: 4, // ⚠️ FORCE IPv4
    tls: { rejectUnauthorized: false }
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
