import { NextResponse } from 'next/server';

export async function GET() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;
  
  return NextResponse.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    smtp: {
      hasHost: !!host,
      hostValue: host || 'NON DÉFINI',
      hasUser: !!user,
      userValue: user || 'NON DÉFINI',
      hasPass: !!pass,
      passLength: pass ? pass.length : 0,
      hasFrom: !!from,
      fromValue: from || 'NON DÉFINI',
    },
    message: (host && user && pass) 
      ? '✅ Les variables SMTP sont bien lues par le serveur !' 
      : '❌ Il manque des variables SMTP sur le serveur.'
  });
}
