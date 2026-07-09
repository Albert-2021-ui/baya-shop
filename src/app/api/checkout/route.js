import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { sendConfirmationEmail } from '../../../utils/sendEmail';

const ordersFilePath = path.join(process.cwd(), 'src', 'data', 'orders.json');
const productsFilePath = path.join(process.cwd(), 'src', 'data', 'products.json');

export async function POST(request) {
  try {
    const orderData = await request.json();
    
    // 1. Lire et enregistrer la commande dans src/data/orders.json
    let orders = [];
    try {
      const ordersData = await fs.readFile(ordersFilePath, 'utf8');
      orders = JSON.parse(ordersData);
    } catch (e) {
      // Si le fichier n'existe pas encore, on l'initialise
      await fs.writeFile(ordersFilePath, JSON.stringify([], null, 2), 'utf8');
    }
    
    // Attribuer un ID de commande
    const nextOrderId = orders.length > 0 ? Math.max(...orders.map(o => o.id || 0)) + 1 : 1;
    const finalOrder = {
      id: nextOrderId,
      status: 'pending', // pending, processing, shipped, delivered, canceled
      ...orderData,
      date: new Date().toISOString()
    };
    
    orders.push(finalOrder);
    await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
    
    // 2. Déduire le stock des produits achetés dans src/data/products.json
    try {
      const productsData = await fs.readFile(productsFilePath, 'utf8');
      const products = JSON.parse(productsData);
      
      for (const item of finalOrder.items) {
        const productIndex = products.findIndex(p => p.id === item.id);
        if (productIndex !== -1) {
          // Déduire la quantité, sans descendre en dessous de 0
          products[productIndex].stock = Math.max(0, products[productIndex].stock - item.quantity);
        }
      }
      
      await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), 'utf8');
    } catch (err) {
      console.error('Erreur lors de la mise à jour des stocks:', err);
      // On continue quand même la commande même si le stock échoue
    }

    // 3. Envoyer l'e-mail de confirmation directement
    try {
      await sendConfirmationEmail(finalOrder);
    } catch (emailErr) {
      console.error('Erreur lors de la tentative d\'envoi d\'email:', emailErr);
    }
    
    return NextResponse.json({ success: true, order: finalOrder });
  } catch (error) {
    console.error('Erreur dans l\'API de Checkout:', error);
    return NextResponse.json({ error: 'Erreur lors du traitement de la commande.' }, { status: 500 });
  }
}
