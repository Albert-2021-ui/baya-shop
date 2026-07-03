'use client';

import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { useApp } from '../../context/AppContext';
import styles from './page.module.css';

export default function AdminPage() {
  const { loginAdmin, logoutAdmin, isAdminLoggedIn: contextAdminLoggedIn } = useApp();

  // Gestion de la sécurité / Connexion d'Albert
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Données du Dashboard
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, orders, products
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // État de l'inspection de commande (Modal)
  const [inspectingOrder, setInspectingOrder] = useState(null);

  // Formulaire nouveau produit
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Électronique',
    image: '',
    stock: '10'
  });
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Vérifier la session de connexion globale
  useEffect(() => {
    if (contextAdminLoggedIn) {
      setIsLoggedIn(true);
      fetchOrders();
      fetchProducts();
    } else {
      setIsLoggedIn(false);
    }
    setCheckingLogin(false);
  }, [contextAdminLoggedIn]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Traiter la connexion
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        loginAdmin(); // Mettre à jour dans AppContext (sessionStorage + state)
        setIsLoggedIn(true);
        // Charger les données du dashboard
        fetchOrders();
        fetchProducts();
      } else {
        setLoginError(data.error || 'Erreur lors de la connexion.');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Impossible de contacter le serveur d\'authentification.');
    } finally {
      setLoggingIn(false);
    }
  };

  // Déconnexion
  const handleLogout = () => {
    logoutAdmin(); // Mettre à jour dans AppContext
    setIsLoggedIn(false);
    setLoginData({ username: '', password: '' });
  };

  // Mettre à jour le statut d'une commande
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId, newStatus })
      });
      if (res.ok) {
        // Mettre à jour dans la liste locale et dans le modal d'inspection si ouvert
        fetchOrders();
        if (inspectingOrder && inspectingOrder.id === orderId) {
          setInspectingOrder((prev) => ({ ...prev, status: newStatus }));
        }
      } else {
        alert('Erreur lors du changement de statut.');
      }
    } catch (e) {
      console.error(e);
      alert('Erreur réseau.');
    }
  };

  // Soumettre un nouveau produit
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      alert('Veuillez remplir le nom et le prix du produit.');
      return;
    }

    setSubmittingProduct(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
      });

      if (res.ok) {
        alert('Produit ajouté avec succès !');
        setNewProduct({
          name: '',
          price: '',
          description: '',
          category: 'Électronique',
          image: '',
          stock: '10'
        });
        fetchProducts();
      } else {
        alert('Erreur lors de l\'ajout du produit.');
      }
    } catch (e) {
      console.error(e);
      alert('Erreur réseau.');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('XOF', 'FCFA');
  };

  // Génération du reçu PDF pour l'inspecteur
  const generatePDFForOrder =async(order) => {
    if (!order) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFillColor(8, 11, 26);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('BAYA SHOP', 20, 25);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text('Boutique E-commerce Premium', 20, 32);

    doc.setTextColor(255, 122, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('FACTURE', 150, 25);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Émetteur :', 20, 52);
    doc.setFont('helvetica', 'normal');
    doc.text('BAYA SHOP', 20, 58);
    doc.text('Abidjan, Côte d\'Ivoire', 20, 63);
    doc.text('Support: contact@bayashop.com', 20, 68);

    doc.setFont('helvetica', 'bold');
    doc.text('Facture N° :', 110, 52);
    doc.text('Date :', 110, 58);
    doc.text('Mode de Paiement :', 110, 63);
    
    doc.setFont('helvetica', 'normal');
    doc.text(order.payment.reference || 'N/A', 150, 52);
    doc.text(new Date(order.date).toLocaleDateString('fr-FR'), 150, 58);
    
    const paymentLabel = order.payment.method === 'momo'
      ? `Mobile Money (${order.payment.provider.toUpperCase()})`
      : 'Carte Bancaire';
    doc.text(paymentLabel, 150, 63);

    doc.setDrawColor(220, 220, 220);
    doc.line(20, 75, 190, 75);

    doc.setFont('helvetica', 'bold');
    doc.text('Facturé à :', 20, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(`${order.customer.firstName} ${order.customer.lastName}`, 20, 91);
    doc.text(order.customer.email, 20, 96);
    doc.text(order.customer.phone, 20, 101);
    doc.text(`${order.customer.address}, ${order.customer.city}`, 20, 106);

    // Tampon vert PAYÉ
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(1);
    doc.rect(145, 82, 40, 15);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PAYÉ', 157, 92);
    doc.setLineWidth(0.2);

    doc.setFillColor(245, 245, 247);
    doc.rect(20, 115, 170, 8, 'F');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Description de l\'article', 22, 120);
    doc.text('Qté', 120, 120);
    doc.text('Prix unitaire', 140, 120);
    doc.text('Total', 170, 120);

    let yOffset = 129;
    doc.setFont('helvetica', 'normal');
    
    order.items.forEach((item) => {
      const itemName = item.name.length > 40 ? item.name.slice(0, 38) + '...' : item.name;
      doc.text(itemName, 22, yOffset);
      doc.text(item.quantity.toString(), 122, yOffset);
      doc.text(formatPrice(item.price), 140, yOffset);
      doc.text(formatPrice(item.price * item.quantity), 170, yOffset);
      
      doc.setDrawColor(240, 240, 240);
      doc.line(20, yOffset + 3, 190, yOffset + 3);
      yOffset += 10;
    });

    yOffset += 5;
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('Sous-total :', 130, yOffset);
    doc.text(formatPrice(order.subtotal), 170, yOffset);
    
    yOffset += 6;
    doc.text('Livraison :', 130, yOffset);
    doc.text(order.shippingFee === 0 ? 'Gratuit' : formatPrice(order.shippingFee), 170, yOffset);

    yOffset += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Montant Total :', 130, yOffset);
    doc.text(formatPrice(order.total), 170, yOffset);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'italic');
    doc.text('Merci de votre confiance pour votre achat chez BAYA SHOP.', 105, 275, null, null, 'center');
    doc.text('Ceci est une facture acquittée électroniquement.', 105, 280, null, null, 'center');

    const pdfArrayBuffer = doc.output("arraybuffer");

    const uint8Array = new Uint8Array(pdfArrayBuffer);

    let binary = "";
    uint8Array.forEach(byte => {
    binary += String.fromCharCode(byte);
    });

    const pdfBase64 = btoa(binary);

  await fetch("/api/send-order-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    order,
    pdf: pdfBase64
  })
});
doc.save(`Facture_${order.payment.reference}.pdf`);
  };

  // Calculs statistiques
  const totalSales = orders.reduce((sum, order) => sum + (order.status !== 'canceled' ? order.total || 0 : 0), 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'canceled').length;
  const avgOrderValue = activeOrdersCount > 0 ? totalSales / activeOrdersCount : 0;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  // Données de ventes fictives par jour (pour le graphique hebdomadaire)
  const weeklySalesData = [
    { label: 'Lun', value: 120000, height: '40%' },
    { label: 'Mar', value: 250000, height: '65%' },
    { label: 'Mer', value: 180000, height: '50%' },
    { label: 'Jeu', value: 340000, height: '85%' },
    { label: 'Ven', value: 290000, height: '75%' },
    { label: 'Sam', value: 410000, height: '100%' },
    { label: 'Dim', value: 210000, height: '55%' },
  ];

  // Calculer le volume de ventes par catégorie de produit
  const categorySummary = products.reduce((acc, prod) => {
    if (!acc[prod.category]) {
      acc[prod.category] = { name: prod.category, count: 0, color: '#ff7a00' };
    }
    acc[prod.category].count += 1;
    return acc;
  }, {});

  const categoryColors = ['#ff7a00', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  Object.keys(categorySummary).forEach((cat, index) => {
    categorySummary[cat].color = categoryColors[index % categoryColors.length];
  });

  if (checkingLogin) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 16px auto' }}></div>
        <p>Vérification de la session sécurisée...</p>
      </div>
    );
  }

  // ÉCRAN DE CONNEXION SÉCURISÉ (LOGIN) SI NON CONNECTÉ
  if (!isLoggedIn) {
    return (
      <div className="container">
        <div className={`${styles.loginContainer} glass-card`}>
          <div>
            <h1 className={styles.loginLogo}>BAYA <span className={styles.loginLogoSub}>SHOP</span></h1>
            <h2 className={styles.loginTitle}>Portail Administration</h2>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Veuillez vous connecter avec vos identifiants pour administrer la boutique.
          </p>

          {loginError && (
            <div className={styles.loginError}>
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div className="input-group">
              <label className="input-label">Identifiant Administrateur</label>
              <input
                type="text"
                placeholder="Ex: albert"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Mot de Passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="gradient-button"
              style={{ padding: '14px', borderRadius: '8px', fontWeight: 'bold', marginTop: '10px' }}
            >
              {loggingIn ? 'Authentification...' : 'Se Connecter'}
            </button>
          </form>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            Note: Par défaut, identifiant = <b>albert</b>, mot de passe = <b>baya</b> (personnalisable dans .env.local).
          </p>
        </div>
      </div>
    );
  }

  // DASHBOARD D'ADMINISTRATION POUR ALBERT
  return (
    <div className={styles.adminContainer}>
      {/* Modal Inspecteur de commande */}
      {inspectingOrder && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} glass-card`}>
            <div className={styles.modalHeader}>
              <h2 style={{ color: 'var(--text-primary)' }}>Commande {inspectingOrder.payment.reference}</h2>
              <button onClick={() => setInspectingOrder(null)} className={styles.modalCloseBtn}>
                &times;
              </button>
            </div>

            {/* MESSAGE D'ALERTE POUR LES PAIEMENTS PAR TRANSFERT DIRECT OU VIREMENT */}
            {inspectingOrder.status === 'pending_verification' && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid var(--warning)',
                padding: '16px',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '0.9rem',
                textAlign: 'left'
              }} className="animate-fade">
                <p style={{ fontWeight: '700', color: 'var(--warning)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ⚠️ ACTION REQUISE : VÉRIFICATION DU PAIEMENT MANUEL
                </p>
                <p style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '0.85rem', lineHeight: '1.4' }}>
                  Albert, le client a déclaré avoir effectué un transfert ou virement direct. Veuillez vérifier vos comptes Mobile Money ou bancaires pour valider la réception du montant de <b>{formatPrice(inspectingOrder.total)}</b>.
                </p>
                <button
                  onClick={() => handleUpdateOrderStatus(inspectingOrder.id, 'delivered')}
                  className="gradient-button"
                  style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}
                >
                  ✅ Valider le Paiement (Argent Reçu)
                </button>
              </div>
            )}

            <div className={styles.modalGrid}>
              {/* Infos Client */}
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Informations Client</h4>
                <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {inspectingOrder.customer.firstName} {inspectingOrder.customer.lastName}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  ✉️ {inspectingOrder.customer.email}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  📞 {inspectingOrder.customer.phone}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  📍 {inspectingOrder.customer.address}, {inspectingOrder.customer.city}
                </p>
              </div>

              {/* Infos Transaction */}
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Détails Paiement</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Date: <b>{new Date(inspectingOrder.date).toLocaleString('fr-FR')}</b>
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Méthode: <b style={{ textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                    {inspectingOrder.payment.method === 'momo'
                      ? `Mobile Money (${inspectingOrder.payment.provider})`
                      : inspectingOrder.payment.method === 'direct_transfer'
                      ? `Transfert Direct MM (${inspectingOrder.payment.provider.replace('transfert_direct_', '')})`
                      : inspectingOrder.payment.method === 'bank_transfer'
                      ? 'Virement Bancaire Manuel'
                      : inspectingOrder.payment.method === 'external_gateway'
                      ? `Passerelle (${inspectingOrder.payment.provider})`
                      : 'Carte Bancaire'}
                  </b>
                </p>
                {inspectingOrder.payment.phone && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Tél Payeur: <b>{inspectingOrder.payment.phone}</b>
                  </p>
                )}
                {inspectingOrder.payment.details && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Infos de transaction: <b>{inspectingOrder.payment.details}</b>
                  </p>
                )}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Total: <b style={{ color: 'var(--primary)' }}>{formatPrice(inspectingOrder.total)}</b>
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Statut :</span>
                  <select
                    value={inspectingOrder.status}
                    onChange={(e) => handleUpdateOrderStatus(inspectingOrder.id, e.target.value)}
                    className={styles.statusSelect}
                  >
                    <option value="pending_verification">À Vérifier ⚠️</option>
                    <option value="pending">En attente</option>
                    <option value="shipped">Expédié</option>
                    <option value="delivered">Livré</option>
                    <option value="canceled">Annulé</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Liste des articles commandés */}
            <div className={styles.modalSection} style={{ marginBottom: '20px' }}>
              <h4 className={styles.modalSectionTitle}>Articles Achetés</h4>
              {inspectingOrder.items.map((item) => (
                <div key={item.id} className={styles.orderItemRow}>
                  <span style={{ color: 'var(--text-primary)' }}>{item.name} <b>x{item.quantity}</b></span>
                  <span style={{ fontWeight: '600' }}>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid var(--glass-border)', paddingTop: '10px', marginTop: '10px', color: 'var(--text-primary)' }}>
                <span>Total Commande</span>
                <span style={{ color: 'var(--primary)' }}>{formatPrice(inspectingOrder.total)}</span>
              </div>
            </div>

            {/* Actions modal */}
            <div className={styles.inspectActions}>
              <button
                onClick={() => generatePDFForOrder(inspectingOrder)}
                className={`${styles.inspectBtn} gradient-button`}
              >
                📥 Télécharger Reçu PDF
              </button>
              <button
                onClick={() => setInspectingOrder(null)}
                className={`${styles.inspectBtn} ${styles.inspectBtnSecondary}`}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header avec Logout */}
      <div className={styles.adminHeader}>
        <div>
          <h1 className={styles.adminTitle}>Administration</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Bienvenue, <b>Albert BAYA</b>. Suivi global et sécurisé.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className={`${styles.tabBtn}`}
          style={{ width: 'auto', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ff6b6b', background: 'rgba(239, 68, 68, 0.05)' }}
        >
          🚪 Déconnexion
        </button>
      </div>

      <div className={styles.adminLayout}>
        {/* Navigation gauche */}
        <aside className={styles.sidebar}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`${styles.tabBtn} ${activeTab === 'dashboard' ? styles.tabBtnActive : ''}`}
          >
            📊 Tableau de bord
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.tabBtnActive : ''}`}
          >
            📦 Commandes ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`${styles.tabBtn} ${activeTab === 'products' ? styles.tabBtnActive : ''}`}
          >
            🏷️ Gestion Stock ({products.length})
          </button>
        </aside>

        {/* Zone de contenu à droite */}
        <main className={styles.contentArea}>
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade">
              {/* Widgets Statistiques */}
              <div className={styles.statsRow}>
                <div className={`${styles.statCard} ${styles.statCardRevenue} glass-card`}>
                  <span className={styles.statLabel}>Chiffre d'Affaires</span>
                  <span className={styles.statVal} style={{ color: 'var(--primary)' }}>
                    {formatPrice(totalSales)}
                  </span>
                  <span className={styles.statChange}>Ventes réelles cumulées</span>
                </div>

                <div className={`${styles.statCard} ${styles.statCardOrders} glass-card`}>
                  <span className={styles.statLabel}>Commandes Actives</span>
                  <span className={styles.statVal}>{activeOrdersCount}</span>
                  <span className={styles.statChange} style={{ color: 'var(--text-secondary)' }}>Hors annulations</span>
                </div>

                <div className={`${styles.statCard} ${styles.statCardAvg} glass-card`}>
                  <span className={styles.statLabel}>Panier Moyen</span>
                  <span className={styles.statVal}>{formatPrice(avgOrderValue)}</span>
                  <span className={styles.statChange} style={{ color: 'var(--text-secondary)' }}>Par commande</span>
                </div>

                <div className={`${styles.statCard} ${styles.statCardStock} glass-card`}>
                  <span className={styles.statLabel}>Ruptures de Stock</span>
                  <span className={styles.statVal} style={{ color: outOfStockCount > 0 ? 'var(--error)' : 'var(--success)' }}>
                    {outOfStockCount}
                  </span>
                  <span className={styles.statChange} style={{ color: outOfStockCount > 0 ? 'var(--error)' : 'var(--success)' }}>
                    {outOfStockCount > 0 ? 'Réapprovisionner !' : 'Stock optimal'}
                  </span>
                </div>
              </div>

              {/* Graphiques Statistiques */}
              <div className={styles.chartsGrid}>
                {/* Graphique des ventes hebdomadaires (SVG/CSS) */}
                <div className={`${styles.chartCard} glass-card`}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Volume de Ventes (Hebdomadaire)</h3>
                  <div className={styles.chartContainer}>
                    {weeklySalesData.map((day) => (
                      <div key={day.label} className={styles.chartBarWrapper}>
                        <div
                          className={styles.chartBar}
                          style={{ height: day.height }}
                        >
                          <div className={styles.chartTooltip}>
                            {formatPrice(day.value)}
                          </div>
                        </div>
                        <span className={styles.chartLabel}>{day.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Répartition des catégories */}
                <div className={`${styles.chartCard} glass-card`}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Répartition par Catégorie</h3>
                  <div className={styles.pieList}>
                    {Object.values(categorySummary).map((cat) => (
                      <div key={cat.name} className={styles.pieItem}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className={styles.pieCategoryColor} style={{ backgroundColor: cat.color }}></span>
                          <span style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                        </div>
                        <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>{cat.count} produit(s)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Commandes récentes */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 className={styles.cardTitle}>
                  Ventes récentes
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                    Cliquez sur une ligne pour inspecter la commande
                  </span>
                </h3>
                {loadingOrders ? (
                  <p>Chargement des ventes...</p>
                ) : orders.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>Aucune commande enregistrée pour le moment.</p>
                ) : (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.th}>Réf</th>
                          <th className={styles.th}>Client</th>
                          <th className={styles.th}>Date</th>
                          <th className={styles.th}>Paiement</th>
                          <th className={styles.th}>Montant</th>
                          <th className={styles.th}>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr
                            key={order.id}
                            className={styles.tr}
                            onClick={() => setInspectingOrder(order)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td className={styles.td}>{order.payment.reference}</td>
                            <td className={styles.td}>{order.customer.firstName} {order.customer.lastName}</td>
                            <td className={styles.td}>{new Date(order.date).toLocaleDateString('fr-FR')}</td>
                            <td className={styles.td} style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>
                              {order.payment.method === 'momo'
                                ? `MOMO (${order.payment.provider})`
                                : order.payment.method === 'direct_transfer'
                                ? `MM Direct (${order.payment.provider.replace('transfert_direct_', '')})`
                                : order.payment.method === 'bank_transfer'
                                ? 'Virement Bancaire'
                                : order.payment.method === 'external_gateway'
                                ? `Gateway (${order.payment.provider})`
                                : 'CARTE'}
                            </td>
                            <td className={styles.td} style={{ fontWeight: 'bold' }}>{formatPrice(order.total)}</td>
                            <td className={styles.td}>
                              <span className={`${styles.statusBadge} ${
                                order.status === 'delivered' ? styles.statusDelivered :
                                order.status === 'shipped' ? styles.statusShipped :
                                order.status === 'canceled' ? styles.statusCanceled :
                                order.status === 'pending_verification' ? styles.statusPending : styles.statusPending
                              }`} style={order.status === 'pending_verification' ? { background: 'rgba(245, 158, 11, 0.12)', color: 'var(--warning)' } : {}}>
                                {order.status === 'delivered' ? 'Livré' :
                                 order.status === 'shipped' ? 'Expédié' :
                                 order.status === 'canceled' ? 'Annulé' :
                                 order.status === 'pending_verification' ? 'À Vérifier ⚠️' : 'En attente'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="glass-card animate-fade" style={{ padding: '24px' }}>
              <h3 className={styles.cardTitle}>
                Toutes les Commandes
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                  Cliquez sur une commande pour afficher les options avancées
                </span>
              </h3>
              {loadingOrders ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
              ) : orders.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>Aucune commande.</p>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.th}>Réf</th>
                        <th className={styles.th}>Client</th>
                        <th className={styles.th}>Date & Heure</th>
                        <th className={styles.th}>Paiement</th>
                        <th className={styles.th}>Montant</th>
                        <th className={styles.th}>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className={styles.tr}
                          onClick={() => setInspectingOrder(order)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td className={styles.td} style={{ fontWeight: 'bold' }}>{order.payment.reference}</td>
                          <td className={styles.td}>
                            <div>{order.customer.firstName} {order.customer.lastName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{order.customer.email} | {order.customer.phone}</div>
                          </td>
                          <td className={styles.td}>{new Date(order.date).toLocaleString('fr-FR')}</td>
                          <td className={styles.td} style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>
                            {order.payment.method === 'momo'
                              ? `MOMO (${order.payment.provider})`
                              : order.payment.method === 'direct_transfer'
                              ? `MM Direct (${order.payment.provider.replace('transfert_direct_', '')})`
                              : order.payment.method === 'bank_transfer'
                              ? 'Virement Bancaire'
                              : order.payment.method === 'external_gateway'
                              ? `Gateway (${order.payment.provider})`
                              : 'CARTE'}
                          </td>
                          <td className={styles.td} style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{formatPrice(order.total)}</td>
                          <td className={styles.td}>
                            <span className={`${styles.statusBadge} ${
                              order.status === 'delivered' ? styles.statusDelivered :
                              order.status === 'shipped' ? styles.statusShipped :
                              order.status === 'canceled' ? styles.statusCanceled :
                              order.status === 'pending_verification' ? styles.statusPending : styles.statusPending
                            }`} style={order.status === 'pending_verification' ? { background: 'rgba(245, 158, 11, 0.12)', color: 'var(--warning)' } : {}}>
                              {order.status === 'delivered' ? 'Livré' :
                               order.status === 'shipped' ? 'Expédié' :
                               order.status === 'canceled' ? 'Annulé' :
                               order.status === 'pending_verification' ? 'À Vérifier ⚠️' : 'En attente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: PRODUCTS */}
          {activeTab === 'products' && (
            <div className={`${styles.productRow} animate-fade`}>
              {/* Liste de gauche */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 className={styles.cardTitle}>Inventaire des Produits</h3>
                {loadingProducts ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
                ) : (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.th}>Image</th>
                          <th className={styles.th}>Nom</th>
                          <th className={styles.th}>Catégorie</th>
                          <th className={styles.th}>Prix</th>
                          <th className={styles.th}>Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className={styles.tr}>
                            <td className={styles.td}>
                              <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                            </td>
                            <td className={styles.td} style={{ fontWeight: '600' }}>{product.name}</td>
                            <td className={styles.td}>{product.category}</td>
                            <td className={styles.td}>{formatPrice(product.price)}</td>
                            <td className={styles.td}>
                              <span style={{
                                color: product.stock <= 0 ? 'var(--error)' : product.stock < 5 ? 'var(--warning)' : 'inherit',
                                fontWeight: product.stock < 5 ? 'bold' : 'normal'
                              }}>
                                {product.stock} u.
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Formulaire d'ajout de droite avec aperçu d'image en direct */}
              <div className={`${styles.formCard} glass-card`}>
                <h3 className={styles.cardTitle}>Ajouter un Produit</h3>
                <form onSubmit={handleProductSubmit} className={styles.formGrid}>
                  <div className="input-group">
                    <label className="input-label">Nom du produit *</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Prix (FCFA) *</label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Catégorie *</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="input-field"
                      style={{ background: 'rgba(0,0,0,0.2)' }}
                    >
                      <option value="Électronique">Électronique</option>
                      <option value="Mode & Accessoires">Mode & Accessoires</option>
                      <option value="Horlogerie">Horlogerie</option>
                      <option value="Électroménager">Électroménager</option>
                      <option value="Général">Général</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">URL de l'image (optionnel)</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={newProduct.image}
                      onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  {/* Aperçu en direct de l'image du produit */}
                  <div className="input-group">
                    <label className="input-label">Aperçu de l'image</label>
                    <div className={styles.imagePreviewContainer}>
                      {newProduct.image ? (
                        <img
                          src={newProduct.image}
                          alt="Aperçu du produit"
                          className={styles.previewImg}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className={styles.previewPlaceholder}>Aucun aperçu disponible</span>
                      )}
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Stock Initial *</label>
                    <input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Description</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="input-field"
                      rows={2}
                      style={{ resize: 'none' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingProduct}
                    className="gradient-button styles.submitBtn"
                    style={{ padding: '12px', borderRadius: '8px', fontWeight: 'bold' }}
                  >
                    {submittingProduct ? 'Ajout...' : 'Ajouter le Produit'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
