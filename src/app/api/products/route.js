import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'src', 'data', 'products.json');

// GET /api/products - Récupérer tous les produits
export async function GET() {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const products = JSON.parse(data);
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
    
    // Lire la base existante
    const data = await fs.readFile(filePath, 'utf8');
    const products = JSON.parse(data);
    
    // Assigner un ID auto-incrémenté
    const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    
    const productToAdd = {
      id: nextId,
      name: newProduct.name || 'Produit sans nom',
      description: newProduct.description || '',
      price: parseFloat(newProduct.price) || 0,
      category: newProduct.category || 'Général',
      image: newProduct.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      rating: 5.0,
      stock: parseInt(newProduct.stock) || 10
    };
    
    products.push(productToAdd);
    
    // Sauvegarder dans le fichier
    await fs.writeFile(filePath, JSON.stringify(products, null, 2), 'utf8');
    
    return NextResponse.json({ success: true, product: productToAdd });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du produit:', error);
    return NextResponse.json({ error: 'Impossible d\'ajouter le produit.' }, { status: 500 });
  }
}
