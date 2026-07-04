'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
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

  // States pour les avis clients
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ authorName: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

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
    
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await res.json();
          if (data.length === 0) {
            setReviews([
              { id: 'f1', authorName: 'Marc A.', rating: 5, comment: 'Boutique exceptionnelle. La livraison a été hyper rapide et le produit est d\'une qualité incroyable.', createdAt: new Date().toISOString() },
              { id: 'f2', authorName: 'Sophie L.', rating: 5, comment: 'Le paiement mobile money direct est super pratique. L\'équipe est très réactive. Je recommande !', createdAt: new Date().toISOString() },
              { id: 'f3', authorName: 'Cédric K.', rating: 4, comment: 'Très satisfait de mon achat. Les prix sont corrects pour la qualité premium offerte.', createdAt: new Date().toISOString() }
            ]);
          } else {
            setReviews(data);
          }
        }
      } catch (err) {
        console.error('Erreur chargement avis:', err);
      } finally {
        setLoadingReviews(false);
      }
    }

    fetchProducts();
    fetchReviews();
  }, []);

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

  const handleAddToCart = (product) => {
    addToCart(product);
    triggerNotification(`${product.name} ajouté au panier !`);
  };

  const triggerNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace('XOF', 'FCFA');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!newReview.authorName || !newReview.comment) return;
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      if (res.ok) {
        const data = await res.json();
        setReviews([data.review, ...reviews.filter(r => !r.id.toString().startsWith('f'))]);
        setShowReviewModal(false);
        setNewReview({ authorName: '', rating: 5, comment: '' });
        triggerNotification('Merci pour votre avis !');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau');
    } finally {
      setSubmittingReview(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div style={{ paddingBottom: '0' }}>
      {/* Toast */}
      {notification && (
        <div className="toast-notification">
          <span>{notification}</span>
        </div>
      )}

      {/* Modale d'Avis */}
      {showReviewModal && (
        <div className={styles.modalOverlay}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className={`${styles.modalContent} glass-card`}
            style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className={styles.modalHeader}>
              <h2 style={{ color: '#F8FAFC' }}>Laisser un avis</h2>
              <button onClick={() => setShowReviewModal(false)} className={styles.modalCloseBtn}>&times;</button>
            </div>
            <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Votre Prénom / Nom</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Jean D."
                  value={newReview.authorName}
                  onChange={e => setNewReview({...newReview, authorName: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Note (sur 5)</label>
                <select 
                  className="input-field"
                  value={newReview.rating}
                  onChange={e => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                  style={{ backgroundColor: '#0F172A', color: '#F8FAFC' }}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (Excellent)</option>
                  <option value={4}>⭐⭐⭐⭐ (Très Bien)</option>
                  <option value={3}>⭐⭐⭐ (Bien)</option>
                  <option value={2}>⭐⭐ (Passable)</option>
                  <option value={1}>⭐ (Décevant)</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Votre commentaire</label>
                <textarea
                  className="input-field"
                  rows="4"
                  placeholder="Partagez votre expérience..."
                  value={newReview.comment}
                  onChange={e => setNewReview({...newReview, comment: e.target.value})}
                  required
                ></textarea>
              </div>
              <button type="submit" className="gradient-button" style={{ padding: '12px', borderRadius: '8px' }} disabled={submittingReview}>
                {submittingReview ? 'Envoi...' : 'Publier mon avis'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className={styles.hero} style={{ background: 'transparent' }}>
        {/* Animated Background Orbs */}
        <div className={styles.heroShape1}></div>
        <div className={styles.heroShape2}></div>

        <motion.div initial="hidden" animate="visible" variants={fadeInUp} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="badge" style={{ marginBottom: '20px' }}>✨ L'excellence du shopping digital</div>
          <h1 className={styles.heroTitle} style={{ color: '#F8FAFC' }}>
            La boutique qui redéfinit<br />
            <span className="gradient-text">votre expérience d'achat</span>
          </h1>
          <p className={styles.heroSubtitle} style={{ marginTop: '20px' }}>
            Découvrez nos collections premium avec des paiements sécurisés via Mobile Money, carte bancaire et virement.
          </p>
          <div className={styles.heroCtas} style={{ marginTop: '30px' }}>
            <button
              onClick={() => document.getElementById('catalogue').scrollIntoView({ behavior: 'smooth' })}
              className="gradient-button" style={{ padding: '14px 32px', borderRadius: '8px', fontSize: '1rem' }}
            >
              Découvrir le catalogue
            </button>
            <button onClick={openSidebar} className={styles.btnOutline} style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
              Mon Espace Client
            </button>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
          className={styles.heroStats} style={{ marginTop: '50px' }}
        >
          <div className={styles.statItem}>
            <span className={styles.statNum} style={{ color: '#F8FAFC' }}>500+</span>
            <span className={styles.statLabel}>Clients satisfaits</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum} style={{ color: '#10B981' }}>100%</span>
            <span className={styles.statLabel}>Sécurisé</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum} style={{ color: '#38BDF8' }}>24h</span>
            <span className={styles.statLabel}>Livraison express</span>
          </div>
        </motion.div>
      </section>

      {/* ─── FEATURES BAND ───────────────────────────────────── */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
        className={styles.featureBand} style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className={styles.featureGrid}>
          {[
            { icon: '🔒', title: 'Paiement Sécurisé', desc: 'Mobile Money, carte & virement' },
            { icon: '⚡', title: 'Livraison Rapide', desc: 'Partout en Afrique de l\'Ouest' },
            { icon: '🏆', title: 'Qualité Premium', desc: 'Produits sélectionnés avec soin' },
            { icon: '🎯', title: 'Support 24/7', desc: 'Une équipe à votre service' },
          ].map((f, i) => (
            <motion.div key={f.title} whileHover={{ y: -5 }} className={styles.featureCard} style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(15,23,42,0.5)' }}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <div>
                <div className={styles.featureTitle} style={{ color: '#F8FAFC' }}>{f.title}</div>
                <div className={styles.featureDesc} style={{ color: '#94A3B8' }}>{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ─── CATALOGUE ────────────────────────────────────────── */}
      <section id="catalogue" className={styles.catalogueSection} style={{ background: 'transparent', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className={styles.container}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className={styles.sectionHeader}>
            <div>
              <span className="badge">Notre catalogue</span>
              <h2 className={styles.sectionTitle} style={{ color: '#F8FAFC', marginTop: '10px' }}>Tous nos produits</h2>
            </div>
            <p className={styles.sectionSubtitle} style={{ color: '#94A3B8' }}>
              Des articles soigneusement sélectionnés pour vous offrir le meilleur.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className={styles.filtersBar} style={{ background: 'rgba(15,23,42,0.8)', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className={styles.searchWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field" style={{ width: '100%', paddingLeft: '40px' }}
              />
            </div>
            <div className={styles.tabsRow} style={{ borderBottom: '2px solid rgba(255,255,255,0.05)' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`${styles.tabBtn} ${selectedCategory === cat ? styles.tabBtnActive : ''}`}
                  style={selectedCategory === cat ? { background: '#10B981', color: '#fff', borderColor: '#10B981' } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {loading ? (
            <div className={styles.loadingWrapper}>
              <div className="loading-spinner" />
              <p className={styles.loadingText} style={{ color: '#94A3B8' }}>Chargement des collections...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.emptyState}>
              <span style={{ fontSize: '3rem' }}>🔎</span>
              <p style={{ color: '#94A3B8' }}>Aucun produit ne correspond à votre recherche.</p>
            </motion.div>
          ) : (
            <motion.div 
              variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
              className={styles.productsGrid}
            >
              {filteredProducts.map((product) => (
                <motion.div variants={fadeInUp} key={product.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div className={styles.imageWrapper}>
                    <img src={product.image} alt={product.name} className={styles.productImage} />
                    <span className={styles.categoryBadge}>{product.category}</span>
                    {product.stock <= 3 && product.stock > 0 && (
                      <span className={styles.stockWarning}>Plus que {product.stock} !</span>
                    )}
                    <div className={styles.quickActions}>
                      <button className={styles.quickBtn} onClick={() => handleAddToCart(product)} title="Ajouter au panier">
                        🛒
                      </button>
                      <button className={styles.quickBtn} onClick={() => triggerNotification('Ajouté aux favoris !')} title="Mettre en favori">
                        ❤️
                      </button>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.productName} style={{ color: '#F8FAFC' }}>{product.name}</h3>
                    <p className={styles.productDesc} style={{ color: '#94A3B8' }}>{product.description}</p>
                    <div className={styles.ratingRow}>
                      {'★★★★★'.split('').map((s, i) => (
                        <span key={i} style={{ color: i < Math.round(product.rating || 4) ? '#F59E0B' : '#334155' }}>★</span>
                      ))}
                      <span className={styles.ratingCount}>({product.stock} en stock)</span>
                    </div>
                    <div className={styles.cardFooter} style={{ borderTopColor: 'rgba(255,255,255,0.05)' }}>
                      <div>
                        <span className={styles.productPrice} style={{ color: '#10B981' }}>{formatPrice(product.price)}</span>
                      </div>
                      <button onClick={() => handleAddToCart(product)} className="gradient-button" style={{ padding: '8px 16px', borderRadius: '6px' }} disabled={product.stock <= 0}>
                        {product.stock <= 0 ? 'Indisponible' : '+ Ajouter'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ─── REVIEWS SECTION (AVIS CLIENTS) ─────────────────── */}
      <section className={styles.reviewsSection} style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className={styles.container}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className={styles.reviewsHeader}>
            <div>
              <span className="badge">Témoignages</span>
              <h2 className={styles.sectionTitle} style={{ color: '#F8FAFC', marginTop: '10px' }}>Ce que disent nos clients</h2>
            </div>
            <button onClick={() => setShowReviewModal(true)} className="gradient-button" style={{ padding: '10px 20px', borderRadius: '8px' }}>
              ✎ Laisser un avis
            </button>
          </motion.div>
          
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className={styles.reviewsGrid}>
            {loadingReviews ? (
              <p style={{ color: '#94A3B8' }}>Chargement des avis...</p>
            ) : reviews.slice(0, 3).map((review) => (
              <motion.div variants={fadeInUp} key={review.id} className="glass-card" style={{ padding: '24px' }}>
                <div className={styles.reviewRating}>
                  {'★★★★★'.split('').map((s, i) => (
                    <span key={i} style={{ color: i < review.rating ? '#F59E0B' : '#334155', fontSize: '1.2rem' }}>★</span>
                  ))}
                </div>
                <p className={styles.reviewComment} style={{ color: '#F8FAFC', marginTop: '12px' }}>"{review.comment}"</p>
                <div className={styles.reviewAuthorRow} style={{ borderTopColor: 'rgba(255,255,255,0.05)', marginTop: '20px' }}>
                  <div className={styles.reviewAvatar} style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981' }}>
                    {review.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.reviewAuthorName} style={{ color: '#F8FAFC' }}>{review.authorName}</div>
                    <div className={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    </div>
  );
}
