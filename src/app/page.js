'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const { addToCart } = useCart();
  const { openSidebar } = useApp();
  const { user, isAuthLoaded } = useAuth();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [categories, setCategories] = useState(['Tous']);
  const [notification, setNotification] = useState(null);
  const [sortBy, setSortBy] = useState('default'); // default, price-asc, price-desc, rating

  // Charger les produits
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
          setFilteredProducts(data);
          const cats = ['Tous', ...new Set(data.map((p) => p.category))];
          setCategories(cats);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des produits:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Filtrer et trier les produits
  useEffect(() => {
    let result = [...products];

    if (selectedCategory !== 'Tous') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (search.trim() !== '') {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy === 'price-asc')  result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating')     result.sort((a, b) => b.rating - a.rating);

    setFilteredProducts(result);
  }, [search, selectedCategory, products, sortBy]);

  const handleAddToCart = (product) => {
    if (product.stock <= 0) return;
    addToCart(product);
    setNotification(product.name);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      {/* Toast with cart shortcut */}
      {notification && (
        <div className="toast-notification" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span>✓ <strong>{notification}</strong> ajouté au panier !</span>
          <Link
            href="/cart"
            style={{
              background: 'rgba(255,255,255,0.22)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '6px',
              padding: '4px 12px',
              fontSize: '0.8rem',
              fontWeight: '700',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Voir le panier →
          </Link>
        </div>
      )}

      {/* Hero */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>🇧🇯 Livraison Bénin & Afrique de l'Ouest</div>
        <h1 className={`${styles.heroTitle} gradient-text`}>
          Boutique Moderne<br />BAYA SHOP
        </h1>
        <p className={styles.heroSubtitle}>
          Découvrez nos collections d'exception — Électronique, Mode & Lifestyle. Paiement sécurisé via Mobile Money, FedaPay & CinetPay.
        </p>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>{products.length}+</span>
            <span className={styles.heroStatLabel}>Produits</span>
          </div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>4</span>
            <span className={styles.heroStatLabel}>Modes de paiement</span>
          </div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>24h</span>
            <span className={styles.heroStatLabel}>Livraison express</span>
          </div>
        </div>
        <div className={styles.heroCtas}>
          {isAuthLoaded && user ? (
            <Link href="/dashboard" className={styles.heroAccountBtn}>
              🏠 Mon Dashboard
            </Link>
          ) : (
            <>
              <Link href="/register" className={styles.heroRegisterBtn}>
                ✨ Créer mon compte
              </Link>
              <Link href="/login" className={styles.heroLoginBtn}>
                Se connecter
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className={styles.trustRow}>
        <div className={styles.trustBadge}><span>🔒</span><span>Paiement 100% Sécurisé</span></div>
        <div className={styles.trustBadge}><span>📦</span><span>Livraison Express 24h</span></div>
        <div className={styles.trustBadge}><span>✅</span><span>Satisfait ou Remboursé</span></div>
        <div className={styles.trustBadge}><span>🏆</span><span>Qualité Premium Garantie</span></div>
      </section>

      {/* ── Produits Vedettes ── */}
      {!loading && products.filter(p => p.stock > 0).sort((a,b) => b.rating - a.rating).slice(0,3).length > 0 && (
        <section className={styles.featuredSection}>
          <div className={styles.featuredHeader}>
            <div>
              <h2 className={styles.featuredTitle}>🔥 Produits Vedettes</h2>
              <p className={styles.featuredSub}>Les meilleures ventes de la boutique</p>
            </div>
          </div>
          <div className={styles.featuredGrid}>
            {products.filter(p => p.stock > 0).sort((a,b) => b.rating - a.rating).slice(0,3).map(product => (
              <div key={product.id} className={`${styles.featuredCard} glass-card`}>
                <div className={styles.featuredBadge}>⭐ Bestseller</div>
                <div className={styles.featuredImageWrapper}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.featuredContent}>
                  <span className={styles.productCategory}>{product.category}</span>
                  <h3 className={styles.featuredName}>{product.name}</h3>
                  <div className={styles.featuredFooter}>
                    <span className={styles.productPrice}>{formatPrice(product.price)}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`${styles.addToCartBtn}`}
                    >
                      🛍️ Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Barre de recherche, filtres, tri */}
      <section className={styles.controlsSection}>
        {/* Recherche */}
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Rechercher un produit…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            id="search-products"
          />
          {search && (
            <button
              className={styles.searchClearBtn}
              onClick={() => setSearch('')}
              aria-label="Effacer la recherche"
            >
              ✕
            </button>
          )}
        </div>

        {/* Catégories + Tri */}
        <div className={styles.filtersRow}>
          <div className={styles.categoriesRow}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`${styles.categoryButton} ${
                  selectedCategory === cat ? styles.categoryButtonActive : ''
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="default">Trier par…</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="rating">Mieux notés</option>
          </select>
        </div>
      </section>

      {/* Résultats */}
      {loading ? (
        <div className={styles.loadingWrapper}>
          <div className="loading-spinner" />
          <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>
            Chargement des collections…
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyStateIcon}>🔍</span>
          <h3>Aucun produit trouvé</h3>
          <p>Essayez d'autres mots-clés ou catégories.</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('Tous'); }}
            className={`${styles.resetBtn} gradient-button`}
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          <div className={styles.resultsCount}>
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
          </div>
          <section className={styles.gridSection}>
            {filteredProducts.map((product) => (
              <div key={product.id} className={`${styles.productCard} glass-card`}>
                {/* Badge rupture */}
                {product.stock <= 0 && (
                  <div className={styles.outOfStockBanner}>Rupture de stock</div>
                )}
                {/* Badge stock faible */}
                {product.stock > 0 && product.stock <= 5 && (
                  <div className={styles.lowStockBanner}>Plus que {product.stock} restant{product.stock > 1 ? 's' : ''} !</div>
                )}

                {/* Image cliquable vers page produit */}
                <Link href={`/products/${product.id}`} className={styles.imageWrapper} style={{ display: 'block' }}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    className={`${styles.productImage} ${product.stock <= 0 ? styles.imageGrayscale : ''}`}
                  />
                </Link>

                {/* Contenu */}
                <div className={styles.cardContent}>
                  <span className={styles.productCategory}>{product.category}</span>
                  <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                    <h3 className={styles.productName}>{product.name}</h3>
                  </Link>
                  <p className={styles.productDesc}>{product.description}</p>

                  <div className={styles.ratingRow}>
                    <span className={styles.star}>★</span>
                    <span className={styles.ratingVal}>{product.rating}</span>
                    <span className={styles.stockInfo}>
                      {product.stock > 0 ? `${product.stock} en stock` : 'Épuisé'}
                    </span>
                  </div>

                  <div className={styles.footerRow}>
                    <span className={styles.productPrice}>{formatPrice(product.price)}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className={`${styles.addToCartBtn} ${product.stock <= 0 ? styles.addToCartBtnDisabled : ''}`}
                    >
                      {product.stock <= 0 ? 'Épuisé' : '🛍️ Ajouter'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
