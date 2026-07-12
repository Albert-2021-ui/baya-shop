import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ordersFilePath = path.join(process.cwd(), 'src', 'data', 'orders.json');

// DELETE /api/orders/[id] - Supprimer une commande
export async function DELETE(request, { params }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide.' }, { status: 400 });
    }

    // Lire les commandes depuis le fichier JSON
    let orders = [];
    try {
      const data = await fs.readFile(ordersFilePath, 'utf8');
      orders = JSON.parse(data);
    } catch (e) {
      return NextResponse.json({ error: 'Fichier de commandes introuvable.' }, { status: 404 });
    }

    const orderIndex = orders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Commande non trouvée.' }, { status: 404 });
    }

    // Supprimer la commande du tableau
    orders.splice(orderIndex, 1);

    // Réécrire le fichier JSON
    await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande:', error);
    return NextResponse.json({ error: 'Impossible de supprimer la commande.' }, { status: 500 });
  }
}
