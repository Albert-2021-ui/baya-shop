'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import styles from './page.module.css';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity,getCartTotal, isLoaded } = useCart();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 16px auto' }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Chargement de votre panier...</p>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('XOF', 'FCFA');
  };

  const subtotal = getCartTotal();
  // Livraison gratuite à partir de 150 000 FCFA, sinon 2 000 FCFA
  const shippingFee = subtotal >= 150000 || subtotal === 0 ? 0 : 2000;
  const total = subtotal + shippingFee;

  if (cart.length === 0) {
    return (
      <div className="container">
        <div className={styles.emptyCart}>
          <span style={{ fontSize: '4rem' }}>🛒</span>
          <h2 className={styles.emptyCartText}>Votre panier est actuellement vide</h2>
          
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '-10px 0 10px 0' }}>
            Explorez notre sélection de produits exclusifs pour commencer vos achats.
          </p>
          <Link href={'./pages/index'}>
            <button className={styles.continueShoppingBtn}>Retourner à l'accueil</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.cartHeader}>
        <h1 className={styles.cartTitle}>Votre Panier</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Vous avez {cart.reduce((acc, item) => acc + item.quantity, 0)} article(s) dans votre panier
        </p>
      </div>

      <div className={styles.cartLayout}>
        {/* Liste des articles */}
        <div className={styles.cartItemsList}>
          {cart.map((item) => (
            <div key={item.id}  className={`${styles.cartItem} glass-card`}>
              <div className={styles.itemImageWrapper}>
                <img src={item.image} alt={item.name} className={styles.itemImage} />
              </div>

              <div className={styles.itemDetails}>
                <span className={styles.itemCategory}>{item.category}</span>
                <h3 className={styles.itemName}>{item.name}</h3>
                <span className={styles.itemPrice}>{formatPrice(item.price)} / unité</span>
              </div>

              <div className={styles.quantityControls}>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className={styles.qtyBtn}
                >
                  -
                </button>
                <span className={styles.qtyVal}>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className={styles.qtyBtn}
                >
                  +
                </button>
              </div>

              <div className={styles.itemTotal}>{formatPrice(item.price * item.quantity)}</div>

              <button
                onClick={() => removeFromCart(item.id)}
                className={styles.removeBtn}
                title="Supprimer l'article"
              >
                🗑️
              </button> 
               </div> 
            ))};
           </div> 


        {/* Résumé de la commande */}
        <div className={`${styles.summaryCard} glass-card`}>
          <h2 className={styles.summaryTitle}>Résumé de la commande</h2>
          
          <div className={styles.summaryRow}>
            <span>Sous-total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className={styles.summaryRow}>
            <span>Frais de livraison</span>
            <span>
              {shippingFee === 0 ? (
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Gratuit</span>
              ) : (
                formatPrice(shippingFee)
              )}
            </span>
          </div>
          
          {shippingFee > 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-12px' }}>
              Livraison gratuite à partir de {formatPrice(150000)} d'achats !
            </p>
          )}

          <div className={styles.totalRow}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>{formatPrice(total)}</span>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className="gradient-button checkoutBtn"
          >
            Procéder au paiement
          </button>

          <Link href="/" style={{ textAlign: 'center', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} className="hover-underline">
              ← Continuer mes achats
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
