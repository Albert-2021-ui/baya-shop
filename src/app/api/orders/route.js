import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'src', 'data', 'orders.json');

// GET /api/orders - Récupérer toutes les commandes
export async function GET() {
  try {
    let orders = [];
    try {
      const data = await fs.readFile(filePath, 'utf8');
      orders = JSON.parse(data);
    } catch (e) {
      // Si le fichier n'existe pas, retourner un tableau vide
      orders = [];
    }
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Erreur lors de la lecture des commandes:', error);
    return NextResponse.json({ error: 'Impossible de charger les commandes.' }, { status: 500 });
  }
}

// PUT /api/orders - Modifier le statut d'une commande
export async function PUT(request) {
  try {
    const { orderId, newStatus } = await request.json();
    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 });
    }

    const data = await fs.readFile(filePath, 'utf8');
    const orders = JSON.parse(data);
    
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Commande non trouvée.' }, { status: 404 });
    }

    // Mettre à jour le statut
    orders[orderIndex].status = newStatus;
    
    await fs.writeFile(filePath, JSON.stringify(orders, null, 2), 'utf8');
    
    return NextResponse.json({ success: true, order: orders[orderIndex] });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
    return NextResponse.json({ error: 'Impossible de mettre à jour la commande.' }, { status: 500 });
  }
}
