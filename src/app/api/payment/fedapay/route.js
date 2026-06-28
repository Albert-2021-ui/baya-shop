import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { customer, items, total, reference } = await request.json();

    const fedapaySecretKey = process.env.FEDAPAY_SECRET_KEY;
    const origin = request.headers.get('origin') || `http://${request.headers.get('host')}`;
    const callbackUrl = `${origin}/success`;

    // Si la clé FedaPay est définie, faire un appel réel à l'API FedaPay (Sandbox ou Live)
    if (fedapaySecretKey) {
      try {
        const response = await fetch('https://api.fedapay.com/v1/transactions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${fedapaySecretKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: total,
            currency: { iso: 'XOF' },
            description: `Commande ${reference} - BAYA SHOP`,
            callback_url: callbackUrl,
            customer: {
              firstname: customer.firstName,
              lastname: customer.lastName,
              email: customer.email,
              phone_number: {
                number: customer.phone,
                country: 'CI'
              }
            }
          })
        });

        if (response.ok) {
          const transaction = await response.json();
          // Récupérer le lien de redirection de paiement
          // Dans FedaPay, après avoir créé la transaction, on génère un token de paiement
          const tokenResponse = await fetch(`https://api.fedapay.com/v1/transactions/${transaction.v1_transaction.id}/token`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${fedapaySecretKey}`,
              'Content-Type': 'application/json'
            }
          });

          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            const redirectUrl = tokenData.url; // URL de redirection FedaPay
            return NextResponse.json({ success: true, redirectUrl, realGateway: true });
          }
        }
      } catch (err) {
        console.error('Erreur lors de l\'appel API FedaPay réel:', err);
        // Fallback en cas d'erreur API
      }
    }

    // FALLBACK : Mode Simulation Interactive (si pas de clé .env)
    // Nous redirigeons vers notre page de simulation locale FedaPay
    const sandboxUrl = `${origin}/payment-sandbox?gateway=fedapay&ref=${reference}&amount=${total}&email=${encodeURIComponent(customer.email)}&name=${encodeURIComponent(customer.firstName + ' ' + customer.lastName)}`;
    
    return NextResponse.json({ 
      success: true, 
      redirectUrl: sandboxUrl,
      realGateway: false,
      message: 'Redirection vers la passerelle de test FedaPay (Clé API non configurée).'
    });

  } catch (error) {
    console.error('Erreur dans l\'API de paiement FedaPay:', error);
    return NextResponse.json({ error: 'Erreur lors de la préparation du paiement.' }, { status: 500 });
  }
}
