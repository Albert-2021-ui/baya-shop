import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendConfirmationEmail } from '../../../utils/sendEmail';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { orderData } = await request.json();

    // 1. Sauvegarder la commande avec Prisma
    // Déterminer le statut de paiement
    let paymentStatus = 'PENDING';
    if (orderData.payment.method === 'direct_transfer' || orderData.payment.method === 'bank_transfer') {
      paymentStatus = 'PENDING'; // Attente de vérification manuelle
    }

    const finalOrder = await prisma.order.create({
      data: {
        reference: orderData.payment.reference,
        customerName: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
        customerEmail: orderData.customer.email,
        customerPhone: orderData.customer.phone,
        customerAddress: orderData.customer.address,
        customerCity: orderData.customer.city,
        total: parseFloat(orderData.total),
        paymentMethod: orderData.payment.method,
        paymentStatus: paymentStatus,
        transactionId: orderData.payment.details || null,
        status: orderData.status || 'PROCESSING',
        items: {
          create: orderData.items.map(item => ({
            productId: item.id,
            name: item.name,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity)
          }))
        }
      },
      include: {
        items: true
      }
    });

    // 2. Déduire le stock des produits
    try {
      const items = orderData.items || [];
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: parseInt(item.quantity)
            }
          }
        });
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour des stocks:", err);
    }

    // 3. Envoyer l'e-mail (uniquement si ce n'est pas un transfert manuel, ou si l'utilisateur veut quand même un mail d'attente)
    // Pour les virements et momo directs, on peut envoyer un email "Commande en attente de validation"
    try {
      // Re-formater l'objet pour qu'il soit compatible avec l'ancienne fonction d'email
      const emailOrderData = {
        ...orderData,
        date: finalOrder.createdAt.toISOString(),
      };
      await sendConfirmationEmail(emailOrderData);
    } catch (emailErr) {
      console.error(
        "Erreur lors de la tentative d'envoi d'email:",
        emailErr
      );
    }

    // Formater la réponse pour correspondre à l'attente du front-end
    return NextResponse.json({
      success: true,
      order: {
        ...orderData,
        id: finalOrder.id,
        date: finalOrder.createdAt.toISOString()
      },
    });

  } catch (error) {
    console.error("Erreur dans l'API de Checkout:", error);

    return NextResponse.json(
      { error: "Erreur lors du traitement de la commande." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
