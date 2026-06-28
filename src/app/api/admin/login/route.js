import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Identifiants configurés dans .env.local, avec fallback par défaut
    const adminUser = process.env.ADMIN_USERNAME || 'albert';
    const adminPass = process.env.ADMIN_PASSWORD || 'baya';

    if (username === adminUser && password === adminPass) {
      // Connexion réussie
      return NextResponse.json({ success: true });
    } else {
      // Échec de la connexion
      return NextResponse.json({ 
        success: false, 
        error: 'Identifiants invalides. Veuillez réessayer.' 
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Erreur dans l\'API de login admin:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}
