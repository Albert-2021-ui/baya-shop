import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DELETE /api/orders/[id] - Supprimer une commande
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);

    await prisma.order.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande:', error);
    return NextResponse.json({ error: 'Impossible de supprimer la commande.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
