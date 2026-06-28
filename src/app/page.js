'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useApp } from '../context/AppContext';
import styles from './page.module.css';

export default function Home() {
  const { addToCart } = useCart();
  const { openSidebar } = useApp();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [categories, setCategories] = useState(['Tous']);
  const [notification, setNotification] = useState(null);

  // Charger les produits au démarrage
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

  // Filtrer les produits
  useEffect(() => {
    let result = products;
    
    if (selectedCategory !== 'Tous') {
      result = result.filter((p) => p.category === selectedCategory);
    }
    
    if (search.trim() !== '') {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setFilteredProducts(result);
  }, [search, selectedCategory, products]);

  // Ajouter au panier avec notification toast
  const handleAddToCart = (product) => {
    addToCart(product);
    triggerNotification(`${product.name} ajouté au panier !`);
  };

  const triggerNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Formater le prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('XOF', 'FCFA');
  };

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      {/* Toast Notification */}
      {notification && (
        <div className="toast-notification">
          <span>{notification}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={`${styles.heroTitle} gradient-text`}>
          Boutique Moderne<br />BAYA SHOP
        </h1>
        <p className={styles.heroSubtitle}>
          Découvrez nos collections d'exception. Profitez d'une expérience d'achat haut de gamme, fluide, lumineuse et de paiements sécurisés.
        </p>
      </section>

      {/* Bouton de bascule de la barre latérale gauche (Espace Client) */}
      <div className={styles.dashboardToggleRow}>
        <button
          onClick={openSidebar}
          className={styles.toggleDashboardBtn}
        >
          👤 Mon Espace Client
        </button>
      </div>

      {/* Contrôles, Filtres et Catalogue */}
      <section className={styles.controlsSection}>
        <div className={styles.searchFilterRow}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Rechercher un produit d'exception..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.categoriesRow}>
          <span className="input-label" style={{ marginRight: '10px' }}>Catégories :</span>
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
      </section>

      {/* Grille de Produits */}
      {loading ? (
        <div className={styles.loadingWrapper}>
          <div className="loading-spinner"></div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Chargement des collections...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Aucun produit ne correspond à votre recherche.
        </div>
      ) : (
        <section className={styles.gridSection}>
          {filteredProducts.map((product) => (
            <div key={product.id} className={`${styles.productCard} glass-card`}>
              <div className={styles.imageWrapper}>
                <img
                  src={product.image}
                  alt={product.name}
                  className={styles.productImage}
                />
              </div>
              <div className={styles.cardContent}>
                <span className={styles.productCategory}>{product.category}</span>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDesc}>{product.description}</p>
                
                <div className={styles.ratingRow}>
                  <span>★</span>
                  <span>{product.rating}</span>
                  <span className={styles.ratingText}>({product.stock} en stock)</span>
                </div>

                <div className={styles.footerRow}>
                  <span className={styles.productPrice}>{formatPrice(product.price)}</span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className={styles.addToCartBtn}
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
