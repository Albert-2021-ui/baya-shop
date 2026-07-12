'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatPrice';
import styles from './page.module.css';

// Le composant interne qui utilise useSearchParams
function SandboxContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  
  // Paramètres URL
  const gateway = searchParams.get('gateway') || 'fedapay'; // fedapay ou cinetpay
  const reference = searchParams.get('ref') || 'BAYA-XXXXXX';
  const amount = parseFloat(searchParams.get('amount')) || 0;
  const customerEmail = searchParams.get('email') || '';
  const customerName = searchParams.get('name') || '';

  // État local
  const [paymentType, setPaymentType] = useState('momo'); // momo ou card
  const [provider, setProvider] = useState('orange'); // orange, mtn, moov, wave
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Guard: if no pending order, redirect home
    if (!localStorage.getItem('pending_checkout_order')) {
      // Only redirect if there's no amount in URL (direct access)
      if (!searchParams.get('amount')) {
        router.replace('/');
      }
    }
  }, []);

  if (!mounted) return null;


  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage('Traitement sécurisé de la transaction et communication avec la boutique...');

    // 1. Récupérer la commande en attente depuis localStorage
    const pendingOrderStr = localStorage.getItem('pending_checkout_order');
    if (!pendingOrderStr) {
      alert('Erreur : Session de commande introuvable.');
      setLoading(false);
      return;
    }

    const orderPayload = JSON.parse(pendingOrderStr);
    
    // Mettre à jour la commande avec les détails du vrai mode choisi sur la passerelle
    orderPayload.payment = {
      method: paymentType,
      provider: paymentType === 'momo' ? provider : 'bank_card',
      phone: paymentType === 'momo' ? phone : null,
      amount: amount,
      reference: reference,
      gateway: gateway // fedapay ou cinetpay
    };

    // 2. Transmettre la commande validée au serveur backend (API Checkout)
    setTimeout(async () => {
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderPayload)
        });

        if (res.ok) {
          const result = await res.json();
          
          // Sauvegarder dans localStorage pour la page success
          localStorage.setItem('last_completed_order', JSON.stringify(result.order));
          
          // Update the existing pending order in history (set by checkout page)
          let clientHistory = [];
          const savedHistory = localStorage.getItem('baya_customer_orders_history');
          if (savedHistory) {
            try { clientHistory = JSON.parse(savedHistory); } catch(e) {}
          }
          const existingIdx = clientHistory.findIndex(o => o.id === reference || o.payment?.reference === reference);
          if (existingIdx !== -1) {
            // Update the existing entry with final payment details
            clientHistory[existingIdx] = { ...clientHistory[existingIdx], ...result.order };
          } else {
            // Fallback: add if not found
            clientHistory.push(result.order);
          }
          localStorage.setItem('baya_customer_orders_history', JSON.stringify(clientHistory));
          
          // Nettoyer les commandes en attente et le panier
          localStorage.removeItem('pending_checkout_order');
          clearCart();

          setLoadingMessage('Paiement validé avec succès ! Redirection vers votre reçu...');
          
          setTimeout(() => {
            router.push('/success');
          }, 1500);
        } else {
          alert('Erreur lors du traitement final de la commande sur le serveur.');
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        alert('Erreur réseau lors de la communication de validation.');
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div className={`${styles.sandboxContainer} glass-card`}>
      {loading ? (
        <div className={styles.loadingSpinnerOverlay}>
          <div className="loading-spinner"></div>
          <h3 style={{ color: '#fff' }}>Traitement du Paiement</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
            {loadingMessage}
          </p>
        </div>
      ) : (
        <>
          {/* Header de la passerelle */}
          <div className={styles.gatewayHeader}>
            <span className={`${styles.gatewayName} ${gateway === 'fedapay' ? styles.fedapayColor : styles.cinetpayColor}`}>
              {gateway === 'fedapay' ? 'FedaPay' : 'CinetPay'} Checkout
            </span>
            <span className={styles.badgeSandbox}>MODE TEST</span>
          </div>

          {/* Infos Commande */}
          <div className={styles.orderBrief}>
            <div>
              <div className={styles.briefLabel}>Référence Commande</div>
              <div className={styles.briefVal}>{reference}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className={styles.briefLabel}>Montant à Payer</div>
              <div className={styles.briefVal} style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>
                {formatPrice(amount)}
              </div>
            </div>
          </div>

          {/* Note d'information instructive */}
          <div className={styles.instructionsCard}>
            💡 <b>Informations pour Albert :</b><br />
            Vous voyez cet écran car les clés API réelles pour <b>{gateway === 'fedapay' ? 'FedaPay' : 'CinetPay'}</b> ne sont pas encore configurées dans votre fichier <code>.env.local</code>.<br /><br />
            Cet écran reproduit fidèlement l'interface de paiement finale et permet de valider le panier, de déduire les stocks et d'envoyer l'e-mail de confirmation.
          </div>

          {/* Formulaire de paiement */}
          <form onSubmit={handlePaymentSubmit} style={{ textAlign: 'left' }}>
            <h3 className="input-label" style={{ marginBottom: '12px' }}>1. Choisissez votre moyen de paiement</h3>
            
            <div className={styles.paymentMethodsGrid}>
              <div
                onClick={() => setPaymentType('momo')}
                className={`${styles.methodBtn} ${paymentType === 'momo' ? styles.methodBtnActive : ''}`}
              >
                Mobile Money
              </div>
              <div
                onClick={() => setPaymentType('card')}
                className={`${styles.methodBtn} ${paymentType === 'card' ? styles.methodBtnActive : ''}`}
              >
                Carte Bancaire
              </div>
            </div>

            {paymentType === 'momo' ? (
              <div>
                <h3 className="input-label" style={{ marginBottom: '12px' }}>2. Choisissez l'opérateur</h3>
                <div className={styles.momoGrid}>
                  {['orange', 'mtn', 'moov', 'wave'].map((prov) => (
                    <div
                      key={prov}
                      onClick={() => setProvider(prov)}
                      className={`${styles.providerBtn} ${provider === prov ? styles.providerActive : ''}`}
                      style={{ textTransform: 'uppercase' }}
                    >
                      {prov}
                    </div>
                  ))}
                </div>

                <div className="input-group">
                  <label className="input-label">Numéro de Téléphone *</label>
                  <input
                    type="tel"
                    placeholder="Ex: 07XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="input-group">
                  <label className="input-label">Numéro de Carte Bancaire *</label>
                  <input
                    type="text"
                    placeholder="4000 1234 5678 9010"
                    className="input-field"
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="input-group">
                    <label className="input-label">Expiration (MM/AA) *</label>
                    <input type="text" placeholder="12/28" className="input-field" required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">CVC *</label>
                    <input type="password" placeholder="123" className="input-field" required />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className={`${styles.payBtn} gradient-button`}>
              Confirmer et Payer {formatPrice(amount)}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

// Le composant principal enveloppe SandboxContent dans un Suspense boundary pour la compilation Next.js
export default function PaymentSandboxPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 16px auto' }}></div>
        <p>Chargement de la passerelle de test...</p>
      </div>
    }>
      <SandboxContent />
    </Suspense>
  );
}
