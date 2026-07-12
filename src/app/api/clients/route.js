import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ordersFilePath = path.join(process.cwd(), 'src', 'data', 'orders.json');

// GET /api/clients - Liste consolidée des clients extraits des commandes
export async function GET() {
  try {
    let orders = [];
    try {
      const data = await fs.readFile(ordersFilePath, 'utf8');
      orders = JSON.parse(data);
    } catch (e) {
      // Fichier vide ou inexistant
      return NextResponse.json([]);
    }

    // Consolider les clients uniques par email
    const clientsMap = {};

    orders.forEach((order) => {
      if (!order.customer || !order.customer.email) return;

      const email = order.customer.email.toLowerCase().trim();
      const orderTotal = order.total || 0;
      const orderDate = order.date || null;
      const isCanceled = order.status === 'canceled';

      if (!clientsMap[email]) {
        clientsMap[email] = {
          firstName: order.customer.firstName || '',
          lastName: order.customer.lastName || '',
          email: email,
          phone: order.customer.phone || '',
          address: order.customer.address || '',
          city: order.customer.city || '',
          totalOrders: 0,
          activeOrders: 0,
          totalSpent: 0,
          lastOrderDate: null,
          firstOrderDate: orderDate,
        };
      }

      const client = clientsMap[email];
      client.totalOrders += 1;

      if (!isCanceled) {
        client.activeOrders += 1;
        client.totalSpent += orderTotal;
      }

      // Mettre à jour le nom/téléphone/adresse avec les données les plus récentes
      if (order.customer.firstName) client.firstName = order.customer.firstName;
      if (order.customer.lastName) client.lastName = order.customer.lastName;
      if (order.customer.phone) client.phone = order.customer.phone;
      if (order.customer.address) client.address = order.customer.address;
      if (order.customer.city) client.city = order.customer.city;

      // Dernière commande
      if (!client.lastOrderDate || (orderDate && new Date(orderDate) > new Date(client.lastOrderDate))) {
        client.lastOrderDate = orderDate;
      }

      // Première commande
      if (!client.firstOrderDate || (orderDate && new Date(orderDate) < new Date(client.firstOrderDate))) {
        client.firstOrderDate = orderDate;
      }
    });

    // Convertir en tableau et trier par montant total dépensé (desc)
    const clientsList = Object.values(clientsMap).sort((a, b) => b.totalSpent - a.totalSpent);

    return NextResponse.json(clientsList);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    return NextResponse.json({ error: 'Impossible de charger les clients.' }, { status: 500 });
  }
}
