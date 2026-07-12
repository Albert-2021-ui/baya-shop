'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../../context/CartContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { useWishlist } from '../../../context/WishlistContext';
import { formatPrice } from '../../../utils/formatPrice';
import styles from './page.module.css';

export default function ProductPage({ params }) {
  // Next.js 16 — params may be a Promise
  const resolvedParams = typeof params?.then === 'function' ? use(params) : params;
  const productId = parseInt(resolvedParams?.id, 10);

  const { addToCart } = useCart();
  const { t } = useTranslation();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const all = await res.json();
          const found = all.find((p) => p.id === productId);
          setProduct(found || null);
          if (found) {
            setRelated(
              all
                .filter((p) => p.id !== found.id && p.category === found.category && p.stock > 0)
                .slice(0, 3)
            );
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  // Placeholder gallery (product has one image; we simulate extra views)
  const gallery = product ? [
    product.image,
    product.image + '&grayscale=true',
    product.image + '&blur=1',
  ] : [];

  if (loading) return (
    <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
      <div className="loading-spinner" style={{ margin: '0 auto 16px auto' }} />
      <p style={{ color: 'var(--text-muted)' }}>{t.loading || 'Chargement...'}</p>
    </div>
  );

  if (!product) return (
    <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😕</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>{t.productNotFound || 'Produit introuvable'}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{t.productNotFoundSub || 'Ce produit n\'existe pas ou a été supprimé.'}</p>
      <Link href="/" className="gradient-button" style={{ padding: '12px 28px', borderRadius: '8px', display: 'inline-block' }}>
        {t.backToShop || 'Retour à la boutique'}
      </Link>
    </div>
  );

  const ratingStars = Math.round(product.rating);

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/" className={styles.breadLink}>{t.breadcrumbHome || 'Accueil'}</Link>
        <span className={styles.breadSep}>›</span>
        <span className={styles.breadCurrent}>{product.category}</span>
        <span className={styles.breadSep}>›</span>
        <span className={styles.breadCurrent}>{product.name}</span>
      </nav>

      {/* Product Hero */}
      <div className={styles.productLayout}>
        {/* Gallery */}
        <div className={styles.galleryCol}>
          <div className={styles.mainImageWrapper}>
            {product.stock <= 0 && (
              <div className={styles.outOfStockOverlay}>{t.outOfStock || 'Rupture de stock'}</div>
            )}
            <Image
              src={gallery[activeImg] || product.image}
              alt={product.name}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
              className={product.stock <= 0 ? styles.imgGrayscale : ''}
              priority
            />
          </div>
          <div className={styles.thumbnailRow}>
            {gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`${styles.thumbnail} ${activeImg === i ? styles.thumbnailActive : ''}`}
              >
                <Image src={img} alt={`Vue ${i + 1}`} fill unoptimized sizes="72px" style={{ objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={styles.infoCol}>
          <span className={styles.categoryTag}>{product.category}</span>
          <h1 className={styles.productTitle}>{product.name}</h1>

          {/* Rating */}
          <div className={styles.ratingRow}>
            <div className={styles.stars}>
              {[1,2,3,4,5].map(s => (
                <span key={s} style={{ color: s <= ratingStars ? '#F59E0B' : '#E2E8F0' }}>★</span>
              ))}
            </div>
            <span className={styles.ratingNum}>{product.rating}</span>
            <span className={styles.ratingCount}>• {t.clientReview || 'Évaluation client'}</span>
          </div>

          <div className={styles.priceLine}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
            {product.stock > 0 && product.stock <= 5 && (
              <span className={styles.lowStockBadge}>
                ⚡ {(t.lowStockBanner || 'Plus que {stock} restants !').replace('{stock}', product.stock)}
              </span>
            )}
          </div>

          <p className={styles.description}>{product.description}</p>

          {/* Quantity selector */}
          {product.stock > 0 && (
            <div className={styles.qtyRow}>
              <span className={styles.qtyLabel}>{t.quantityLabel || 'Quantité :'}</span>
              <div className={styles.qtyControls}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >−</button>
                <span className={styles.qtyVal}>{qty}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock}
                >+</button>
              </div>
              <span className={styles.stockInfo}>{product.stock} {t.available || 'disponibles'}</span>
            </div>
          )}

          {/* CTA */}
          <div className={styles.ctaRow}>
            {product.stock > 0 ? (
              <>
                <button
                  onClick={handleAddToCart}
                  className={`${styles.addBtn} gradient-button`}
                  id="product-add-to-cart"
                >
                  {added
                    ? (t.addedToCartSuccess || '✅ Ajouté au panier !')
                    : (t.addToCartWithPrice || 'Ajouter au panier — {price}').replace('{price}', formatPrice(product.price * qty))
                  }
                </button>
                
                {/* Bouton favoris cœur */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`${styles.wishlistBtn} ${isInWishlist(product.id) ? styles.wishlistActive : ''}`}
                  title={isInWishlist(product.id) ? t.removeFromWishlist : t.addToWishlist}
                  type="button"
                >
                  {isInWishlist(product.id) ? '❤️' : '🤍'}
                </button>
              </>
            ) : (
              <div className={styles.outOfStockMsg}>{t.productUnavailable || '😔 Ce produit est actuellement indisponible.'}</div>
            )}
            {added && (
              <Link href="/cart" className={styles.viewCartLink}>
                {t.viewCartBtn || 'Voir le panier →'}
              </Link>
            )}
          </div>

          {/* Trust */}
          <div className={styles.trustRow}>
            <div className={styles.trustItem}><span>🔒</span><span>{t.trustSecure || 'Paiement sécurisé'}</span></div>
            <div className={styles.trustItem}><span>📦</span><span>{t.trustDelivery || 'Livraison 24–48h'}</span></div>
            <div className={styles.trustItem}><span>✅</span><span>{t.trustReturns || 'Retours acceptés'}</span></div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>{t.relatedProducts || 'Produits similaires'}</h2>
          <div className={styles.relatedGrid}>
            {related.map(p => (
              <Link key={p.id} href={`/products/${p.id}`} className={`${styles.relatedCard} glass-card`}>
                <div className={styles.relatedImageWrapper}>
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.relatedContent}>
                  <span className={styles.relatedCategory}>{p.category}</span>
                  <h3 className={styles.relatedName}>{p.name}</h3>
                  <div className={styles.relatedFooter}>
                    <span className={styles.relatedPrice}>{formatPrice(p.price)}</span>
                    <span className={styles.relatedRating}>★ {p.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
