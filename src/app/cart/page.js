'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import { useTranslation } from '../../hooks/useTranslation';
import { formatPrice } from '../../utils/formatPrice';
import styles from './page.module.css';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart, isLoaded } = useCart();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // ── Promo codes ──
  const PROMO_CODES = {
    'BAYA10':     { label: '-10%',  discount: 0.10 },
    'BIENVENUE':  { label: '-15%',  discount: 0.15 },
    'VIP20':      { label: '-20%',  discount: 0.20 },
  };
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedPromo({ code, ...PROMO_CODES[code] });
      setPromoError('');
    } else {
      setPromoError(t.promoInvalid || 'Code promo invalide ou expiré.');
      setAppliedPromo(null);
    }
  };

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !isLoaded) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 16px auto' }} />
        <p style={{ color: 'var(--text-muted)' }}>{t.loading || 'Chargement...'}</p>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const discountAmount = appliedPromo ? Math.round(subtotal * appliedPromo.discount) : 0;
  const discountedSubtotal = subtotal - discountAmount;
  const shippingFee = discountedSubtotal >= 150000 || discountedSubtotal === 0 ? 0 : 2000;
  const total = discountedSubtotal + shippingFee;
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="container">
        <div className={styles.emptyCart}>
          <span className={styles.emptyCartIcon}>🛒</span>
          <h2 className={styles.emptyCartText}>{t.emptyCart || 'Votre panier est vide'}</h2>
          <p className={styles.emptyCartSub}>
            {t.noProductsSub || 'Explorez nos collections pour trouver votre bonheur !'}
          </p>
          <Link href="/">
            <button className={`${styles.continueShoppingBtn} gradient-button`}>
              {t.discoverProducts || 'Découvrir nos produits'}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div className={styles.cartHeader}>
        <div>
          <h1 className={styles.cartTitle}>{t.cartPage || 'Mon Panier'}</h1>
          <p className={styles.cartSubtitle}>
            {totalItems} {totalItems > 1 ? (t.itemsSelected || 'articles sélectionnés') : (t.itemSelected || 'article sélectionné')}
          </p>
        </div>
        <button onClick={clearCart} className={styles.clearCartBtn}>
          {t.clearCart || '🗑️ Vider le panier'}
        </button>
      </div>

      <div className={styles.cartLayout}>
        {/* Articles */}
        <div className={styles.cartItemsList}>
          {cart.map((item) => (
            <div key={item.id} className={`${styles.cartItem} glass-card`}>
              {/* Image */}
              <div className={styles.itemImageWrapper}>
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  unoptimized
                  sizes="80px"
                  style={{ objectFit: 'cover', borderRadius: '10px' }}
                />
              </div>

              {/* Détails */}
              <div className={styles.itemDetails}>
                <span className={styles.itemCategory}>{item.category}</span>
                <h3 className={styles.itemName}>{item.name}</h3>
                <span className={styles.itemUnitPrice}>{formatPrice(item.price)} / {t.unitPrice || 'unité'}</span>
              </div>

              {/* Quantité */}
              <div className={styles.quantityControls}>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className={styles.qtyBtn}
                  aria-label="Diminuer"
                >
                  −
                </button>
                <span className={styles.qtyVal}>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className={styles.qtyBtn}
                  aria-label="Augmenter"
                >
                  +
                </button>
              </div>

              {/* Total ligne */}
              <div className={styles.itemTotal}>{formatPrice(item.price * item.quantity)}</div>

              {/* Supprimer */}
              <button
                onClick={() => removeFromCart(item.id)}
                className={styles.removeBtn}
                aria-label={`Supprimer ${item.name}`}
                title="Supprimer du panier"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Résumé */}
        <div className={`${styles.summaryCard} glass-card`}>
          <h2 className={styles.summaryTitle}>{t.yourOrderSummary || 'Résumé de commande'}</h2>

          <div className={styles.summaryRow}>
            <span>{t.subtotal || 'Sous-total'} ({totalItems} {totalItems > 1 ? (t.itemsPlural || 'articles') : (t.itemPlural || 'article')})</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {/* Promo code block */}
          <div className={styles.promoBlock}>
            <div className={styles.promoInputRow}>
              <input
                type="text"
                placeholder={t.promoPlaceholder || 'Code promo'}
                value={promoInput}
                onChange={e => { setPromoInput(e.target.value); setPromoError(''); }}
                className={styles.promoInput}
                onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                id="promo-code-input"
              />
              <button onClick={handleApplyPromo} className={styles.promoBtn} id="apply-promo-btn">
                {t.applyPromo || 'Appliquer'}
              </button>
            </div>
            {promoError && <p className={styles.promoError}>{promoError}</p>}
            {appliedPromo && (
              <div className={styles.promoSuccess}>
                <span>
                  🎉 {(t.promoApplied || 'Code {code} appliqué ({label}) !')
                    .replace('{code}', appliedPromo.code)
                    .replace('{label}', appliedPromo.label)}
                </span>
                <button onClick={() => { setAppliedPromo(null); setPromoInput(''); }} className={styles.promoRemove}>✕</button>
              </div>
            )}
          </div>

          {appliedPromo && (
            <div className={styles.summaryRow} style={{ color: 'var(--success)' }}>
              <span>{t.discount || 'Remise'} ({appliedPromo.label})</span>
              <span>− {formatPrice(discountAmount)}</span>
            </div>
          )}

          <div className={styles.summaryRow}>
            <span>{t.shipping || 'Livraison'}</span>
            <span>
              {shippingFee === 0 ? (
                <span className={styles.freeShipping}>{t.freeShipping || '✓ Gratuite'}</span>
              ) : (
                formatPrice(shippingFee)
              )}
            </span>
          </div>

          {shippingFee > 0 && (
            <div className={styles.freeShippingHint}>
              {(t.freeShippingHint || '🎁 Plus que {amount} pour la livraison gratuite !')
                .replace('{amount}', formatPrice(150000 - discountedSubtotal))}
            </div>
          )}

          <div className={styles.totalRow}>
            <span>{t.checkoutTotal || 'Total TTC'}</span>
            <span className={styles.totalAmount}>{formatPrice(total)}</span>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className={`${styles.checkoutBtn} gradient-button`}
            id="proceed-to-checkout"
          >
            {t.proceedToCheckout || 'Passer la commande →'}
          </button>

          <Link href="/" className={styles.continueShopping}>
            {t.continueShopping || '← Continuer mes achats'}
          </Link>

          {/* Badges de sécurité */}
          <div className={styles.securityBadges}>
            {t.securityBadges || '🔒 Paiement sécurisé  ·  📦 Livraison rapide  ·  ✅ Satisfait ou remboursé'}
          </div>
        </div>
      </div>
    </div>
  );
}
