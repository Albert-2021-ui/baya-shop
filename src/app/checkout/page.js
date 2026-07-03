'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import styles from './page.module.css';

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart, isLoaded } = useCart();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Formulaire client
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });

  // Mode de paiement sélectionné : fedapay, cinetpay, direct_transfer, bank_transfer
  const [paymentGateway, setPaymentGateway] = useState('fedapay');
  
  // Coordonnées de paiement réelles d'Albert chargées depuis l'API config
  const [config, setConfig] = useState({
    momoNumbers: [],
    bankDetails: { accountName: '', accountNumber: '', bankName: '' }
  });

  // Pour le transfert direct Mobile Money
  const [directMomoDetails, setDirectMomoDetails] = useState({
    operator: 'Orange',
    senderNumber: '',
    transactionRef: ''
  });

  // Pour le virement bancaire
  const [directBankDetails, setDirectBankDetails] = useState({
    bankSenderName: '',
    virementRef: ''
  });

  const [processing, setProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  // Charger la configuration des paiements et pré-remplir avec le profil client
  useEffect(() => {
    setMounted(true);
    
    // 1. Charger les coordonnées d'Albert depuis l'API
    async function loadConfig() {
      try {
        const res = await fetch('/api/payment/config');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des coordonnées d\'Albert:', err);
      }
    }
    loadConfig();

    // 2. Pré-remplir le formulaire si un profil client est enregistré localement (Fidélisation)
    const savedProfile = localStorage.getItem('baya_client_profile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          city: profile.city || '',
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 16px auto' }}></div>
        <p>Chargement du tunnel de commande...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Votre panier est vide.</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '10px 0 20px 0' }}>
          Vous devez ajouter des articles avant de passer commande.
        </p>
        <Link href="/">
          <button className="gradient-button" style={{ padding: '12px 24px', borderRadius: '8px' }}>
            Retour à l'accueil
          </button>
        </Link>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shippingFee = subtotal >= 150000 ? 0 : 2000;
  const total = subtotal + shippingFee;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('XOF', 'FCFA');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Traiter la commande et rediriger / soumettre
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation informations de livraison
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.city) {
      alert('Veuillez remplir toutes les informations de livraison.');
      return;
    }

    // Validation spécifique pour les transferts manuels
    if (paymentGateway === 'direct_transfer' && (!directMomoDetails.senderNumber || !directMomoDetails.transactionRef)) {
      alert('Veuillez entrer le numéro expéditeur et la référence du transfert.');
      return;
    }

    if (paymentGateway === 'bank_transfer' && (!directBankDetails.bankSenderName || !directBankDetails.virementRef)) {
      alert('Veuillez entrer le nom de l\'expéditeur et la référence du virement.');
      return;
    }

    setProcessing(true);

    const orderReference = 'BAYA-' + Math.floor(100000 + Math.random() * 900000);
    
    // 1. Préparer le payload de commande
    const orderPayload = {
      customer: formData,
      items: cart,
      payment: {
        method: paymentGateway,
        amount: total,
        reference: orderReference
      },
      total: total,
      shippingFee: shippingFee,
      subtotal: subtotal,
      date: new Date().toISOString()
    };

    // A. SI PAIEMENT AUTOMATISÉ (FedaPay ou CinetPay) : Redirection
    if (paymentGateway === 'fedapay' || paymentGateway === 'cinetpay') {
      setProcessingMessage('Initialisation de votre espace de paiement sécurisé...');
      
      // Sauvegarder la commande temporairement pour l'écran sandbox
      localStorage.setItem('pending_checkout_order', JSON.stringify(orderPayload));

      try {
        const apiEndpoint = paymentGateway === 'fedapay' ? '/api/payment/fedapay' : '/api/payment/cinetpay';
        const res = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: formData,
            items: cart,
            total: total,
            reference: orderReference
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.redirectUrl) {
            setProcessingMessage(data.realGateway 
              ? 'Connexion sécurisée établie. Redirection...' 
              : 'Redirection vers la passerelle de test locale...');
            setTimeout(() => {
              window.location.href = data.redirectUrl;
            }, 1000);
          } else {
            alert('Erreur lors de l\'initialisation du paiement.');
            setProcessing(false);
          }
        } else {
          alert('Erreur serveur.');
          setProcessing(false);
        }
      } catch (err) {
        console.error(err);
        alert('Erreur réseau.');
        setProcessing(false);
      }
    } 
    // B. SI PAIEMENT DIRECT (Manuel par Mobile Money ou Virement) : Validation immédiate !
    else {
      setProcessingMessage('Enregistrement de votre commande en attente de vérification manuelle...');
      
      // Compléter les détails de paiement avec les références saisies par le client
      if (paymentGateway === 'direct_transfer') {
        orderPayload.payment.provider = `transfert_direct_${directMomoDetails.operator}`;
        orderPayload.payment.phone = directMomoDetails.senderNumber;
        orderPayload.payment.details = `Réf Transfert: ${directMomoDetails.transactionRef}`;
        orderPayload.status = 'pending_verification'; // Spécifique aux commandes en attente de validation
      } else {
        orderPayload.payment.provider = 'virement_bancaire';
        orderPayload.payment.details = `Expéditeur: ${directBankDetails.bankSenderName} | Réf: ${directBankDetails.virementRef}`;
        orderPayload.status = 'pending_verification';
      }

      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderData: orderPayload,
          })
        });

        if (res.ok) {
          const result = await res.json();
          
          // Sauvegarder dans l'historique local du client (Fidélisation)
          let clientHistory = [];
          const savedHistory = localStorage.getItem('baya_customer_orders_history');
          if (savedHistory) {
            try { clientHistory = JSON.parse(savedHistory); } catch(e) {}
          }
          clientHistory.push(result.order);
          localStorage.setItem('baya_customer_orders_history', JSON.stringify(clientHistory));

          // Sauvegarder pour la page success
          localStorage.setItem('last_completed_order', JSON.stringify(result.order));

          clearCart();
          setProcessingMessage('Commande enregistrée avec succès ! Génération de votre quittance...');
          
          setTimeout(() => {
            router.push('/success');
          }, 1500);
        } else {
          alert('Erreur lors de la validation de la commande.');
          setProcessing(false);
        }
      } catch (err) {
        console.error(err);
        alert('Erreur réseau.');
        setProcessing(false);
      }
    }
  };

  return (
    <div className="container">
      {/* Overlay de chargement */}
      {processing && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass-card`}>
            <div className="loading-spinner"></div>
            <h3 className={styles.modalTitle}>Traitement en cours</h3>
            <p className={styles.modalText}>{processingMessage}</p>
          </div>
        </div>
      )}

      <div className={styles.checkoutHeader}>
        <h1 className={styles.checkoutTitle}>Paiement & Commande</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Sélectionnez votre moyen de paiement et finalisez votre commande.
        </p>
      </div>

      <div className={styles.checkoutLayout}>
        {/* Formulaires à gauche */}
        <form onSubmit={handleSubmit}>
          {/* Section Adresse */}
          <div className={`${styles.formSection} glass-card`}>
            <h2 className={styles.sectionTitle}>1. Adresse de Livraison</h2>
            
            <div className={styles.formRow}>
              <div className="input-group">
                <label className="input-label">Prénom *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Nom *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Adresse e-mail * (pour l'envoi de la facture)</label>
              <input
                type="email"
                name="email"
                placeholder="Ex: albert.baya@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Téléphone de livraison *</label>
              <input
                type="tel"
                name="phone"
                placeholder="Ex: +225 0707070707"
                value={formData.phone}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className="input-group">
                <label className="input-label">Adresse complète *</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Rue, Quartier, Villa..."
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Ville *</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Ex: Abidjan"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section Paiement */}
          <div className={`${styles.formSection} glass-card`}>
            <h2 className={styles.sectionTitle}>2. Choisissez votre mode de Paiement</h2>
            
            <div className={styles.paymentSelector} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <div
                onClick={() => setPaymentGateway('fedapay')}
                className={`${styles.paymentOption} ${paymentGateway === 'fedapay' ? styles.paymentOptionActive : ''}`}
                style={{ padding: '15px 10px' }}
              >
                <span className={styles.optionIcon} style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1.4rem' }}>F</span>
                <span className={styles.optionLabel} style={{ fontSize: '0.85rem' }}>FedaPay</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Automatique</span>
              </div>

              <div
                onClick={() => setPaymentGateway('cinetpay')}
                className={`${styles.paymentOption} ${paymentGateway === 'cinetpay' ? styles.paymentOptionActive : ''}`}
                style={{ padding: '15px 10px' }}
              >
                <span className={styles.optionIcon} style={{ color: '#00A6FF', fontWeight: 'bold', fontSize: '1.4rem' }}>C</span>
                <span className={styles.optionLabel} style={{ fontSize: '0.85rem' }}>CinetPay</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Automatique</span>
              </div>

              <div
                onClick={() => setPaymentGateway('direct_transfer')}
                className={`${styles.paymentOption} ${paymentGateway === 'direct_transfer' ? styles.paymentOptionActive : ''}`}
                style={{ padding: '15px 10px' }}
              >
                <span className={styles.optionIcon} style={{ fontSize: '1.4rem' }}>📲</span>
                <span className={styles.optionLabel} style={{ fontSize: '0.85rem' }}>Transfert Direct</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Mobile Money</span>
              </div>

              <div
                onClick={() => setPaymentGateway('bank_transfer')}
                className={`${styles.paymentOption} ${paymentGateway === 'bank_transfer' ? styles.paymentOptionActive : ''}`}
                style={{ padding: '15px 10px' }}
              >
                <span className={styles.optionIcon} style={{ fontSize: '1.4rem' }}>🏦</span>
                <span className={styles.optionLabel} style={{ fontSize: '0.85rem' }}>Virement</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Bancaire Manuel</span>
              </div>
            </div>

            {/* DÉTAILS DU MODE DE PAIEMENT SÉLECTIONNÉ */}
            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-primary)', borderRadius: '10px', fontSize: '0.9rem' }}>
              {/* FEDAPAY */}
              {paymentGateway === 'fedapay' && (
                <p style={{ color: 'var(--text-secondary)' }}>
                  ℹ️ Redirection vers la passerelle sécurisée <b>FedaPay</b> pour régler par Mobile Money (Orange, MTN, Moov, Wave) ou Carte Bancaire.
                </p>
              )}

              {/* CINETPAY */}
              {paymentGateway === 'cinetpay' && (
                <p style={{ color: 'var(--text-secondary)' }}>
                  ℹ️ Redirection vers la passerelle sécurisée <b>CinetPay</b> pour régler par vos solutions de paiement locales Mobile Money et Cartes de Crédit.
                </p>
              )}

              {/* TRANSFERT DIRECT MOBILE MONEY */}
              {paymentGateway === 'direct_transfer' && (
                <div className="animate-fade" style={{ textAlign: 'left' }}>
                  <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    Faites un transfert Mobile Money direct du montant de <b>{formatPrice(total)}</b> sur l'un de nos numéros réels :
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {config.momoNumbers.map((momo, idx) => (
                      <div key={idx} style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{momo.operator}</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.05rem' }}>{momo.number}</span>
                      </div>
                    ))}
                  </div>

                  <div className="input-group">
                    <label className="input-label">Opérateur utilisé *</label>
                    <select
                      value={directMomoDetails.operator}
                      onChange={(e) => setDirectMomoDetails({ ...directMomoDetails, operator: e.target.value })}
                      className="input-field"
                    >
                      <option value="Orange">Orange Money</option>
                      <option value="MTN">MTN MoMo</option>
                      <option value="Moov">Moov Money</option>
                      <option value="Wave">Wave</option>
                    </select>
                  </div>

                  <div className={styles.formRow}>
                    <div className="input-group">
                      <label className="input-label">Votre numéro de téléphone payeur *</label>
                      <input
                        type="tel"
                        placeholder="Ex: 07XXXXXXXX"
                        value={directMomoDetails.senderNumber}
                        onChange={(e) => setDirectMomoDetails({ ...directMomoDetails, senderNumber: e.target.value })}
                        className="input-field"
                        required={paymentGateway === 'direct_transfer'}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Référence / ID de transaction *</label>
                      <input
                        type="text"
                        placeholder="Ex: TX-98218987"
                        value={directMomoDetails.transactionRef}
                        onChange={(e) => setDirectMomoDetails({ ...directMomoDetails, transactionRef: e.target.value })}
                        className="input-field"
                        required={paymentGateway === 'direct_transfer'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* VIREMENT BANCAIRE DIRECT */}
              {paymentGateway === 'bank_transfer' && (
                <div className="animate-fade" style={{ textAlign: 'left' }}>
                  <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    Effectuez un virement bancaire du montant de <b>{formatPrice(total)}</b> sur le compte d'Albert :
                  </p>
                  
                  <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    <div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Titulaire du Compte :</span> <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{config.bankDetails.accountName}</span></div>
                    <div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Banque :</span> <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{config.bankDetails.bankName}</span></div>
                    <div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Numéro de Compte (RIB) :</span> <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.95rem' }}>{config.bankDetails.accountNumber}</span></div>
                  </div>

                  <div className={styles.formRow}>
                    <div className="input-group">
                      <label className="input-label">Nom du compte expéditeur *</label>
                      <input
                        type="text"
                        placeholder="Ex: Albert Baya"
                        value={directBankDetails.bankSenderName}
                        onChange={(e) => setDirectBankDetails({ ...directBankDetails, bankSenderName: e.target.value })}
                        className="input-field"
                        required={paymentGateway === 'bank_transfer'}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Référence du virement *</label>
                      <input
                        type="text"
                        placeholder="Ex: VR-9812732"
                        value={directBankDetails.virementRef}
                        onChange={(e) => setDirectBankDetails({ ...directBankDetails, virementRef: e.target.value })}
                        className="input-field"
                        required={paymentGateway === 'bank_transfer'}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="gradient-button submitBtn">
              Valider et Payer ({formatPrice(total)})
            </button>
          </div>
        </form>

        {/* Détails panier à droite */}
        <div className={`${styles.checkoutSummaryCard} glass-card`}>
          <h2 className={styles.sectionTitle}>Votre commande</h2>
          
          <div style={{ maxHeight: '350px', overflowY: 'auto', marginBottom: '20px' }}>
            {cart.map((item) => (
              <div key={item.id} className={styles.summaryItem}>
                <img src={item.image} alt={item.name} className={styles.summaryImage} />
                <div className={styles.summaryDetails}>
                  <h4 className={styles.summaryName}>{item.name}</h4>
                  <span className={styles.summaryQtyPrice}>
                    {item.quantity} x {formatPrice(item.price)}
                  </span>
                </div>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>Frais de livraison</span>
              <span>
                {shippingFee === 0 ? (
                  <span style={{ color: 'var(--success)' }}>Gratuit</span>
                ) : (
                  formatPrice(shippingFee)
                )}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '4px' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
