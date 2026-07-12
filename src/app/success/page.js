'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import { useTranslation } from '../../hooks/useTranslation';
import { formatPrice } from '../../utils/formatPrice';
import styles from './page.module.css';

export default function SuccessPage() {
  const [order, setOrder] = useState(null);
  const [mounted, setMounted] = useState(false);
  const { t, lang } = useTranslation();

  useEffect(() => {
    setMounted(true);
    const savedOrder = localStorage.getItem('last_completed_order');
    if (savedOrder) {
      try {
        setOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.error('Erreur lors du chargement de la commande:', e);
      }
    }
  }, []);

  if (!mounted) {
    return null;
  }

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Génération du reçu PDF avec jsPDF
  const generatePDF = () => {
    if (!order) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 1. En-tête de la facture / Couleurs & Design
    doc.setFillColor(8, 11, 26); // Couleur sombre du site
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
    doc.setTextColor(255, 122, 0); // Orange primaire
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(lang === 'fr' ? 'FACTURE' : 'INVOICE', 150, 25);

    // Infos Commande & Vendeur
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(lang === 'fr' ? 'Émetteur :' : 'Issuer:', 20, 52);
    doc.setFont('helvetica', 'normal');
    doc.text('BAYA SHOP', 20, 58);
    doc.text('Djougou, Bénin', 20, 63);
    doc.text('Support: eugenebaya6@gmail.com', 20, 68);

    doc.setFont('helvetica', 'bold');
    doc.text(lang === 'fr' ? 'Facture N° :' : 'Invoice No:', 110, 52);
    doc.text('Date :', 110, 58);
    doc.text(lang === 'fr' ? 'Mode de Paiement :' : 'Payment Method:', 110, 63);
    
    doc.setFont('helvetica', 'normal');
    doc.text(order.payment.reference || 'N/A', 150, 52);
    doc.text(new Date(order.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US'), 150, 58);
    
    const paymentMethodLabel = {
      fedapay: 'FedaPay (Mobile Money / Carte)',
      cinetpay: 'CinetPay (Mobile Money / Carte)',
      direct_transfer: `Transfert Direct Mobile Money (${order.payment.provider || ''})`,
      bank_transfer: lang === 'fr' ? 'Virement Bancaire' : 'Bank Transfer',
      momo: `Mobile Money (${(order.payment.provider || '').toUpperCase()})`,
      card: lang === 'fr' ? 'Carte Bancaire' : 'Credit Card',
    };
    const paymentLabel = paymentMethodLabel[order.payment.method] || order.payment.method || 'N/A';
    doc.text(paymentLabel, 150, 63);

    // Séparateur
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 75, 190, 75);

    // 2. Infos Client
    doc.setFont('helvetica', 'bold');
    doc.text(lang === 'fr' ? 'Facturé à :' : 'Billed to:', 20, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(`${order.customer.firstName} ${order.customer.lastName}`, 20, 91);
    doc.text(order.customer.email, 20, 96);
    doc.text(order.customer.phone, 20, 101);
    doc.text(`${order.customer.address}, ${order.customer.city}`, 20, 106);

    // Tampon "PAYÉ" en vert
    const isPending = order.status === 'pending_verification';
    const stampText = isPending ? (lang === 'fr' ? 'EN ATTENTE' : 'PENDING') : (lang === 'fr' ? 'PAYÉ' : 'PAID');
    const stampColor = isPending ? [245, 158, 11] : [16, 185, 129];
    
    doc.setDrawColor(stampColor[0], stampColor[1], stampColor[2]);
    doc.setLineWidth(1);
    doc.rect(145, 82, 40, 15);
    doc.setTextColor(stampColor[0], stampColor[1], stampColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(stampText, 165 - (stampText.length * 1.5), 91);
    doc.setLineWidth(0.2); // Reset

    // 3. Tableau des articles
    doc.setFillColor(245, 245, 247);
    doc.rect(20, 115, 170, 8, 'F');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(lang === 'fr' ? 'Description de l\'article' : 'Item description', 22, 120);
    doc.text(lang === 'fr' ? 'Qté' : 'Qty', 120, 120);
    doc.text(lang === 'fr' ? 'Prix unitaire' : 'Unit price', 140, 120);
    doc.text('Total', 170, 120);

    let yOffset = 129;
    doc.setFont('helvetica', 'normal');
    
    order.items.forEach((item) => {
      const itemName = item.name.length > 40 ? item.name.slice(0, 38) + '...' : item.name;
      doc.text(itemName, 22, yOffset);
      doc.text(item.quantity.toString(), 122, yOffset);
      doc.text(formatPrice(item.price), 140, yOffset);
      doc.text(formatPrice(item.price * item.quantity), 170, yOffset);
      
      // Ligne de séparation d'article
      doc.setDrawColor(240, 240, 240);
      doc.line(20, yOffset + 3, 190, yOffset + 3);
      yOffset += 10;
    });

    // 4. Résumé financier
    yOffset += 5;
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(lang === 'fr' ? 'Sous-total :' : 'Subtotal:', 130, yOffset);
    doc.text(formatPrice(order.subtotal), 170, yOffset);
    
    yOffset += 6;
    doc.text(lang === 'fr' ? 'Livraison :' : 'Shipping:', 130, yOffset);
    doc.text(order.shippingFee === 0 ? (lang === 'fr' ? 'Gratuit' : 'Free') : formatPrice(order.shippingFee), 170, yOffset);

    yOffset += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(lang === 'fr' ? 'Montant Total :' : 'Total Amount:', 130, yOffset);
    doc.text(formatPrice(order.total), 170, yOffset);

    // 5. Pied de page
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'italic');
    doc.text(lang === 'fr' ? 'Merci de votre confiance pour votre achat chez BAYA SHOP.' : 'Thank you for your purchase at BAYA SHOP.', 105, 275, null, null, 'center');
    doc.text(lang === 'fr' ? 'Ceci est une facture acquittée électroniquement.' : 'This is an electronically certified receipt.', 105, 280, null, null, 'center');

    // Sauvegarde du fichier
    doc.save(`Facture_${order.payment.reference}.pdf`);
  };

  return (
    <div className="container">
      <div className={`${styles.successLayout} glass-card`}>
        <span className={styles.successIcon}>✅</span>
        <h1 className={`${styles.successTitle} gradient-text`}>
          {(t.thanksSuccess || 'Merci {name}, Commande Validée !').replace('{name}', order?.customer?.firstName ? order.customer.firstName : '')}
        </h1>
        <p className={styles.successText}>
          {t.successDescription || 'Votre paiement a été traité avec succès. Un e-mail de confirmation contenant votre quittance a été généré. Vous pouvez également la télécharger ci-dessous.'}
        </p>

        {order ? (
          <div className={`${styles.orderDetailsCard} glass-card`}>
            <h3 className={styles.detailsHeader}>{t.transactionSummary || 'Récapitulatif de la transaction'}</h3>
            
            <div className={styles.infoRow}>
              <span>{t.orderRefLabel || 'Référence de commande :'}</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{order.payment.reference}</span>
            </div>

            <div className={styles.infoRow}>
              <span>{t.clientLabel || 'Client :'}</span>
              <span>{order.customer.firstName} {order.customer.lastName}</span>
            </div>

            <div className={styles.infoRow}>
              <span>{t.confirmEmailLabel || 'E-mail de confirmation :'}</span>
              <span>{order.customer.email}</span>
            </div>

            <div className={styles.infoRow}>
              <span>{t.transactionDateLabel || 'Date de transaction :'}</span>
              <span>{formatDate(order.date)}</span>
            </div>

            <div className={styles.infoRow}>
              <span>{t.paymentMethodLabel || 'Mode de paiement :'}</span>
              <span>
                {(() => {
                  const methods = {
                    fedapay: 'FedaPay (Mobile Money / Carte)',
                    cinetpay: 'CinetPay (Mobile Money / Carte)',
                    direct_transfer: `Transfert Direct Mobile Money${order.payment.provider ? ' — ' + order.payment.provider.replace('transfert_direct_', '') : ''}`,
                    bank_transfer: lang === 'fr' ? 'Virement Bancaire' : 'Bank Transfer',
                    momo: `Mobile Money (${(order.payment.provider || '').toUpperCase()})`,
                    card: lang === 'fr' ? 'Carte Bancaire' : 'Credit Card',
                  };
                  return methods[order.payment.method] || order.payment.method || 'N/A';
                })()}
              </span>
            </div>

            <div className={styles.itemsSummary}>
              <div style={{ fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                {t.orderedItemsLabel || 'Articles commandés :'}
              </div>
              {order.items.map((item) => (
                <div key={item.id} className={styles.summaryItemLine}>
                  <span>{item.name} (x{item.quantity})</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className={styles.infoRowStrong}>
              <span>{t.totalPaid || 'Total payé'}</span>
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
            {t.downloadInvoiceBtn || '📥 Télécharger la Facture PDF'}
          </button>
          
          <Link href="/">
            <button className={`${styles.actionBtn} gradient-button ${styles.backHomeBtn}`}>
              {t.continueShoppingBtn || 'Continuer mes Achats'}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
