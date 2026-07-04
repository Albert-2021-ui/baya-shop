'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import { jsPDF } from 'jspdf';
import styles from './ClientSidebar.module.css';

export default function ClientSidebar() {
  const {
    isSidebarOpen,
    closeSidebar,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    clientProfile,
    saveClientProfile,
    customerOrders,
    loyaltyPoints,
    loadClientData
  } = useApp();

  const [activeTab, setActiveTab] = useState('profile'); // profile, orders, loyalty
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });

  // Admin login internal states
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Sync profile local state when context loads
  useEffect(() => {
    if (clientProfile) {
      setProfileForm(clientProfile);
    }
  }, [clientProfile]);

  // Keep client data fresh when sidebar is opened
  useEffect(() => {
    if (isSidebarOpen) {
      loadClientData();
    }
  }, [isSidebarOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    saveClientProfile(profileForm);
    alert('Profil client enregistré avec succès !');
  };

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        loginAdmin();
        setAdminUsername('');
        setAdminPassword('');
        setShowAdminLogin(false);
        alert('Connexion administrateur réussie ! Le bouton Admin est désormais actif dans le menu.');
      } else {
        setLoginError(data.error || 'Erreur lors de la connexion.');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Impossible de contacter le serveur.');
    } finally {
      setIsLoggingIn(false);
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

  // PDF Generation (copied from page.js logic for consistency)
  const generateInvoicePDF = (order) => {
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
    const payment = order.payment || {};
    doc.text(payment.reference || 'N/A', 150, 52);
    doc.text(new Date(order.date).toLocaleDateString('fr-FR'), 150, 58);
    
    const paymentLabel = payment.method === 'momo'
      ? `Mobile Money (${(payment.provider || '').toUpperCase()})`
      : payment.method === 'direct_transfer'
      ? 'Transfert Mobile Money Direct'
      : 'Carte Bancaire';
    doc.text(paymentLabel, 150, 63);

    doc.setDrawColor(220, 220, 220);
    doc.line(20, 75, 190, 75);

    doc.setFont('helvetica', 'bold');
    doc.text('Facturé à :', 20, 85);
    doc.setFont('helvetica', 'normal');
    const customer = order.customer || {};
    doc.text(`${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A', 20, 91);
    doc.text(customer.email || 'N/A', 20, 96);
    doc.text(customer.phone || 'N/A', 20, 101);
    doc.text(`${customer.address || ''}, ${customer.city || ''}`.replace(/^, |, $/, '') || 'N/A', 20, 106);

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
    
    (order.items || []).forEach((item) => {
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

    doc.save(`Facture_${order.payment.reference}.pdf`);
  };

  // loyalty calculations
  const loyaltyLevel = loyaltyPoints >= 500 ? 'Or 🌟' : loyaltyPoints >= 100 ? 'Argent 🥈' : 'Bronze 🥉';
  const nextLevelPoints = loyaltyPoints >= 500 ? 1000 : loyaltyPoints >= 100 ? 500 : 100;
  const progressPercent = Math.min(100, (loyaltyPoints / nextLevelPoints) * 100);

  const cardMemberName = profileForm.firstName || profileForm.lastName 
    ? `${profileForm.firstName} ${profileForm.lastName}`.toUpperCase() 
    : 'CLIENT PRIVILÉGIÉ';

  return (
    <>
      {/* Sidebar Overlay background */}
      <div 
        className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.showOverlay : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar Navigation Panel */}
      <aside className={`${styles.clientSidebar} ${isSidebarOpen ? styles.openSidebar : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brandTitle}>
            BAYA <span className={styles.brandAccent}>SHOP</span>
          </div>
          <button onClick={closeSidebar} className={styles.sidebarCloseBtn} aria-label="Fermer">
            &times;
          </button>
        </div>

        {/* User Mini Greeting */}
        <div className={styles.userMiniProfile}>
          <div className={styles.userAvatar}>
            {profileForm.firstName ? profileForm.firstName.charAt(0).toUpperCase() : '👤'}
          </div>
          <div className={styles.userMeta}>
            <span className={styles.userWelcome}>Bonjour,</span>
            <span className={styles.userName}>
              {profileForm.firstName ? `${profileForm.firstName} ${profileForm.lastName}` : 'Cher Client'}
            </span>
            <span className={`${styles.loyaltyBadge} ${styles[loyaltyLevel.split(' ')[0].toLowerCase()]}`}>
              Membre {loyaltyLevel}
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <nav className={styles.sidebarTabs}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`${styles.sidebarTab} ${activeTab === 'profile' ? styles.tabActive : ''}`}
          >
            <span className={styles.tabIcon}>👤</span> Mon Profil
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`${styles.sidebarTab} ${activeTab === 'orders' ? styles.tabActive : ''}`}
          >
            <span className={styles.tabIcon}>📦</span> Mes Factures ({customerOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`${styles.sidebarTab} ${activeTab === 'loyalty' ? styles.tabActive : ''}`}
          >
            <span className={styles.tabIcon}>✨</span> Ma Carte VIP
          </button>
        </nav>

        {/* Tab Contents */}
        <div className={styles.sidebarContent}>
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className={styles.sidebarForm}>
              <h3 className={styles.sectionTitle}>Mes Coordonnées</h3>
              <p className={styles.sectionSubtitle}>
                Enregistrez vos coordonnées pour commander en 1 clic !
              </p>
              
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={handleInputChange}
                    placeholder="Prénom"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileForm.lastName}
                    onChange={handleInputChange}
                    placeholder="Nom"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Adresse E-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleInputChange}
                    placeholder="adresse@mail.com"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Numéro Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleInputChange}
                    placeholder="Ex: 0707070707"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Adresse Livraison</label>
                  <input
                    type="text"
                    name="address"
                    value={profileForm.address}
                    onChange={handleInputChange}
                    placeholder="Ex: Cocody, Rue des Jardins"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Ville</label>
                  <input
                    type="text"
                    name="city"
                    value={profileForm.city}
                    onChange={handleInputChange}
                    placeholder="Abidjan"
                  />
                </div>
              </div>

              <button type="submit" className={styles.saveProfileBtn}>
                Enregistrer les modifications
              </button>
            </form>
          )}

          {activeTab === 'orders' && (
            <div className={styles.ordersSection}>
              <h3 className={styles.sectionTitle}>Historique des Commandes</h3>
              {customerOrders.length === 0 ? (
                <div className={styles.emptyOrders}>
                  <p>Aucune facture disponible.</p>
                  <p className={styles.emptyOrdersSub}>Vos achats apparaîtront ici dès confirmation de paiement.</p>
                </div>
              ) : (
                <div className={styles.ordersList}>
                  {customerOrders
                    .filter((order) => order && order.payment)
                    .map((order) => (
                    <div key={order.id || Math.random()} className={styles.orderCard}>
                      <div className={styles.orderCardHeader}>
                        <span className={styles.orderRef}>{order.payment?.reference || 'N/A'}</span>
                        <span className={styles.orderStatusBadge}>
                          {order.status === 'delivered' ? 'Livré' : 'En cours'}
                        </span>
                      </div>
                      <div className={styles.orderCardBody}>
                        <div className={styles.orderDetailRow}>
                          <span className={styles.orderDate}>
                            {order.date ? new Date(order.date).toLocaleDateString('fr-FR') : 'N/A'}
                          </span>
                          <span className={styles.orderPrice}>{formatPrice(order.total || 0)}</span>
                        </div>
                        <button
                          onClick={() => generateInvoicePDF(order)}
                          className={styles.pdfDownloadBtn}
                        >
                          Télécharger Facture PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'loyalty' && (
            <div className={styles.loyaltySection}>
              <h3 className={styles.sectionTitle}>Club Fidélité Privé</h3>
              
              {/* Virtual Golden VIP Card */}
              <div className={styles.vipCard}>
                <div className={styles.vipCardBgOverlay} />
                <div className={styles.vipCardHeader}>
                  <span className={styles.vipCardBrand}>BAYA VIP CLUB</span>
                  <div className={styles.vipCardChip} />
                </div>
                <div className={styles.vipCardNumber}>
                  8888 7777 0000 {String(loyaltyPoints).padStart(4, '0')}
                </div>
                <div className={styles.vipCardFooter}>
                  <div className={styles.vipCardHolder}>
                    <span className={styles.cardLabel}>Titulaire</span>
                    <span className={styles.cardVal}>{cardMemberName}</span>
                  </div>
                  <div className={styles.vipCardPoints}>
                    <span className={styles.cardLabel}>Points Baya</span>
                    <span className={styles.cardVal}>{loyaltyPoints} PTS</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar and Tier info */}
              <div className={styles.tierInfoBox}>
                <div className={styles.tierGrid}>
                  <div>
                    <span className={styles.tierLabel}>Niveau Actuel :</span>
                    <span className={styles.tierName}>{loyaltyLevel}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={styles.tierLabel}>Prochain Palier :</span>
                    <span className={styles.tierName}>{nextLevelPoints} pts</span>
                  </div>
                </div>
                
                <div className={styles.progressBarContainer}>
                  <div className={styles.progressBar} style={{ width: `${progressPercent}%` }} />
                </div>
                <p className={styles.loyaltyExplain}>
                  Vous gagnez 1 point fidélité par tranche de 1 000 FCFA d'achat. Vos points débloquent des remises exclusives lors de vos futurs achats !
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Admin Connection Area */}
        <div className={styles.sidebarFooter}>
          {isAdminLoggedIn ? (
            <div className={styles.adminStatusBox}>
              <div className={styles.adminGreeting}>
                <span className={styles.adminPulse} />
                <span>Admin Connecté ({process.env.NEXT_PUBLIC_ADMIN_NAME || 'Albert'})</span>
              </div>
              <div className={styles.adminActions}>
                <a href="/admin" onClick={closeSidebar} className={styles.adminDashboardLink}>
                  Accéder au Dashboard
                </a>
                <button onClick={logoutAdmin} className={styles.adminLogoutBtn} title="Se déconnecter">
                  Déconnexion
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.adminLoginArea}>
              {!showAdminLogin ? (
                <button 
                  onClick={() => setShowAdminLogin(true)} 
                  className={styles.triggerLoginBtn}
                >
                  <span className={styles.lockIcon}>🔒</span> Accès Administrateur
                </button>
              ) : (
                <form onSubmit={handleAdminLoginSubmit} className={styles.adminLoginForm}>
                  <div className={styles.adminFormHeader}>
                    <span>Connexion Albert Admin</span>
                    <button 
                      type="button" 
                      onClick={() => { setShowAdminLogin(false); setLoginError(''); }}
                      className={styles.cancelLoginBtn}
                    >
                      Annuler
                    </button>
                  </div>
                  {loginError && <div className={styles.loginFormError}>⚠️ {loginError}</div>}
                  <div className={styles.loginFields}>
                    <input
                      type="text"
                      placeholder="Identifiant"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Mot de passe"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                    <button type="submit" disabled={isLoggingIn}>
                      {isLoggingIn ? 'Validation...' : 'Connexion'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
