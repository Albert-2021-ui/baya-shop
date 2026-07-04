import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/orders - Récupérer toutes les commandes
export async function GET() {
  try {
    const dbOrders = await prisma.order.findMany({
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformer le format de la DB vers le format attendu par le frontend (legacy json)
    const orders = dbOrders.map(order => {
      // Reconstruire subtotal et shippingFee
      const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const shippingFee = order.total - subtotal;
      
      return {
        id: order.id,
        status: order.status,
        date: order.createdAt.toISOString(),
        total: order.total,
        subtotal: subtotal,
        shippingFee: shippingFee,
        customer: {
          firstName: order.customerName.split(' ')[0] || '',
          lastName: order.customerName.split(' ').slice(1).join(' ') || '',
          email: order.customerEmail,
          phone: order.customerPhone,
          address: order.customerAddress,
          city: order.customerCity
        },
        payment: {
          reference: order.reference,
          method: order.paymentMethod,
          provider: order.paymentMethod === 'direct_transfer' ? 'transfert_direct' : order.paymentMethod,
          details: order.transactionId,
          phone: order.paymentMethod === 'direct_transfer' ? order.transactionId : null // Approximation
        },
        items: order.items.map(item => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Erreur lors de la lecture des commandes:', error);
    return NextResponse.json({ error: 'Impossible de charger les commandes.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/orders - Modifier le statut d'une commande
export async function PUT(request) {
  try {
    const { orderId, newStatus } = await request.json();
    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        status: newStatus,
        paymentStatus: newStatus === 'delivered' ? 'PAID' : undefined // Si livré/validé, c'est payé
      }
    });
    
    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
    return NextResponse.json({ error: 'Impossible de mettre à jour la commande.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
