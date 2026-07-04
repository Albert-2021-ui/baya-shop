import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT /api/products/[id] - Modifier un produit
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const updatedData = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: updatedData.name,
        description: updatedData.description,
        price: parseFloat(updatedData.price),
        category: updatedData.category,
        image: updatedData.image,
        stock: parseInt(updatedData.stock)
      }
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Erreur lors de la modification du produit:', error);
    return NextResponse.json({ error: 'Impossible de modifier le produit.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/products/[id] - Supprimer un produit
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);

    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    return NextResponse.json({ error: 'Impossible de supprimer le produit.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
