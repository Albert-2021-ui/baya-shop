'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import { useCart } from '../../context/CartContext';
import styles from './page.module.css';

export default function SuccessPage() {
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vider le panier automatiquement après un paiement réussi
    clearCart();

    try {
      const savedOrder = localStorage.getItem('last_completed_order');
      if (savedOrder) {
        setOrder(JSON.parse(savedOrder));
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la commande :', error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('XOF', 'FCFA');
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Génération du reçu PDF avec jsPDF (côté client)
  const generatePDF = () => {
    if (!order) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 1. En-tête de la facture / Couleurs & Design
    doc.setFillColor(8, 11, 26);
    doc.rect(0, 0, 210, 40, 'F');

    // Logo & Nom
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('BAYA SHOP', 20, 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text('Boutique E-commerce Premium', 20, 32);

    // Titre FACTURE à droite
    doc.setTextColor(255, 122, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('FACTURE', 150, 25);

    // Infos Commande & Vendeur
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Émetteur :', 20, 52);
    doc.setFont('helvetica', 'normal');
    doc.text('BAYA SHOP', 20, 58);
    doc.text('Djougou, Bénin', 20, 63);
    doc.text('Contact: eugenebaya6@gmail.com', 20, 68);

    doc.setFont('helvetica', 'bold');
    doc.text('Facture N° :', 110, 52);
    doc.text('Date :', 110, 58);
    doc.text('Mode de Paiement :', 110, 63);

    doc.setFont('helvetica', 'normal');
    doc.text(order?.payment?.reference || 'N/A', 150, 52);
    doc.text(new Date(order.date).toLocaleDateString('fr-FR'), 150, 58);

    let paymentLabel = 'Carte Bancaire';
    if (order?.payment?.method === 'momo') {
      paymentLabel = `Mobile Money (${order?.payment?.provider?.toUpperCase() || ''})`;
    } else if (order?.payment?.method === 'direct_transfer') {
      paymentLabel = `Transfert Direct MM`;
    } else if (order?.payment?.method === 'bank_transfer') {
      paymentLabel = 'Virement Bancaire';
    }
    doc.text(paymentLabel, 150, 63);

    // Séparateur
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 75, 190, 75);

    // 2. Infos Client
    doc.setFont('helvetica', 'bold');
    doc.text('Facturé à :', 20, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(`${order?.customer?.firstName || ''} ${order?.customer?.lastName || ''}`, 20, 91);
    doc.text(order?.customer?.email || '', 20, 96);
    doc.text(order?.customer?.phone || '', 20, 101);
    doc.text(`${order?.customer?.address || ''}, ${order?.customer?.city || ''}`, 20, 106);

    // Tampon "PAYÉ" ou "EN ATTENTE" 
    const isPending = order?.status === 'pending_verification';
    if (isPending) {
      doc.setDrawColor(255, 122, 0);
      doc.setLineWidth(1);
      doc.rect(138, 82, 50, 15);
      doc.setTextColor(255, 122, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('EN ATTENTE', 143, 92);
    } else {
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(1);
      doc.rect(145, 82, 40, 15);
      doc.setTextColor(16, 185, 129);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('PAYÉ', 157, 92);
    }
    doc.setLineWidth(0.2);

    // 3. Tableau des articles
    doc.setFillColor(245, 245, 247);
    doc.rect(20, 115, 170, 8, 'F');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text("Description de l'article", 22, 120);
    doc.text('Qté', 120, 120);
    doc.text('Prix unitaire', 140, 120);
    doc.text('Total', 170, 120);

    let yOffset = 129;
    doc.setFont('helvetica', 'normal');

    order?.items?.forEach((item) => {
      const itemName = item.name.length > 40 ? item.name.slice(0, 38) + '...' : item.name;
      doc.text(itemName, 22, yOffset);
      doc.text(item.quantity.toString(), 122, yOffset);
      doc.text(formatPrice(item.price), 140, yOffset);
      doc.text(formatPrice(item.price * item.quantity), 170, yOffset);

      doc.setDrawColor(240, 240, 240);
      doc.line(20, yOffset + 3, 190, yOffset + 3);
      yOffset += 10;
    });

    // 4. Résumé financier
    yOffset += 5;
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('Sous-total :', 130, yOffset);
    doc.text(formatPrice(order.subtotal), 170, yOffset);

    yOffset += 6;
    doc.text('Livraison :', 130, yOffset);
    doc.text(order.shippingFee === 0 ? 'Gratuit' : formatPrice(order.shippingFee), 170, yOffset);

    yOffset += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Montant Total :', 130, yOffset);
    doc.text(formatPrice(order.total), 170, yOffset);

    // 5. Pied de page
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'italic');
    doc.text('Merci de votre confiance pour votre achat chez BAYA SHOP.', 105, 275, null, null, 'center');
    doc.text('Ceci est une facture acquittée électroniquement.', 105, 280, null, null, 'center');

    // Sauvegarde du fichier
    doc.save(`Facture_${order?.payment?.reference}.pdf`);
  };

  if (loading) {
    return (
      <div className="container">
        <div className={`${styles.successLayout} glass-card`}>
          <p>Chargement des détails de la commande...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={`${styles.successLayout} glass-card`}>
        <span className={styles.successIcon}>✅</span>
        <h1 className={`${styles.successTitle} gradient-text`}>
          {order?.customer?.firstName || ''}, Commande Validée !
        </h1>
        <p className={styles.successText}>
          Votre paiement a été traité avec succès. Un e-mail de confirmation contenant votre quittance a été envoyé à <strong>{order?.customer?.email || ''}</strong>. Vous pouvez également la télécharger ci-dessous.
        </p>

        {order ? (
          <div className={`${styles.orderDetailsCard} glass-card`}>
            <h3 className={styles.detailsHeader}>Récapitulatif de la transaction</h3>

            <div className={styles.infoRow}>
              <span>Référence de commande :</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{order?.payment?.reference}</span>
            </div>

            <div className={styles.infoRow}>
              <span>Client :</span>
              <span>{order.customer?.firstName} {order?.customer?.lastName}</span>
            </div>

            <div className={styles.infoRow}>
              <span>E-mail de confirmation :</span>
              <span>{order?.customer?.email}</span>
            </div>

            <div className={styles.infoRow}>
              <span>Date de transaction :</span>
              <span>{formatDate(order.date)}</span>
            </div>

            <div className={styles.infoRow}>
              <span>Mode de paiement :</span>
              <span>
                {order?.payment?.method === 'momo'
                  ? `Mobile Money (${order?.payment?.provider?.toUpperCase()})`
                  : order?.payment?.method === 'direct_transfer'
                  ? 'Transfert Direct Mobile Money'
                  : order?.payment?.method === 'bank_transfer'
                  ? 'Virement Bancaire'
                  : 'Carte Bancaire'}
              </span>
            </div>

            <div className={styles.itemsSummary}>
              <div style={{ fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                Articles commandés :
              </div>
              {order?.items?.map((item) => (
                <div key={item.id} className={styles.summaryItemLine}>
                  <span>{item.name} (x{item.quantity})</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className={styles.infoRowStrong}>
              <span>Total payé</span>
              <span style={{ color: 'var(--primary)' }}>{formatPrice(order.total)}</span>
            </div>
          </div>
        ) : (
          <div className={`${styles.orderDetailsCard} glass-card`}>
            <p style={{ color: 'var(--text-secondary)' }}>Aucun détail de commande disponible.</p>
          </div>
        )}

        <div className={styles.btnGroup}>
          <button
            onClick={generatePDF}
            disabled={!order}
            className={`${styles.actionBtn} ${styles.downloadInvoiceBtn}`}
          >
            📥 Télécharger la Facture PDF
          </button>

          <Link href="/">
            <button className={`${styles.actionBtn} gradient-button ${styles.backHomeBtn}`}>
              Continuer mes Achats
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
