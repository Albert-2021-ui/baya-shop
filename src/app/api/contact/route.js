import { NextResponse } from 'next/server';
import { sendContactEmail } from '../../../utils/sendEmail';

export async function POST(request) {
  try {
    const formData = await request.json();

    // Validation basique
    if (!formData.name || !formData.email || !formData.message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    // Valider le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format.' },
        { status: 400 }
      );
    }

    console.log('Sending contact email with data:', formData);

    const result = await sendContactEmail(formData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        status: result.status,
        message: result.status === 'sent_via_smtp' 
          ? 'Email sent successfully.' 
          : 'Email logged locally (SMTP not configured).'
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send email.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in contact API:', error);
    return NextResponse.json(
      { error: 'Internal server error while sending email.' },
      { status: 500 }
    );
  }
}

