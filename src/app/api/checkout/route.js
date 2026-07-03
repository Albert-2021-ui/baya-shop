import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { sendConfirmationEmail } from '../../../utils/sendEmail';

const ordersFilePath = path.join(process.cwd(), 'src', 'data', 'orders.json');
const productsFilePath = path.join(process.cwd(), 'src', 'data', 'products.json');


export async function POST(request) {
  try {
    const { orderData } = await request.json();

    // 1. Lire et enregistrer la commande dans orders.json
    let orders = [];

    try {
      const ordersData = await fs.readFile(ordersFilePath, "utf8");
      orders = JSON.parse(ordersData);
    } catch (e) {
      await fs.writeFile(
        ordersFilePath,
        JSON.stringify([], null, 2),
        "utf8"
      );
    }

    // 2. Créer la commande finale
    const nextOrderId =
      orders.length > 0
        ? Math.max(...orders.map((o) => o.id || 0)) + 1
        : 1;
   
    const finalOrder = {
      id: nextOrderId,
      status: "pending",
      ...orderData,
      date: new Date().toISOString(),
    };

    orders.push(finalOrder);

    await fs.writeFile(
      ordersFilePath,
      JSON.stringify(orders, null, 2),
      "utf8"
    );

    // 3. Déduire le stock des produits
    try {
      const productsData = await fs.readFile(productsFilePath, "utf8");
      const products = JSON.parse(productsData);

      const items = finalOrder?.items || [];

      for (const item of items) {
        const productIndex = products.findIndex(
          (p) => p.id === item.id
        );

        if (productIndex !== -1) {
          products[productIndex].stock = Math.max(
            0,
            products[productIndex].stock - item.quantity
          );
        }
      }

      await fs.writeFile(
        productsFilePath,
        JSON.stringify(products, null, 2),
        "utf8"
      );
    } catch (err) {
      console.error("Erreur lors de la mise à jour des stocks:", err);
    }

    // 4. Envoyer l'e-mail
    try {
      await sendConfirmationEmail(finalOrder);
    } catch (emailErr) {
      console.error(
        "Erreur lors de la tentative d'envoi d'email:",
        emailErr
      );
    }

    return NextResponse.json({
      success: true,
      order: finalOrder,
    });

  } catch (error) {
    console.error("Erreur dans l'API de Checkout:", error);

    return NextResponse.json(
      { error: "Erreur lors du traitement de la commande." },
      { status: 500 }
    );
  }
}

