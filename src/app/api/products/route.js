import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET /api/products - Récupérer tous les produits
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        id: 'desc'
      }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Erreur lors de la lecture des produits:', error);
    return NextResponse.json({ error: 'Impossible de charger les produits.' }, { status: 500 });
  }
}

// POST /api/products - Ajouter un nouveau produit (Espace Admin)
export async function POST(request) {
  try {
    const newProduct = await request.json();
    
    const productToAdd = await prisma.product.create({
      data: {
        name: newProduct.name || 'Produit sans nom',
        description: newProduct.description || '',
        price: parseFloat(newProduct.price) || 0,
        category: newProduct.category || 'Général',
        image: newProduct.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        rating: parseFloat(newProduct.rating || 5.0),
        stock: parseInt(newProduct.stock) || 10
      }
    });
    
    return NextResponse.json({ success: true, product: productToAdd });
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit:", error);
    return NextResponse.json({ error: "Impossible d'ajouter le produit." }, { status: 500 });
  }
}
