import { NextResponse } from 'next/server';
import { sendContactEmail } from '../../../utils/sendEmail';

export async function POST(request) {
  try {
    const formData = await request.json();
    
    if (!formData.name || !formData.email || !formData.message) {
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 });
    }

    const result = await sendContactEmail(formData);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        status: result.status,
      });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Erreur API Contact:', error);
    return NextResponse.json({ error: 'Erreur interne lors de la tentative d\'envoi.' }, { status: 500 });
  }
}
