import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Génère un PDF de facture/quittance pour une commande donnée.
 * Utilise pdf-lib (côté serveur, pas de DOM nécessaire).
 * @param {Object} order - L'objet commande complet
 * @returns {Promise<Buffer>} - Le buffer PDF prêt à être utilisé comme pièce jointe
 */
export async function generateInvoicePDF(order) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 en points
  const { width, height } = page.getSize();

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Couleurs
  const darkBg = rgb(8 / 255, 11 / 255, 26 / 255);
  const orange = rgb(255 / 255, 122 / 255, 0 / 255);
  const white = rgb(1, 1, 1);
  const gray = rgb(0.35, 0.35, 0.35);
  const lightGray = rgb(0.6, 0.6, 0.6);
  const veryLightGray = rgb(0.92, 0.92, 0.94);
  const green = rgb(16 / 255, 185 / 255, 129 / 255);
  const black = rgb(0, 0, 0);

  const margin = 56; // ~20mm
  const contentWidth = width - margin * 2;

  // Formateur de prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('XOF', 'FCFA');
  };

  // ============================================================
  // 1. EN-TÊTE (bande sombre)
  // ============================================================
  const headerHeight = 113; // ~40mm
  page.drawRectangle({
    x: 0,
    y: height - headerHeight,
    width: width,
    height: headerHeight,
    color: darkBg,
  });

  // Logo texte "BAYA SHOP"
  page.drawText('BAYA SHOP', {
    x: margin,
    y: height - 70,
    size: 22,
    font: helveticaBold,
    color: white,
  });

  page.drawText('Boutique E-commerce Premium', {
    x: margin,
    y: height - 90,
    size: 9,
    font: helvetica,
    color: rgb(0.7, 0.7, 0.7),
  });

  // Titre "FACTURE" à droite
  page.drawText('FACTURE', {
    x: width - margin - helveticaBold.widthOfTextAtSize('FACTURE', 18),
    y: height - 70,
    size: 18,
    font: helveticaBold,
    color: orange,
  });

  // Barre orange sous l'en-tête
  page.drawRectangle({
    x: 0,
    y: height - headerHeight - 3,
    width: width,
    height: 3,
    color: orange,
  });

  // ============================================================
  // 2. INFORMATIONS ÉMETTEUR & COMMANDE
  // ============================================================
  let yPos = height - headerHeight - 40;

  // Émetteur (gauche)
  page.drawText('Émetteur :', { x: margin, y: yPos, size: 10, font: helveticaBold, color: gray });
  page.drawText('BAYA SHOP', { x: margin, y: yPos - 16, size: 10, font: helvetica, color: gray });
  page.drawText('Djougou, Bénin', { x: margin, y: yPos - 30, size: 10, font: helvetica, color: gray });
  page.drawText('Contact: eugenebaya6@gmail.com', { x: margin, y: yPos - 44, size: 10, font: helvetica, color: gray });

  // Infos commande (droite)
  const rightCol = width - margin - 200;
  page.drawText('Facture N° :', { x: rightCol, y: yPos, size: 10, font: helveticaBold, color: gray });
  page.drawText(order?.payment?.reference || 'N/A', { x: rightCol + 110, y: yPos, size: 10, font: helvetica, color: gray });

  page.drawText('Date :', { x: rightCol, y: yPos - 16, size: 10, font: helveticaBold, color: gray });
  const dateStr = order?.date ? new Date(order.date).toLocaleDateString('fr-FR') : 'N/A';
  page.drawText(dateStr, { x: rightCol + 110, y: yPos - 16, size: 10, font: helvetica, color: gray });

  page.drawText('Mode de Paiement :', { x: rightCol, y: yPos - 32, size: 10, font: helveticaBold, color: gray });
  let paymentLabel = 'Carte Bancaire';
  if (order?.payment?.method === 'momo') {
    paymentLabel = `Mobile Money (${order?.payment?.provider?.toUpperCase() || ''})`;
  } else if (order?.payment?.method === 'direct_transfer') {
    paymentLabel = `Transfert Direct MM`;
  } else if (order?.payment?.method === 'bank_transfer') {
    paymentLabel = 'Virement Bancaire';
  } else if (order?.payment?.method === 'external_gateway') {
    paymentLabel = `Passerelle (${order?.payment?.provider || ''})`;
  }
  page.drawText(paymentLabel, { x: rightCol + 110, y: yPos - 32, size: 9, font: helvetica, color: gray });

  // Séparateur
  yPos -= 65;
  page.drawLine({
    start: { x: margin, y: yPos },
    end: { x: width - margin, y: yPos },
    thickness: 0.5,
    color: rgb(0.86, 0.86, 0.86),
  });

  // ============================================================
  // 3. INFORMATIONS CLIENT
  // ============================================================
  yPos -= 25;
  page.drawText('Facturé à :', { x: margin, y: yPos, size: 10, font: helveticaBold, color: gray });
  yPos -= 16;
  page.drawText(`${order?.customer?.firstName || ''} ${order?.customer?.lastName || ''}`, { x: margin, y: yPos, size: 10, font: helvetica, color: gray });
  yPos -= 14;
  page.drawText(order?.customer?.email || '', { x: margin, y: yPos, size: 10, font: helvetica, color: gray });
  yPos -= 14;
  page.drawText(order?.customer?.phone || '', { x: margin, y: yPos, size: 10, font: helvetica, color: gray });
  yPos -= 14;
  page.drawText(`${order?.customer?.address || ''}, ${order?.customer?.city || ''}`, { x: margin, y: yPos, size: 10, font: helvetica, color: gray });

  // Tampon PAYÉ / EN ATTENTE (à droite)
  const isPending = order?.status === 'pending_verification';
  const stampText = isPending ? 'EN ATTENTE' : 'PAYÉ';
  const stampColor = isPending ? orange : green;
  const stampWidth = helveticaBold.widthOfTextAtSize(stampText, 14);
  const stampX = width - margin - stampWidth - 24;
  const stampY = yPos + 30;

  page.drawRectangle({
    x: stampX,
    y: stampY - 5,
    width: stampWidth + 24,
    height: 24,
    borderColor: stampColor,
    borderWidth: 1.5,
    color: rgb(1, 1, 1),
  });
  page.drawText(stampText, {
    x: stampX + 12,
    y: stampY + 2,
    size: 14,
    font: helveticaBold,
    color: stampColor,
  });

  // ============================================================
  // 4. TABLEAU DES ARTICLES
  // ============================================================
  yPos -= 35;

  // En-tête du tableau
  page.drawRectangle({
    x: margin,
    y: yPos - 5,
    width: contentWidth,
    height: 22,
    color: veryLightGray,
  });

  const col1 = margin + 6;
  const col2 = margin + 280;
  const col3 = margin + 330;
  const col4 = margin + contentWidth - 50;

  page.drawText("Description de l'article", { x: col1, y: yPos + 2, size: 9, font: helveticaBold, color: gray });
  page.drawText('Qté', { x: col2, y: yPos + 2, size: 9, font: helveticaBold, color: gray });
  page.drawText('Prix unit.', { x: col3, y: yPos + 2, size: 9, font: helveticaBold, color: gray });
  page.drawText('Total', { x: col4, y: yPos + 2, size: 9, font: helveticaBold, color: gray });

  yPos -= 25;

  // Lignes d'articles
  const items = order?.items || [];
  for (const item of items) {
    const itemName = item.name && item.name.length > 45 ? item.name.slice(0, 43) + '...' : (item.name || '');
    page.drawText(itemName, { x: col1, y: yPos, size: 9, font: helvetica, color: gray });
    page.drawText(String(item.quantity || 0), { x: col2 + 5, y: yPos, size: 9, font: helvetica, color: gray });
    page.drawText(formatPrice(item.price || 0), { x: col3, y: yPos, size: 9, font: helvetica, color: gray });
    page.drawText(formatPrice((item.price || 0) * (item.quantity || 0)), { x: col4, y: yPos, size: 9, font: helvetica, color: gray });

    yPos -= 6;
    page.drawLine({
      start: { x: margin, y: yPos },
      end: { x: width - margin, y: yPos },
      thickness: 0.3,
      color: rgb(0.94, 0.94, 0.94),
    });
    yPos -= 18;
  }

  // ============================================================
  // 5. RÉSUMÉ FINANCIER
  // ============================================================
  yPos -= 10;
  const summaryX = width - margin - 180;

  page.drawText('Sous-total :', { x: summaryX, y: yPos, size: 10, font: helvetica, color: lightGray });
  page.drawText(formatPrice(order?.subtotal || 0), { x: summaryX + 120, y: yPos, size: 10, font: helvetica, color: gray });

  yPos -= 18;
  page.drawText('Livraison :', { x: summaryX, y: yPos, size: 10, font: helvetica, color: lightGray });
  page.drawText(
    order?.shippingFee === 0 ? 'Gratuit' : formatPrice(order?.shippingFee || 0),
    { x: summaryX + 120, y: yPos, size: 10, font: helvetica, color: gray }
  );

  yPos -= 22;
  page.drawLine({
    start: { x: summaryX, y: yPos + 10 },
    end: { x: width - margin, y: yPos + 10 },
    thickness: 0.5,
    color: rgb(0.86, 0.86, 0.86),
  });

  page.drawText('Montant Total :', { x: summaryX, y: yPos, size: 11, font: helveticaBold, color: black });
  page.drawText(formatPrice(order?.total || 0), { x: summaryX + 120, y: yPos, size: 11, font: helveticaBold, color: orange });

  // ============================================================
  // 6. PIED DE PAGE
  // ============================================================
  const footerY = 40;
  const footerText1 = 'Merci de votre confiance pour votre achat chez BAYA SHOP.';
  const footerText2 = 'Ceci est une facture acquittée électroniquement.';

  page.drawText(footerText1, {
    x: (width - helvetica.widthOfTextAtSize(footerText1, 8)) / 2,
    y: footerY + 12,
    size: 8,
    font: helvetica,
    color: lightGray,
  });
  page.drawText(footerText2, {
    x: (width - helvetica.widthOfTextAtSize(footerText2, 8)) / 2,
    y: footerY,
    size: 8,
    font: helvetica,
    color: lightGray,
  });

  // Générer les bytes du PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
