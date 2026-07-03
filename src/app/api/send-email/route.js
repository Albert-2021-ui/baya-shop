import { NextResponse } from 'next/server';
import { sendConfirmationEmail } from '../../../utils/sendEmail';

export async function POST(request) {
  try {
    
    const { order} = await request.json();
    if (!order) {
      return NextResponse.json({ error: 'Commande manquante.' }, { status: 400 });
    }
    console.log(JSON.stringify(order, null, 2));

    const result = await sendConfirmationEmail(order);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        status: result.status,
        message: result.message
      });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Erreur dans l\'API d\'envoi d\'e-mail:', error);
    return NextResponse.json({ error: 'Erreur interne lors de la tentative d\'envoi d\'e-mail.' }, { status: 500 });
  }
}
