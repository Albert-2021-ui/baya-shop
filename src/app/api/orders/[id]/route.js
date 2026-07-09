import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// DELETE /api/orders/[id] - Supprimer une commande
export async function DELETE(request, { params }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide.' }, { status: 400 });
    }

    // Supprimer d'abord les items liés (au cas où la cascade SQLite ne se déclenche pas)
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande:', error);
    return NextResponse.json({ error: 'Impossible de supprimer la commande.' }, { status: 500 });
  }
}
