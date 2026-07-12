'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './page.module.css';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, getWishlistCount, isLoaded } = useWishlist();
  const { addToCart } = useCart();
  const { t, lang } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 16px auto' }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>{t.loading || 'Chargement...'}</p>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('XOF', 'FCFA');
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const wishlistCount = getWishlistCount();

  if (wishlistCount === 0) {
    return (
      <div className={`container ${styles.wishlistContainer}`}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <h2 className={styles.emptyTitle}>{t.emptyWishlistTitle || 'Votre liste de favoris est vide'}</h2>
          <p className={styles.emptySubtitle}>
            {t.emptyWishlistSub || 'Sauvegardez vos articles préférés pour les retrouver plus tard facilement.'}
          </p>
          <Link href="/#catalogue" className={styles.discoverBtn}>
            {t.discoverProducts || 'Découvrir nos produits'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.wishlistContainer}`}>
      {showToast && (
        <div className={styles.toastNotification}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          {t.addedToCartToastWishlist || 'Produit ajouté au panier !'}
        </div>
      )}

      <div className={styles.pageHeader}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.pageTitle}>{t.myFavoritesTitle || 'Mes Favoris'}</h1>
          <span className={styles.countBadge}>
            {wishlistCount} {wishlistCount > 1 ? (t.itemsPlural || 'articles') : (t.itemPlural || 'article')}
          </span>
        </div>
        <p className={styles.pageSubtitle}>{t.myFavoritesSub || 'Tous les produits que vous avez enregistrés pour plus tard.'}</p>
      </div>

      <div className={styles.productsGrid}>
        {wishlist.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.imageWrapper}>
              <img src={product.image} alt={product.name} className={styles.productImage} />
              <span className={styles.categoryBadge}>{product.category}</span>
            </div>
            
            <div className={styles.cardBody}>
              <h3 className={styles.productName}>{product.name}</h3>
              
              <div className={styles.ratingRow}>
                {'★★★★★'.split('').map((_, i) => (
                  <span key={i} style={{ color: '#F59E0B' }}>★</span>
                ))}
              </div>
              
              <div className={styles.cardFooter}>
                <span className={styles.productPrice}>{formatPrice(product.price)}</span>
                
                <div className={styles.actionButtons}>
                  <button 
                    onClick={() => handleAddToCart(product)} 
                    className={styles.addCartBtn}
                    title={t.addToCart || 'Ajouter au panier'}
                  >
                    {t.addToCart ? t.addToCart.split(' ')[0] : 'Ajouter'}
                  </button>
                  <button 
                    onClick={() => removeFromWishlist(product.id)} 
                    className={styles.removeBtn}
                    title={t.removeFromWishlist || 'Retirer des favoris'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
