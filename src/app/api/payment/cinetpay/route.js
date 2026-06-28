import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { customer, items, total, reference } = await request.json();

    const cinetpayApiKey = process.env.CINETPAY_API_KEY;
    const cinetpaySiteId = process.env.CINETPAY_SITE_ID;
    const origin = request.headers.get('origin') || `http://${request.headers.get('host')}`;
    const callbackUrl = `${origin}/success`;

    // Si les clés CinetPay sont définies, faire un appel réel à l'API CinetPay (V2)
    if (cinetpayApiKey && cinetpaySiteId) {
      try {
        const response = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            apikey: cinetpayApiKey,
            site_id: cinetpaySiteId,
            transaction_id: reference,
            amount: total,
            currency: 'XOF',
            alternative_currency: '',
            description: `Commande ${reference} - BAYA SHOP`,
            customer_name: customer.lastName,
            customer_surname: customer.firstName,
            customer_email: customer.email,
            customer_phone_number: customer.phone,
            customer_address: customer.address,
            customer_city: customer.city,
            customer_country: 'CI',
            customer_state: 'Abidjan',
            customer_zip_code: '00225',
            notify_url: `${origin}/api/payment/cinetpay-webhook`,
            return_url: callbackUrl,
            channels: 'ALL'
          })
        });

        if (response.ok) {
          const paymentData = await response.json();
          if (paymentData.code === '201') {
            const redirectUrl = paymentData.data.payment_url;
            return NextResponse.json({ success: true, redirectUrl, realGateway: true });
          }
        }
      } catch (err) {
        console.error('Erreur lors de l\'appel API CinetPay réel:', err);
        // Fallback en cas d'erreur API
      }
    }

    // FALLBACK : Mode Simulation Interactive (si pas de clés CinetPay .env)
    const sandboxUrl = `${origin}/payment-sandbox?gateway=cinetpay&ref=${reference}&amount=${total}&email=${encodeURIComponent(customer.email)}&name=${encodeURIComponent(customer.firstName + ' ' + customer.lastName)}`;
    
    return NextResponse.json({ 
      success: true, 
      redirectUrl: sandboxUrl,
      realGateway: false,
      message: 'Redirection vers la passerelle de test CinetPay (Clé API non configurée).'
    });

  } catch (error) {
    console.error('Erreur dans l\'API de paiement CinetPay:', error);
    return NextResponse.json({ error: 'Erreur lors de la préparation du paiement.' }, { status: 500 });
  }
}
